import { create } from 'zustand';
import { persist, createJSONStorage, type PersistStorage, type StorageValue } from 'zustand/middleware';
import { type Product, type CartItem } from '@shared/schema';
import { db, auth } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * The cart is stored locally in a flat (denormalized) shape so it can render
 * instantly without an extra Firestore round-trip. The denormalized fields are
 * a *snapshot at time of addition* — they MUST be revalidated against the
 * authoritative product document before being used to place an order.
 *
 * @see useCartValidation, reconcileCart
 */
export interface LocalCartItem {
  id: number | string;
  productId: string;
  quantity: number;
  userId: string | null;
  sessionId: string | null;
  name: string;
  price: number;
  profit: number;
  images: string[];
  category?: string;
  slug: string;
  selectedVariant: Record<string, string>;
}

export type CartReconcileUpdate =
  | { productId: string; action: 'update'; price: number; stock?: number; name?: string; images?: string[]; slug?: string }
  | { productId: string; action: 'remove' };

interface CartState {
  items: LocalCartItem[];
  /** Wall-clock timestamp of the last successful reconcile against Firestore. */
  reconciledAt: number | null;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  /**
   * Apply a batch of authoritative product updates to the persisted cart.
   * Used by `useCartValidation` after fetching the live product documents.
   */
  reconcileCart: (updates: CartReconcileUpdate[]) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  syncWithFirebase: (userId: string) => Promise<void>;
  syncToFirebase: (items: LocalCartItem[]) => Promise<void>;
}

const PERSIST_VERSION = 1;
const PERSIST_NAME = 'noorbazaar-cart';

const syncToFirebaseImpl = async (items: LocalCartItem[]): Promise<void> => {
  const user = auth?.currentUser;
  if (!user || !db) return;
  try {
    await setDoc(doc(db, 'users', user.uid, 'cart', 'current'), { items });
  } catch (error) {
    console.error('Error syncing cart to Firebase:', error);
  }
};

/**
 * Coerce a value that may have been persisted under an older schema into a
 * valid LocalCartItem. Returns null when the item is too malformed to keep.
 */
const coerceLegacyItem = (raw: unknown): LocalCartItem | null => {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;

  const productId =
    typeof item.productId === 'string'
      ? item.productId
      : typeof item.productId === 'number'
        ? String(item.productId)
        : null;
  if (!productId) return null;

  const price = Number(item.price);
  const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
  if (!Number.isFinite(price) || price < 0) return null;

  const images = Array.isArray(item.images)
    ? (item.images.filter((i) => typeof i === 'string') as string[])
    : [];

  const selectedVariant =
    item.selectedVariant && typeof item.selectedVariant === 'object'
      ? (item.selectedVariant as Record<string, string>)
      : {};

  return {
    id: typeof item.id === 'number' || typeof item.id === 'string' ? item.id : Date.now(),
    productId,
    quantity,
    userId: typeof item.userId === 'string' ? item.userId : null,
    sessionId: typeof item.sessionId === 'string' ? item.sessionId : null,
    name: typeof item.name === 'string' ? item.name : 'Product',
    price,
    profit: Number(item.profit) || 0,
    images,
    category: typeof item.category === 'string' ? item.category : undefined,
    slug: typeof item.slug === 'string' ? item.slug : '',
    selectedVariant,
  };
};

/**
 * Custom storage that gracefully recovers from corrupted localStorage payloads
 * (e.g. partially-written JSON, or values written by an older incompatible
 * build). Without this, a single bad write would crash the entire app on load.
 */
