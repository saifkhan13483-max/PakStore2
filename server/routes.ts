import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  app.post("/api/orders", async (req, res) => {
    try {
      console.log("Received order request:", JSON.stringify(req.body, null, 2));
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      console.log("Order created successfully:", order.id);
      res.json(order);
    } catch (error: any) {
      console.error("Order creation error details:", error);
      res.status(400).json({ 
        message: error.message || "Failed to create order",
        details: error.toString()
      });
    }
  });

  app.get("/api/orders", async (_req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
