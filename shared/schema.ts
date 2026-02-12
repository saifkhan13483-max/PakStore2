export interface Product {
  id: string | number;
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  originalPrice?: number | null;
  images: string[];
  categoryId: string | number;
  inStock: boolean;
  active?: boolean;
  rating?: string | number;
  reviewCount?: number;
  features?: string[];
  specifications?: Record<string, any>;
  stock?: number;
}

export interface Category {
  id: string | number;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  parentCategoryId?: string | number | null;
}

export interface ParentCategory {
  id: string | number;
  slug: string;
  name: string;
  description?: string;
  image?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
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

export type InsertProduct = Omit<Product, "id">;
export type InsertCategory = Omit<Category, "id">;
export type InsertParentCategory = Omit<ParentCategory, "id">;
export type InsertUser = Omit<User, "id">;
export type InsertOrder = Omit<Order, "id">;
