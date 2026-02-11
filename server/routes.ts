import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertCommentSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  app.post("/api/orders", async (req, res) => {
    try {
      console.log("Received order request body:", JSON.stringify(req.body, null, 2));
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      console.log("Order created successfully:", order.id);
      res.json(order);
    } catch (error: any) {
      console.error("Order creation error details:", error);
      // If it's a Zod error, provide more details
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          message: "Validation failed", 
          details: error.errors 
        });
      }
      res.status(400).json({ 
        message: error.message || "Failed to create order",
        details: error.toString(),
        stack: error.stack
      });
    }
  });

  app.get("/api/orders", async (_req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error: any) {
      console.error("DEBUG Fetch Orders Error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products/:productId/comments", async (req, res) => {
    try {
      const comments = await storage.getComments(req.params.productId);
      res.json(comments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/products/:productId/comments", async (req, res) => {
    try {
      const commentData = insertCommentSchema.parse({
        ...req.body,
        productId: req.params.productId
      });
      const comment = await storage.createComment(commentData);
      res.json(comment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
