import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  type DocumentData,
  type QueryConstraint
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type Product, insertProductSchema } from "@shared/schema";

const PRODUCTS_COLLECTION = "products";

export interface ProductFilters {
  category?: number;
  search?: string;
  sortBy?: string;
  limit?: number;
  startAfter?: any;
}

export class ProductFirestoreService {
  /**
   * Get all products with optional filtering and pagination
   */
  async getAllProducts(filters: ProductFilters = {}): Promise<{ products: Product[], lastVisible: any }> {
    try {
      const constraints: QueryConstraint[] = [];

      if (filters.category) {
        constraints.push(where("categoryId", "==", filters.category));
      }

      if (filters.sortBy) {
        // Example: "price-asc", "price-desc", "name-asc"
        const [field, direction] = filters.sortBy.split("-");
        constraints.push(orderBy(field, direction as "asc" | "desc"));
      } else {
        constraints.push(orderBy("name", "asc"));
      }

      if (filters.startAfter) {
        constraints.push(startAfter(filters.startAfter));
      }

      if (filters.limit) {
        constraints.push(limit(filters.limit));
      } else {
        constraints.push(limit(20));
      }

      const q = query(collection(db, PRODUCTS_COLLECTION), ...constraints);
      const querySnapshot = await getDocs(q);
      
      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as unknown as Product);
      });

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

      // Client-side search fallback since Firestore doesn't support full-text search directly without 3rd party
      let filteredProducts = products;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProducts = products.filter(p => 
          p.name.toLowerCase().includes(searchLower) || 
          p.description.toLowerCase().includes(searchLower)
        );
      }

      return { products: filteredProducts, lastVisible };
    } catch (error: any) {
      console.error("Error getting products:", error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }

  /**
   * Get a single product by ID
   */
  async getProductById(productId: string): Promise<Product | null> {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, productId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as unknown as Product;
      }
      return null;
    } catch (error: any) {
      console.error("Error getting product by ID:", error);
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
  }

  /**
   * Get products by category ID
   */
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    try {
      const q = query(
        collection(db, PRODUCTS_COLLECTION), 
        where("categoryId", "==", categoryId),
        orderBy("name", "asc")
      );
      const querySnapshot = await getDocs(q);
      
      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as unknown as Product);
      });

      return products;
    } catch (error: any) {
      console.error("Error getting products by category:", error);
      throw new Error(`Failed to fetch products for category: ${error.message}`);
    }
  }

  /**
   * Search products by search term
   */
  async searchProducts(searchTerm: string): Promise<Product[]> {
    // Note: Standard Firestore doesn't support full-text search.
    // We implement a simple search by fetching and filtering, or prefix matching.
    try {
      const searchLower = searchTerm.toLowerCase();
      const q = query(collection(db, PRODUCTS_COLLECTION), limit(100));
      const querySnapshot = await getDocs(q);
      
      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (
          data.name.toLowerCase().includes(searchLower) || 
          data.description.toLowerCase().includes(searchLower)
        ) {
          products.push({ id: doc.id, ...data } as unknown as Product);
        }
      });

      return products;
    } catch (error: any) {
      console.error("Error searching products:", error);
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  /**
   * Create a new product (Admin only)
   */
  async createProduct(productData: any): Promise<Product> {
    try {
      // Client-side validation using shared schema
      const validatedData = insertProductSchema.parse(productData);

      // Firestore specific validation
      if (validatedData.price <= 0) {
        throw new Error("Price must be a positive number");
      }

      const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), validatedData);
      return { id: docRef.id, ...validatedData } as unknown as Product;
    } catch (error: any) {
      console.error("Error creating product:", error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  /**
   * Update an existing product (Admin only)
   */
  async updateProduct(productId: string, updates: any): Promise<void> {
    try {
      // Optional: partial validation or full validation depending on use case
      // For now, we allow partial updates
      const docRef = doc(db, PRODUCTS_COLLECTION, productId);
      await updateDoc(docRef, updates);
    } catch (error: any) {
      console.error("Error updating product:", error);
      throw new Error(`Failed to update product: ${error.message}`);
    }
  }

  /**
   * Delete a product (Admin only)
   */
  async deleteProduct(productId: string): Promise<void> {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, productId);
      await deleteDoc(docRef);
    } catch (error: any) {
      console.error("Error deleting product:", error);
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }
}

export const productFirestoreService = new ProductFirestoreService();
