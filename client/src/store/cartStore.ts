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
              },
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
        // This would ideally fetch prices from a product store/data, 
        // but for now we'll assume the quantity is all we have in the item.
        // In a real app, CartItem might include a price snapshot or we'd join with products.
        return 0; 
      },
    }),
    {
      name: 'noorbazaar-cart',
    }
  )
);
