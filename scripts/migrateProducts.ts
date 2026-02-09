import { productService } from "../server/services/productService";
import { db as firebaseDb } from "../server/config/firebase";
import { products } from "../shared/schema";
import express from "express";

// Mocking pgDb if it doesn't exist to prevent LSP errors during structure setup
const pgDb: any = {}; 

async function migrateProducts() {
  console.log("Starting products migration...");
  try {
    // 1. Read all products from PostgreSQL
    // In this specific setup, the products might be using serial IDs.
    // For Firestore, we might want to keep the same IDs or let Firestore generate them.
    // Given the productService uses doc() IDs, we'll transform them.
    
    const allProducts = await pgDb.select().from(products);
    console.log(`Found ${allProducts.length} products in PostgreSQL.`);

    const batch = firebaseDb.batch();
    const collection = firebaseDb.collection("products");

    for (const product of allProducts) {
      const docRef = collection.doc(product.slug); // Using slug as ID for better SEO/lookup
      
      const firestoreData = {
        ...product,
        id: product.slug,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      batch.set(docRef, firestoreData);
      console.log(`Prepared migration for product: ${product.name}`);
    }

    await batch.commit();
    console.log("Products migration completed successfully!");
  } catch (error) {
    console.error("Error during products migration:", error);
  }
}

// Check if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateProducts().then(() => process.exit(0)).catch(() => process.exit(1));
}

export { migrateProducts };
