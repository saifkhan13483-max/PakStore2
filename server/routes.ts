import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertCommentSchema } from "../shared/schema";

export function registerRoutes(app: Express): Server {
  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      console.log("Received order request body:", JSON.stringify(req.body, null, 2));
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      console.log("Order created successfully:", order.id);
      
      // Ensure we always return a clear JSON response
      return res.status(201).json({ 
        success: true, 
        message: "Order placed successfully", 
        orderId: order.orderId,
        id: order.id
      });
    } catch (error: any) {
      console.error("Order creation error details:", error);
      
      // If it's a Zod error, provide more details in a consistent format
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          success: false,
          message: "Validation failed", 
          details: error.errors 
        });
      }
      
      return res.status(500).json({ 
        success: false,
        message: error.message || "Failed to create order",
        details: error.toString()
      });
    }
  });

  app.get("/api/orders", async (_req: Request, res: Response) => {
    try {
      const orders = await storage.getOrders();
      return res.json(orders);
    } catch (error: any) {
      console.error("DEBUG Fetch Orders Error:", error);
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products/:productId/comments", async (req: Request, res: Response) => {
    try {
      const comments = await storage.getComments(req.params.productId);
      return res.json(comments);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/products/:productId/comments", async (req: Request, res: Response) => {
    try {
      const commentData = insertCommentSchema.parse({
        ...req.body,
        productId: req.params.productId
      });
      const comment = await storage.createComment(commentData);
      return res.json(comment);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
