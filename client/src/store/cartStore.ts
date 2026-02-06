import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Product, type CartItem } from '@shared/schema';

interface CartState {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (product, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find((item) => item.productId === product.id);

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                id: Math.floor(Math.random() * 1000000), // Temporary client-side ID
                productId: product.id,
                quantity,
                userId: null,
                sessionId: null,
                // Add fields needed for display in cart
                name: product.name,
                price: product.price,
                images: product.images,
                category: product.category,
                slug: product.slug,
              } as any,
            ],
          });
        }
      },

      removeFromCart: (productId) => {
        set({
          items: get().items.filter((item) => item.productId !== productId),
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        const { items } = get();
        // Since we don't have the full products list in the store, 
        // we'll rely on the price being part of the item if possible,
        // but looking at Cart.tsx, items are mapped from schema.
        // Wait, the CartItem in schema.ts doesn't have price.
        // But the items in useCartStore.addToCart(product) are adding a partial product.
        // Let's fix the addToCart to include price and name if needed, 
        // or just calculate it correctly here if the items have it.
        // Looking at Cart.tsx line 70: {formatPrice(item.price * item.quantity)}
        // This means 'item' in 'items' must have 'price'.
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
