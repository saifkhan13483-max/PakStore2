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

      if (filters.category) {
        constraints.push(where("categoryId", "==", parseInt(filters.category)));
      }

      if (filters.sortBy) {
        if (filters.sortBy === "price-asc") constraints.push(orderBy("price", "asc"));
        else if (filters.sortBy === "price-desc") constraints.push(orderBy("price", "desc"));
        else constraints.push(orderBy("id", "desc"));
      } else {
        constraints.push(orderBy("id", "asc"));
      }

      if (filters.limit) {
        constraints.push(limit(filters.limit));
      }

      if (filters.startAfterDoc) {
        constraints.push(startAfter(filters.startAfterDoc));
      }

      const q = query(productsRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      let results = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id === doc.data().id?.toString() ? doc.data().id : doc.id
      })) as Product[];

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        results = results.filter(p => 
          p.name.toLowerCase().includes(searchLower) || 
          p.description.toLowerCase().includes(searchLower)
        );
      }

      return results;
    } catch (error: any) {
      console.error("Error getting products:", error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  },

  async getProductById(productId: string) {
    try {
      const docRef = doc(db, COLLECTION_NAME, productId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("Product not found");
      }

      return { ...docSnap.data(), id: docSnap.id } as Product;
    } catch (error: any) {
      console.error("Error getting product:", error);
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
  },

  async getProductsByCategory(categoryId: string) {
    return this.getAllProducts({ category: categoryId });
  },

  async searchProducts(searchTerm: string) {
    return this.getAllProducts({ search: searchTerm });
  },

  async createProduct(productData: InsertProduct) {
    try {
      // Client-side validation
      insertProductSchema.parse(productData);

      const docRef = await addDoc(productsRef, {
        ...productData,
        inStock: productData.inStock ?? true,
        rating: "0",
        reviewCount: 0
      });

      return { ...productData, id: docRef.id };
    } catch (error: any) {
      console.error("Error creating product:", error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  },

  async updateProduct(productId: string, updates: Partial<InsertProduct>) {
    try {
      const docRef = doc(db, COLLECTION_NAME, productId);
      await updateDoc(docRef, updates);
      return { id: productId, ...updates };
    } catch (error: any) {
      console.error("Error updating product:", error);
      throw new Error(`Failed to update product: ${error.message}`);
    }
  },

  async deleteProduct(productId: string) {
    try {
      const docRef = doc(db, COLLECTION_NAME, productId);
      await deleteDoc(docRef);
      return true;
    } catch (error: any) {
      console.error("Error deleting product:", error);
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }
};
