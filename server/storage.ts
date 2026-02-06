import { db } from "./db";
import { products, type Product, type InsertProduct } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getProduct(slug: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(search?: string): Promise<Product[]> {
    if (search) {
      const lowerSearch = search.toLowerCase();
      const allProducts = await db.select().from(products);
      return allProducts.filter(p => 
        p.name.toLowerCase().includes(lowerSearch) || 
        p.description.toLowerCase().includes(lowerSearch) ||
        (p.category && p.category.toLowerCase().includes(lowerSearch))
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
}

export const storage = new DatabaseStorage();
