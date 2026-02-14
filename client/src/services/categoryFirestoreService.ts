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
  onSnapshot
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
  async getCategory(id: string): Promise<Category> {
    try {
      const docSnap = await getDoc(doc(db, CATEGORIES_COLLECTION, id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as unknown as Category;
      }
      throw new Error("Category not found");
    } catch (error: any) {
      console.error("Error getting category:", error);
      throw new Error(`Failed to fetch category: ${error.message}`);
    }
  }

  subscribeCategories(callback: (categories: Category[]) => void) {
    const q = query(collection(db, CATEGORIES_COLLECTION), orderBy("name", "asc"));
    return onSnapshot(q, (querySnapshot) => {
      const categories = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          parentCategoryId: data.parentId || data.parentCategoryId 
        } as unknown as Category;
      });
      callback(categories);
    }, (error) => {
      console.error("Error subscribing to categories:", error);
    });
  }

  subscribeParentCategories(callback: (categories: ParentCategory[]) => void) {
    const q = query(collection(db, PARENT_CATEGORIES_COLLECTION), orderBy("name", "asc"));
    return onSnapshot(q, (querySnapshot) => {
      const categories = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as unknown as ParentCategory));
      callback(categories);
    }, (error) => {
      console.error("Error subscribing to parent categories:", error);
    });
  }

  async getAllCategories(): Promise<Category[]> {
    try {
      const q = query(collection(db, CATEGORIES_COLLECTION), orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          parentCategoryId: data.parentId || data.parentCategoryId 
        } as unknown as Category;
      });
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
      const dataToSave = {
        ...validatedData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), dataToSave);
      return { ...dataToSave, id: docRef.id } as unknown as Category;
    } catch (error: any) {
      console.error("Error creating category:", error);
      throw new Error(`Failed to create category: ${error.message}`);
    }
  }

  async createParentCategory(categoryData: any): Promise<ParentCategory> {
    try {
      const validatedData = insertParentCategorySchema.parse(categoryData);
      const dataToSave = {
        ...validatedData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const docRef = await addDoc(collection(db, PARENT_CATEGORIES_COLLECTION), dataToSave);
      return { ...dataToSave, id: docRef.id } as unknown as ParentCategory;
    } catch (error: any) {
      console.error("Error creating parent category:", error);
      throw new Error(`Failed to create parent category: ${error.message}`);
    }
  }

  async updateParentCategory(id: string, data: any): Promise<void> {
    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    await updateDoc(doc(db, PARENT_CATEGORIES_COLLECTION, id), updateData);
  }

  async updateCategory(id: string, data: any): Promise<void> {
    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    await updateDoc(doc(db, CATEGORIES_COLLECTION, id), updateData);
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
