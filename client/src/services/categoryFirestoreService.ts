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
  limit
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  type Category, 
  type ParentCategory, 
  insertCategorySchema, 
  insertParentCategorySchema 
} from "@shared/schema";

const CATEGORIES_COLLECTION = "categories";
const PARENT_CATEGORIES_COLLECTION = "parentCategories";
const PRODUCTS_COLLECTION = "products";

export class CategoryFirestoreService {
  /**
   * Get all categories
   */
  async getAllCategories(): Promise<Category[]> {
    try {
      const q = query(collection(db, CATEGORIES_COLLECTION), orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
      const categories: Category[] = [];
      querySnapshot.forEach((doc) => {
        categories.push({ id: doc.id, ...doc.data() } as unknown as Category);
      });
      return categories;
    } catch (error: any) {
      console.error("Error getting categories:", error);
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
  }

  /**
   * Get all parent categories
   */
  async getAllParentCategories(): Promise<ParentCategory[]> {
    try {
      const q = query(collection(db, PARENT_CATEGORIES_COLLECTION), orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
      const parents: ParentCategory[] = [];
      querySnapshot.forEach((doc) => {
        parents.push({ id: doc.id, ...doc.data() } as unknown as ParentCategory);
      });
      return parents;
    } catch (error: any) {
      console.error("Error getting parent categories:", error);
      throw new Error(`Failed to fetch parent categories: ${error.message}`);
    }
  }

  /**
   * Get categories by parent ID
   */
  async getCategoriesByParent(parentId: string): Promise<Category[]> {
    try {
      const q = query(
        collection(db, CATEGORIES_COLLECTION),
        where("parentId", "==", parentId),
        orderBy("name", "asc")
      );
      const querySnapshot = await getDocs(q);
      const categories: Category[] = [];
      querySnapshot.forEach((doc) => {
        categories.push({ id: doc.id, ...doc.data() } as unknown as Category);
      });
      return categories;
    } catch (error: any) {
      console.error("Error getting categories by parent:", error);
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
  }

  /**
   * Get a single category by ID
   */
  async getCategoryById(categoryId: string): Promise<Category | null> {
    try {
      const docRef = doc(db, CATEGORIES_COLLECTION, categoryId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as unknown as Category;
      }
      return null;
    } catch (error: any) {
      console.error("Error getting category by ID:", error);
      throw new Error(`Failed to fetch category: ${error.message}`);
    }
  }

  /**
   * Create a new category (Admin only)
   */
  async createCategory(categoryData: any): Promise<Category> {
    try {
      const validatedData = insertCategorySchema.parse(categoryData);
      const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), validatedData);
      return { id: docRef.id, ...validatedData } as unknown as Category;
    } catch (error: any) {
      console.error("Error creating category:", error);
      throw new Error(`Failed to create category: ${error.message}`);
    }
  }

  /**
   * Update an existing category (Admin only)
   */
  async updateCategory(categoryId: string, updates: any): Promise<void> {
    try {
      const docRef = doc(db, CATEGORIES_COLLECTION, categoryId);
      await updateDoc(docRef, updates);
    } catch (error: any) {
      console.error("Error updating category:", error);
      throw new Error(`Failed to update category: ${error.message}`);
    }
  }

  /**
   * Delete a category (Admin only)
   * Includes validation to prevent deleting categories with products
   */
  async deleteCategory(categoryId: string): Promise<void> {
    try {
      // Validation: Check if any products use this category
      const productsQuery = query(
        collection(db, PRODUCTS_COLLECTION),
        where("categoryId", "==", categoryId),
        limit(1)
      );
      const productsSnapshot = await getDocs(productsQuery);
      
      if (!productsSnapshot.empty) {
        throw new Error("Cannot delete category because it contains products. Please move or delete the products first.");
      }

      const docRef = doc(db, CATEGORIES_COLLECTION, categoryId);
      await deleteDoc(docRef);
    } catch (error: any) {
      console.error("Error deleting category:", error);
      throw new Error(error.message || "Failed to delete category");
    }
  }
}

export const categoryFirestoreService = new CategoryFirestoreService();
