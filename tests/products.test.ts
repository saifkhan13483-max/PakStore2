import request from "supertest";
import express from "express";
import { registerRoutes } from "../server/routes";
import { createServer } from "http";

// Mock Firebase Admin
jest.mock("../server/config/firebase", () => ({
  db: {
    collection: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({
      empty: false,
      docs: [{
        data: () => ({
          id: "test-product",
          name: "Test Product",
          slug: "test-product",
          price: 1000
        })
      }]
    })
  },
  firebaseInitialized: true
}));

describe("GET /api/products/:slug", () => {
  let app: express.Express;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    const httpServer = createServer(app);
    await registerRoutes(httpServer, app);
  });

  it("should return product details from Firestore when slug matches", async () => {
    const response = await request(app).get("/api/products/test-product");
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("slug", "test-product");
    expect(response.body).toHaveProperty("name", "Test Product");
  });

  it("should return 404 when product is not found", async () => {
    const { db } = require("../server/config/firebase");
    db.get.mockResolvedValueOnce({ empty: true });

    const response = await request(app).get("/api/products/non-existent");
    expect(response.status).toBe(404);
  });
});
