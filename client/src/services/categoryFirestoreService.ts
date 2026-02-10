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
  async getAllCategories(): Promise<Category[]> {
    try {
      const q = query(collection(db, CATEGORIES_COLLECTION), orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Category));
    } catch (error: any) {
      console.error("Error getting categories:", error);
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
  }

  async getAllParentCategories(): Promise<ParentCategory[]> {
    try {
      const q = query(collection(db, PARENT_CATEGORIES_COLLECTION), orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as ParentCategory));
    } catch (error: any) {
      console.error("Error getting parent categories:", error);
      throw new Error(`Failed to fetch parent categories: ${error.message}`);
    }
  }

  async createCategory(categoryData: any): Promise<Category> {
    try {
      const validatedData = insertCategorySchema.parse(categoryData);
      const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), validatedData);
      return { ...validatedData, id: docRef.id } as unknown as Category;
    } catch (error: any) {
      console.error("Error creating category:", error);
      throw new Error(`Failed to create category: ${error.message}`);
    }
  }

  async deleteCategory(categoryId: string): Promise<void> {
    try {
      const productsQuery = query(collection(db, PRODUCTS_COLLECTION), where("categoryId", "==", categoryId), limit(1));
      const productsSnapshot = await getDocs(productsQuery);
      if (!productsSnapshot.empty) {
        throw new Error("Cannot delete category because it contains products.");
      }
      await deleteDoc(doc(db, CATEGORIES_COLLECTION, categoryId));
    } catch (error: any) {
      console.error("Error deleting category:", error);
      throw new Error(error.message || "Failed to delete category");
    }
  }

  async createParentCategory(categoryData: any): Promise<ParentCategory> {
    try {
      const validatedData = insertParentCategorySchema.parse(categoryData);
      const docRef = await addDoc(collection(db, PARENT_CATEGORIES_COLLECTION), validatedData);
      return { ...validatedData, id: docRef.id } as unknown as ParentCategory;
    } catch (error: any) {
      console.error("Error creating parent category:", error);
      throw new Error(`Failed to create parent category: ${error.message}`);
    }
  }

  async updateParentCategory(id: string, data: any): Promise<void> {
    await updateDoc(doc(db, PARENT_CATEGORIES_COLLECTION, id), data);
  }

  async updateCategory(id: string, data: any): Promise<void> {
    await updateDoc(doc(db, CATEGORIES_COLLECTION, id), data);
  }

  async deleteParentCategory(id: string): Promise<void> {
    const subCategoriesQuery = query(collection(db, CATEGORIES_COLLECTION), where("parentId", "==", id), limit(1));
    const subCategoriesSnapshot = await getDocs(subCategoriesQuery);
    if (!subCategoriesSnapshot.empty) {
      throw new Error("Cannot delete parent category because it contains sub-categories.");
    }
    await deleteDoc(doc(db, PARENT_CATEGORIES_COLLECTION, id));
  }
}

export const categoryFirestoreService = new CategoryFirestoreService();
