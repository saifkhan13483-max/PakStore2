import { db } from "./db";
import { products, categories, parentCategories, type Product, type InsertProduct, type Category, type ParentCategory, type InsertCategory, type InsertParentCategory } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface AdminStats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getProduct(slug: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  getParentCategories(): Promise<ParentCategory[]>;
  getCategories(): Promise<Category[]>;
  createParentCategory(category: InsertParentCategory): Promise<ParentCategory>;
  createCategory(category: InsertCategory): Promise<Category>;
  deleteProduct(id: number): Promise<void>;
  clearCategories(): Promise<void>;
  getAdminStats(): Promise<AdminStats>;
}

export class DatabaseStorage implements IStorage {
  async getAdminStats(): Promise<AdminStats> {
    const productsCount = await db.select().from(products);
    // Note: In a real app we would have users and orders tables.
    // For now, we'll return some mock data for these since the schema doesn't have them yet.
    return {
      totalProducts: productsCount.length,
      totalUsers: 1240,
      totalOrders: 456,
      totalRevenue: 125000,
    };
  }

  async getProducts(search?: string): Promise<Product[]> {
    if (search) {
      const lowerSearch = search.toLowerCase();
      const allProducts = await db.select().from(products);
      return allProducts.filter(p => 
        p.name.toLowerCase().includes(lowerSearch) || 
        p.description.toLowerCase().includes(lowerSearch)
      );
    }
    return await db.select().from(products);
  }

  async getProduct(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, updateProduct: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products)
      .set(updateProduct)
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async getParentCategories(): Promise<ParentCategory[]> {
    return await db.select().from(parentCategories);
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createParentCategory(category: InsertParentCategory): Promise<ParentCategory> {
    const [result] = await db.insert(parentCategories).values(category).returning();
    return result;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [result] = await db.insert(categories).values(category).returning();
    return result;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async clearCategories(): Promise<void> {
    await db.delete(categories);
    await db.delete(parentCategories);
  }
}

export const storage = new DatabaseStorage();
