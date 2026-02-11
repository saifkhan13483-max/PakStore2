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
  async getProductsByCategory(categoryId: string) {
    try {
      const q = query(productsRef, where("categoryId", "==", categoryId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error: any) {
      console.error("Error getting products by category:", error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  },

  async getAllProducts(filters: ProductFilters = {}) {
    try {
      const constraints: QueryConstraint[] = [];
      if (filters.category && filters.category !== "all") {
        constraints.push(where("categoryId", "==", filters.category));
      }

      const q = query(productsRef, ...constraints);
      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

      // Client-side sorting and searching if needed, but for now just return all
      // to ensure visibility
      let result = products;

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        result = result.filter(p => 
          (p.name?.toLowerCase() || "").includes(searchLower) ||
          (p.description?.toLowerCase() || "").includes(searchLower)
        );
      }

      if (filters.sortBy) {
        result.sort((a, b) => {
          if (filters.sortBy === "price-asc") return (a.price || 0) - (b.price || 0);
          if (filters.sortBy === "price-desc") return (b.price || 0) - (a.price || 0);
          if (filters.sortBy === "newest") return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          return 0;
        });
      }

      if (filters.limit) {
        result = result.slice(0, filters.limit);
      }

      return result;
    } catch (error: any) {
      console.error("Error getting products:", error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  },

  async getProductBySlug(slug: string) {
    try {
      const q = query(productsRef, where("slug", "==", slug), limit(1));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) throw new Error("Product not found");
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Product;
    } catch (error: any) {
      console.error("Error getting product by slug:", error);
      throw new Error(`Failed to fetch product: ${error.message}`);
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
        rating: productData.rating ?? 0,
        reviewCount: productData.reviewCount ?? 0
      });
      return { id: docRef.id, ...productData } as Product;
    } catch (error: any) {
      console.error("Error creating product:", error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  },

  async deleteAllProducts() {
    try {
      const querySnapshot = await getDocs(productsRef);
      const deletePromises = querySnapshot.docs.map(document => deleteDoc(doc(db, COLLECTION_NAME, document.id)));
      await Promise.all(deletePromises);
      return true;
    } catch (error: any) {
      console.error("Error deleting all products:", error);
      throw new Error(`Failed to clear products: ${error.message}`);
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
