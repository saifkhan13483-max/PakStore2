import { pgTable, text, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const parentCategories = pgTable("parent_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  image: text("image"),
});

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  parentId: text("parent_id").references(() => parentCategories.id),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  image: text("image"),
  productCount: integer("product_count").default(0),
});

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  categoryId: text("category_id").references(() => categories.id),
  image: text("image"),
  images: text("images").array(),
  stock: integer("stock").default(0),
  active: boolean("active").default(true),
});

export const insertParentCategorySchema = createInsertSchema(parentCategories);
export const insertCategorySchema = createInsertSchema(categories);
export const insertProductSchema = createInsertSchema(products);

export type ParentCategory = typeof parentCategories.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

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

export type CheckoutInfo = z.infer<typeof checkoutInfoSchema>;
export type CartItem = z.infer<typeof cartItemsSchema>;
