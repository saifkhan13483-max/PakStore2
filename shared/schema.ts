import { z } from "zod";

/**
 * Firestore Utility Schemas
 */

// Firestore Timestamp schema
export const firestoreTimestampSchema = z.object({
  seconds: z.number(),
  nanoseconds: z.number(),
}).or(z.date()).or(z.string());

// Firestore Document ID schema
export const documentIdSchema = z.string().min(1).max(128).refine(
  (id) => !id.includes('.') && !id.startsWith('__'),
  { message: "Invalid Firestore document ID" }
);

// Base Firestore Document schema
export const baseDocumentSchema = z.object({
  id: documentIdSchema,
  createdAt: firestoreTimestampSchema,
  updatedAt: firestoreTimestampSchema,
});

/**
 * Core Entity Schemas (Part 6.5 & 6.6)
 */

export const productSchema = baseDocumentSchema.extend({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  longDescription: z.string().optional(),
  price: z.number().positive(),
  originalPrice: z.number().nullable().optional(),
  images: z.array(z.string()),
  categoryId: documentIdSchema, // Reference to category doc ID (Part 6.6)
  inStock: z.boolean(),
  active: z.boolean().default(true),
  rating: z.union([z.string(), z.number()]).optional(),
  reviewCount: z.number().default(0),
  features: z.array(z.string()).optional(),
  specifications: z.record(z.any()).optional(),
  stock: z.number().int().nonnegative().optional(),
});

export const categorySchema = baseDocumentSchema.extend({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  parentCategoryId: documentIdSchema.nullable().optional(), // Reference to parent category doc ID (Part 6.6)
});

export const parentCategorySchema = baseDocumentSchema.extend({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
});

export const userSchema = z.object({
  uid: z.string(), // Firebase Auth UID
  email: z.string().email(),
  displayName: z.string(),
  photoURL: z.string().url().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  createdAt: firestoreTimestampSchema,
});

// Part 6.6: Embedded Relationship Patterns
export const cartItemSchema = z.object({
  id: z.string(),
  productId: documentIdSchema, // Reference to product
  quantity: z.number().int().positive(),
  // Denormalized product data for consistent read patterns in orders
  product: productSchema.pick({
    name: true,
    price: true,
    images: true,
    slug: true
  }),
});

export const orderSchema = baseDocumentSchema.extend({
  userId: z.string(), // Reference to user uid
  items: z.array(cartItemSchema),
  total: z.coerce.number().positive(),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  customerInfo: z.object({
    fullName: z.string(),
    email: z.string().email(),
    mobileNumber: z.string(),
  }),
  shippingAddress: z.object({
    street: z.string(),
    area: z.string(),
    city: z.string(),
  }),
});

export const commentSchema = baseDocumentSchema.extend({
  productId: documentIdSchema,
  userId: z.string(),
  userName: z.string(),
  userPhoto: z.string().optional(),
  content: z.string().min(1),
  rating: z.number().min(1).max(5),
  images: z.array(z.string()).optional(),
});

/**
 * Type Exports (Part 6.7)
 */

export type Product = z.infer<typeof productSchema>;
export type Category = z.infer<typeof categorySchema>;
export type ParentCategory = z.infer<typeof parentCategorySchema>;
export type User = z.infer<typeof userSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type Order = z.infer<typeof orderSchema>;
export type Comment = z.infer<typeof commentSchema>;

export type InsertProduct = z.infer<typeof productSchema>;
export const insertProductSchema = productSchema.omit({ id: true, createdAt: true, updatedAt: true });

export type InsertCategory = z.infer<typeof categorySchema>;
export const insertCategorySchema = categorySchema.omit({ id: true, createdAt: true, updatedAt: true });

export type InsertParentCategory = z.infer<typeof parentCategorySchema>;
export const insertParentCategorySchema = parentCategorySchema.omit({ id: true, createdAt: true, updatedAt: true });

export type InsertUser = z.infer<typeof userSchema>;
export const insertUserSchema = userSchema.omit({ uid: true, createdAt: true });

export type InsertOrder = z.infer<typeof orderSchema>;
export const insertOrderSchema = orderSchema.omit({ id: true, createdAt: true, updatedAt: true });

export type InsertComment = z.infer<typeof commentSchema>;
export const insertCommentSchema = commentSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phoneNumber: z
    .string()
    .regex(/^((\+92)|(0092))-{0,1}\d{3}-{0,1}\d{7}$|^\d{11}$|^\d{4}-\d{7}$/, "Invalid Pakistani phone number format"),
  city: z.string().min(1, "City is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  emergencyContact: z.string().optional(),
});

export const checkoutInfoSchema = profileSchema;
export type CheckoutInfo = z.infer<typeof profileSchema>;

/**
 * UI & Form Validation Schemas
 */

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

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
