import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { insertProductSchema, insertCategorySchema, insertParentCategorySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // All API routes removed as requested.
  // The app now runs with a mock storage on the frontend.
  
  return httpServer;
}
