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
  parentCategoryId?: string;
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
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          rating: Number(data.rating || data.averageRating) || 0,
          reviewCount: Number(data.reviewCount || data.ratingsCount) || 0
        } as Product;
      });
    } catch (error: any) {
      console.error("Error getting products by category:", error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  },

  async getAllProducts(filters: ProductFilters = {}) {
    try {
      const constraints: QueryConstraint[] = [];
      
      // Handle category filtering
      if (filters.category && filters.category !== "all") {
        // Ensure category is a string for comparison
        constraints.push(where("categoryId", "==", String(filters.category)));
      } else if (filters.parentCategoryId) {
        // Fetch sub-categories for this parent
        const catsQuery = query(collection(db, "categories"), where("parentCategoryId", "==", filters.parentCategoryId));
        const catsSnapshot = await getDocs(catsQuery);
        const catIds = catsSnapshot.docs.map(doc => doc.id);
        
        if (catIds.length > 0) {
          constraints.push(where("categoryId", "in", catIds.slice(0, 10)));
        } else {
          return [];
        }
      }

      // Add default ordering if not specified to ensure consistent pagination
      if (filters.sortBy === "price-asc") {
        constraints.push(orderBy("price", "asc"));
      } else if (filters.sortBy === "price-desc") {
        constraints.push(orderBy("price", "desc"));
      } else {
        constraints.push(orderBy("createdAt", "desc"));
      }

      if (filters.startAfterDoc) {
        constraints.push(startAfter(filters.startAfterDoc));
      }

      if (filters.limit) {
        constraints.push(limit(filters.limit));
      }

      const q = query(productsRef, ...constraints);
      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          rating: Number(data.rating || data.averageRating) || 0,
          reviewCount: Number(data.reviewCount || data.ratingsCount) || 0
        } as Product;
      });

      let result = products;

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        result = result.filter(p => 
          (p.name?.toLowerCase() || "").includes(searchLower) ||
          (p.description?.toLowerCase() || "").includes(searchLower)
        );
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
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        rating: Number(data.rating || data.averageRating) || 0,
        reviewCount: Number(data.reviewCount || data.ratingsCount) || 0
      } as Product;
    } catch (error: any) {
      console.error("Error getting product by slug:", error);
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
  },

  async getProductById(productId: string) {
    const docRef = doc(db, COLLECTION_NAME, productId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Product not found");
    const data = docSnap.data();
    return { 
      id: docSnap.id, 
      ...data,
      rating: Number(data.rating || data.averageRating) || 0,
      reviewCount: Number(data.reviewCount || data.ratingsCount) || 0
    } as Product;
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
      return { ...productData, id: docRef.id } as Product;
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
