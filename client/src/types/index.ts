import { type Product, type CartItem, type Category as SharedCategory } from "@shared/schema";

export interface Category extends SharedCategory {
  // Any additional client-specific fields if needed
}

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress: {
    street: string;
    area: string;
    city: string;
  };
}
