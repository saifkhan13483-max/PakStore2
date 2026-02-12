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

export type InsertProduct = Omit<Product, "id">;
export type InsertCategory = Omit<Category, "id">;
export type InsertParentCategory = Omit<ParentCategory, "id">;
