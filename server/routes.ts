import type { Express } from "express";
import { type Server } from "http";
import { productService } from "./services/productService";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // GET /api/products/:slug
  app.get("/api/products/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      
      // PostgreSQL code commented out as requested
      /*
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.slug, slug))
        .limit(1);
      */

      const product = await productService.getProductBySlug(slug);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
