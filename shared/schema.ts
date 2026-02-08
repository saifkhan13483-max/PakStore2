import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  longDescription: text("long_description"),
  price: integer("price").notNull(),
  originalPrice: integer("original_price"),
  images: text("images").array(),
  category: text("category").notNull(),
  inStock: boolean("in_stock").default(true),
  rating: text("rating").default("0"),
  reviewCount: integer("review_count").default(0),
  features: text("features").array(),
  specifications: jsonb("specifications"),
});

export const insertProductSchema = createInsertSchema(products);

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  userId: text("user_id"), // For guest/hybrid auth later
  sessionId: text("session_id"),
});

export const insertCartItemSchema = createInsertSchema(cartItems);
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export const checkoutInfoSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters").regex(/^[a-zA-Z\s]+$/, "Only letters and spaces are allowed"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+92\d{10}$/, "Mobile number must follow Pakistani format (+92 followed by 10 digits)"),
  address: z.string().min(10, "Complete street address must be at least 10 characters"),
  area: z.string().min(3, "Area/Locality is required"),
  city: z.string().min(1, "Please select a city"),
});

export type CheckoutInfo = z.infer<typeof checkoutInfoSchema>;