const safeJSONStorage: PersistStorage<Pick<CartState, 'items' | 'reconciledAt'>> = {
  getItem: (name) => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(name) : null;
      if (!raw) return null;
      return JSON.parse(raw) as StorageValue<Pick<CartState, 'items' | 'reconciledAt'>>;
    } catch (error) {
      console.warn(`Cart persist: corrupted payload for "${name}", resetting.`, error);
      try {
        window.localStorage.removeItem(name);
      } catch {
        /* ignore */
      }
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      window.localStorage.setItem(name, JSON.stringify(value));
    } catch (error) {
      console.warn(`Cart persist: failed to write "${name}".`, error);
    }
  },
  removeItem: (name) => {
    try {
      window.localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      reconciledAt: null,

      syncToFirebase: syncToFirebaseImpl,

      addToCart: (product, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find((item) => item.productId === product.id);
        let newItems: LocalCartItem[];

        if (existingItem) {
          newItems = items.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + quantity, price: product.price }
              : item
          );
        } else {
          const productAny = product as Product & {
            category?: string;
            selectedVariant?: Record<string, string>;
          };
          newItems = [
            ...items,
            {
              id: Math.floor(Math.random() * 1_000_000),
              productId: product.id,
              quantity,
              userId: null,
              sessionId: null,
              name: product.name,
              price: product.price,
              profit: product.profit ?? 0,
              images: product.images ?? [],
              category: productAny.category,
              slug: product.slug,
              selectedVariant: productAny.selectedVariant ?? {},
            },
          ];
        }
        set({ items: newItems });
        void syncToFirebaseImpl(newItems);
      },

      removeFromCart: (productId) => {
        const newItems = get().items.filter((item) => item.productId !== productId);
        set({ items: newItems });
        void syncToFirebaseImpl(newItems);
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return;
        const newItems = get().items.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        );
        set({ items: newItems });
        void syncToFirebaseImpl(newItems);
      },

      clearCart: () => {
        set({ items: [], reconciledAt: Date.now() });
        void syncToFirebaseImpl([]);
      },

      reconcileCart: (updates) => {
        if (updates.length === 0) {
          set({ reconciledAt: Date.now() });
          return;
        }

        const removeIds = new Set(
          updates.filter((u) => u.action === 'remove').map((u) => u.productId)
        );
        const updateMap = new Map<string, Extract<CartReconcileUpdate, { action: 'update' }>>();
        for (const u of updates) {
          if (u.action === 'update') updateMap.set(u.productId, u);
        }

        const items = get().items;
        const next: LocalCartItem[] = [];
        let mutated = false;

        for (const item of items) {
          if (removeIds.has(item.productId)) {
            mutated = true;
            continue;
          }
          const upd = updateMap.get(item.productId);
          if (!upd) {
            next.push(item);
            continue;
          }
          // Clamp quantity to live stock when known.
          const maxQty = typeof upd.stock === 'number' && upd.stock > 0 ? upd.stock : item.quantity;
          const quantity = Math.min(item.quantity, maxQty);
          const merged: LocalCartItem = {
            ...item,
            price: upd.price,
            quantity,
            name: upd.name ?? item.name,
            images: upd.images ?? item.images,
            slug: upd.slug ?? item.slug,
          };
          if (
            merged.price !== item.price ||
            merged.quantity !== item.quantity ||
            merged.name !== item.name ||
            merged.slug !== item.slug
          ) {
            mutated = true;
          }
          next.push(merged);
        }

        set({ items: next, reconciledAt: Date.now() });
        if (mutated) void syncToFirebaseImpl(next);
      },

      syncWithFirebase: async (userId) => {
        if (!db) return;
        try {
          const cartRef = doc(db, 'users', userId, 'cart', 'current');
          const cartDoc = await getDoc(cartRef);

          if (cartDoc.exists()) {
            const rawCloud = (cartDoc.data().items ?? []) as unknown[];
            const cloudItems = rawCloud
              .map(coerceLegacyItem)
              .filter((i): i is LocalCartItem => i !== null);
            const localItems = get().items;

            const mergedItems: LocalCartItem[] = [...localItems];
            cloudItems.forEach((cloudItem) => {
              const existingIndex = mergedItems.findIndex(
                (item) => item.productId === cloudItem.productId
              );
              if (existingIndex > -1) {
                mergedItems[existingIndex] = {
                  ...mergedItems[existingIndex],
                  quantity: Math.max(mergedItems[existingIndex].quantity, cloudItem.quantity),
                };
              } else {
                mergedItems.push(cloudItem);
              }
            });

            set({ items: mergedItems });
            await setDoc(cartRef, { items: mergedItems });
          } else if (get().items.length > 0) {
            await setDoc(cartRef, { items: get().items });
          }
        } catch (error) {
          console.error('Error syncing with Firebase:', error);
        }
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: PERSIST_NAME,
      version: PERSIST_VERSION,
      storage: createJSONStorage(() => safeJSONStorage as unknown as Storage),
      partialize: (state) => ({ items: state.items, reconciledAt: state.reconciledAt }),
      migrate: (persistedState, version) => {
        // v0 → v1: normalise items, drop malformed entries, add reconciledAt.
        const state = (persistedState ?? {}) as {
          items?: unknown[];
          reconciledAt?: number | null;
        };
        const rawItems = Array.isArray(state.items) ? state.items : [];
        const items = rawItems
          .map(coerceLegacyItem)
          .filter((i): i is LocalCartItem => i !== null);
        if (version < PERSIST_VERSION) {
          return {
            items,
            reconciledAt:
              typeof state.reconciledAt === 'number' ? state.reconciledAt : null,
          };
        }
        return { items, reconciledAt: state.reconciledAt ?? null };
      },
    }
  )
);

// Helper for total calculation against an authoritative product list.
export const calculateTotal = (items: LocalCartItem[], products: Product[]): number => {
  return items.reduce((total, item) => {
    const product = products.find((p) => p.id === item.productId);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
};

// Re-export the canonical CartItem schema type for downstream consumers.
export type { CartItem };
