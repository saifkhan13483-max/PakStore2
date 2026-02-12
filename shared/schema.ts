import { z } from "zod";

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
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  createdAt: string;
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

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

export const signupSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .regex(/^[a-zA-Z\s]*$/, "Name can only contain letters and spaces"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Please accept our terms to continue",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phoneNumber: z
    .string()
    .regex(/^((\+92)|(0092))-{0,1}\d{3}-{0,1}\d{7}$|^\d{11}$|^\d{4}-\d{7}$/, "Invalid Pakistani phone number format"),
  city: z.string().min(1, "City is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  emergencyContact: z.string().optional(),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;

export type InsertProduct = Omit<Product, "id">;
export type InsertCategory = Omit<Category, "id">;
export type InsertParentCategory = Omit<ParentCategory, "id">;
export type InsertUser = Omit<User, "uid">;
export type InsertOrder = Omit<Order, "id">;
