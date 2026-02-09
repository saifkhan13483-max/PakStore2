import type { Express } from "express";
import { type Server } from "http";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // All API routes removed as requested.
  // The app now runs with a mock storage on the frontend.
  
  return httpServer;
}
