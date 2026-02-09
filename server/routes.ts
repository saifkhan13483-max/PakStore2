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

  // GET /api/products
  app.get("/api/products", async (req, res) => {
    try {
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const lastVisibleId = req.query.lastVisibleId as string || null;

      const { products: firebaseProducts, lastVisibleId: nextLastVisibleId } = 
        await productService.getAllProducts(pageSize, lastVisibleId as any);

      res.json({
        products: firebaseProducts,
        lastVisibleId: nextLastVisibleId
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
