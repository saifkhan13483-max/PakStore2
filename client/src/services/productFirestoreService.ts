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
import { getPublicIdFromUrl, deleteCloudinaryImage } from "@/lib/cloudinary";

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
          // If a parent category is selected but has no subcategories, 
          // we should also check if the parent category itself is used as a categoryId for products
          constraints.push(where("categoryId", "==", filters.parentCategoryId));
        }
      }

      // Add default ordering if not specified to ensure consistent pagination
      // To avoid composite index issues when filtering, we only add orderBy if NO filters are present
      // or if we're sure an index exists. For now, let's omit orderBy when category filtering
      // to allow the query to run without requiring a manual index creation for the user.
      if (!filters.category && !filters.parentCategoryId && !filters.search) {
        if (filters.sortBy === "price-asc") {
          constraints.push(orderBy("price", "asc"));
        } else if (filters.sortBy === "price-desc") {
          constraints.push(orderBy("price", "desc"));
        } else {
          constraints.push(orderBy("createdAt", "desc"));
        }
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
      
      // Deeply remove undefined values to prevent Firestore errors
      const cleanObject = (obj: any): any => {
        if (Array.isArray(obj)) {
          return obj.map(v => cleanObject(v));
        } else if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
          return Object.fromEntries(
            Object.entries(obj)
              .filter(([_, v]) => v !== undefined)
              .map(([k, v]) => [k, cleanObject(v)])
          );
        }
        return obj;
      };

      const cleanData = cleanObject(productData);

      const docRef = await addDoc(productsRef, {
        ...cleanData,
        createdAt: new Date(),
        updatedAt: new Date(),
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
    
    // Deeply remove undefined values to prevent Firestore errors
    const cleanObject = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(v => cleanObject(v));
      } else if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
        return Object.fromEntries(
          Object.entries(obj)
            .filter(([_, v]) => v !== undefined)
            .map(([k, v]) => [k, cleanObject(v)])
        );
      }
      return obj;
    };

    const cleanUpdates = cleanObject(updates);

    await updateDoc(docRef, { ...cleanUpdates, updatedAt: new Date() });
    return { id: productId, ...updates };
  },

  async deleteProduct(productId: string) {
    try {
      // 1. Get product to find images
      const product = await this.getProductById(productId);
      
      // 2. Delete images from Cloudinary if they exist
      if (product.images && Array.isArray(product.images)) {
        for (const imageUrl of product.images) {
          const publicId = getPublicIdFromUrl(imageUrl);
          if (publicId) {
            await deleteCloudinaryImage(publicId);
          }
        }
      }

      // 3. Delete from Firestore
      await deleteDoc(doc(db, COLLECTION_NAME, productId));
      return true;
    } catch (error) {
      console.error("Error in deleteProduct:", error);
      // Still attempt to delete from Firestore even if image deletion fails
      await deleteDoc(doc(db, COLLECTION_NAME, productId));
      return true;
    }
  }
};
