import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Product, type CartItem } from '@shared/schema';
import { db, auth } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface CartState {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  syncWithFirebase: (userId: string) => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      syncToFirebase: async (items: CartItem[]) => {
        const user = auth?.currentUser;
        if (user && db) {
          try {
            await setDoc(doc(db, 'users', user.uid, 'cart', 'current'), { items });
          } catch (error) {
            console.error("Error syncing cart to Firebase:", error);
          }
        }
      },

      addToCart: (product, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find((item) => item.productId === product.id);
        let newItems;

        if (existingItem) {
          newItems = items.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newItems = [
            ...items,
            {
              id: Math.floor(Math.random() * 1000000), // Temporary client-side ID
              productId: product.id,
              quantity,
              userId: null,
              sessionId: null,
              name: product.name,
              price: product.price,
              images: product.images,
              category: product.category,
              slug: product.slug,
            } as any,
          ];
        }
        set({ items: newItems });
        (get() as any).syncToFirebase(newItems);
      },

      removeFromCart: (productId) => {
        const newItems = get().items.filter((item) => item.productId !== productId);
        set({ items: newItems });
        (get() as any).syncToFirebase(newItems);
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return;
        const newItems = get().items.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        );
        set({ items: newItems });
        (get() as any).syncToFirebase(newItems);
      },

      clearCart: () => {
        set({ items: [] });
        (get() as any).syncToFirebase([]);
      },

      syncWithFirebase: async (userId) => {
        if (!db) return;
        try {
          const cartRef = doc(db, 'users', userId, 'cart', 'current');
          const cartDoc = await getDoc(cartRef);
          
          if (cartDoc.exists()) {
            const cloudItems = cartDoc.data().items as CartItem[];
            const localItems = get().items;
            
            // Hybrid Merge Logic
            const mergedItems = [...localItems];
            cloudItems.forEach((cloudItem) => {
              const existingIndex = mergedItems.findIndex((item) => item.productId === cloudItem.productId);
              if (existingIndex > -1) {
                mergedItems[existingIndex].quantity = Math.max(
                  mergedItems[existingIndex].quantity,
                  cloudItem.quantity
                );
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
          console.error("Error syncing with Firebase:", error);
        }
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        const { items } = get();
        return (items as any[]).reduce((total, item) => total + (item.price * item.quantity), 0);
      },
    }),
    {
      name: 'noorbazaar-cart',
    }
  )
);

// Helper for total calculation
export const calculateTotal = (items: CartItem[], products: Product[]) => {
  return items.reduce((total, item) => {
    const product = products.find(p => p.id === item.productId);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
};
