import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  startAfter,
  QueryConstraint
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type Product, type InsertProduct, insertProductSchema } from "@shared/schema";

const COLLECTION_NAME = "products";
const productsRef = collection(db, COLLECTION_NAME);

export interface ProductFilters {
  category?: string;
  search?: string;
  sortBy?: "price-asc" | "price-desc" | "newest";
  limit?: number;
  startAfterDoc?: any;
}

export const productFirestoreService = {
  async getAllProducts(filters: ProductFilters = {}) {
    try {
      const constraints: QueryConstraint[] = [];
      if (filters.category) constraints.push(where("categoryId", "==", filters.category));
      if (filters.sortBy) {
        if (filters.sortBy === "price-asc") constraints.push(orderBy("price", "asc"));
        else if (filters.sortBy === "price-desc") constraints.push(orderBy("price", "desc"));
        else constraints.push(orderBy("createdAt", "desc"));
      } else {
        constraints.push(orderBy("createdAt", "desc"));
      }
      if (filters.limit) constraints.push(limit(filters.limit));
      if (filters.startAfterDoc) constraints.push(startAfter(filters.startAfterDoc));

      const q = query(productsRef, ...constraints);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error: any) {
      console.error("Error getting products:", error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  },

  async getProductById(productId: string) {
    const docRef = doc(db, COLLECTION_NAME, productId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Product not found");
    return { id: docSnap.id, ...docSnap.data() } as Product;
  },

  async createProduct(productData: InsertProduct) {
    try {
      insertProductSchema.parse(productData);
      const docRef = await addDoc(productsRef, {
        ...productData,
        createdAt: new Date(),
        inStock: (productData.stock ?? 0) > 0,
        rating: "0",
        reviewCount: 0
      });
      return { id: docRef.id, ...productData } as Product;
    } catch (error: any) {
      console.error("Error creating product:", error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  },

  async updateProduct(productId: string, updates: Partial<InsertProduct>) {
    const docRef = doc(db, COLLECTION_NAME, productId);
    await updateDoc(docRef, { ...updates, updatedAt: new Date() });
    return { id: productId, ...updates };
  },

  async deleteProduct(productId: string) {
    await deleteDoc(doc(db, COLLECTION_NAME, productId));
    return true;
  }
};
