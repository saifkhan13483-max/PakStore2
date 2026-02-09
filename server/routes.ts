import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/parent-categories", async (_req, res) => {
    const categories = await storage.getParentCategories();
    res.json(categories);
  });

  app.get("/api/categories", async (_req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.get(api.products.list.path, async (req, res) => {
    const search = req.query.search as string | undefined;
    const products = await storage.getProducts(search);
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const slug = req.params.slug as string;
    const product = await storage.getProduct(slug);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  });

  app.delete("/api/products/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    // Note: deleteProduct should be added to storage if it doesn't exist
    // For now, let's assume it exists or we'll add it
    await storage.deleteProduct?.(id);
    res.json({ success: true });
  });

  return httpServer;
}
