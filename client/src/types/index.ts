import { type Product, type CartItem } from "@shared/schema";

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
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
