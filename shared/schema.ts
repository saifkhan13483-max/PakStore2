import { z } from "zod";

// NoSQL Firestore Schema representation using Zod
export const parentCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  image: z.string().optional(),
});

export const categorySchema = z.object({
  id: z.string(),
  parentId: z.string(),
  name: z.string(),
  slug: z.string(),
  image: z.string().optional(),
  productCount: z.number().default(0),
});

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  longDescription: z.string().optional(),
  price: z.number(),
  originalPrice: z.number().optional().nullable(),
  categoryId: z.string(),
  image: z.string().optional(),
  images: z.array(z.string()).default([]),
  stock: z.number().default(0),
  active: z.boolean().default(true),
  inStock: z.boolean().default(true),
  rating: z.number().default(0),
  reviewCount: z.number().default(0),
  features: z.array(z.string()).default([]),
  specifications: z.record(z.string()).default({}),
});

export const userSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  photoURL: z.string().optional(),
  createdAt: z.string(),
});

export const insertParentCategorySchema = parentCategorySchema.omit({ id: true });
export const insertCategorySchema = categorySchema.omit({ id: true });
export const insertProductSchema = productSchema.omit({ id: true });

export type ParentCategory = z.infer<typeof parentCategorySchema>;
export type Category = z.infer<typeof categorySchema>;
export type Product = z.infer<typeof productSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type User = z.infer<typeof userSchema>;

export const cartItemsSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1),
});

export const checkoutInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  area: z.string().min(1, "Area is required"),
  notes: z.string().optional(),
});

export const orderSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string(),
  address: z.string(),
  city: z.string(),
  area: z.string(),
  notes: z.string().optional(),
  items: z.array(z.any()),
  total: z.number(),
  status: z.string(),
  createdAt: z.string(),
  orderId: z.string(),
});

export const commentSchema = z.object({
  id: z.string(),
  productId: z.string(),
  userId: z.string(),
  userName: z.string(),
  userPhoto: z.string().optional(),
  content: z.string(),
  images: z.array(z.string()).default([]),
  rating: z.number().min(1).max(5),
  createdAt: z.string(),
});

export const insertCommentSchema = commentSchema.omit({ id: true, createdAt: true });

export type Order = z.infer<typeof orderSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type CheckoutInfo = z.infer<typeof checkoutInfoSchema>;
export type CartItem = z.infer<typeof cartItemsSchema>;
export type Comment = z.infer<typeof commentSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
