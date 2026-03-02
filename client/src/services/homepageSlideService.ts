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
  serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type HomepageSlide, type InsertHomepageSlide } from "@shared/homepage-slide-schema";

const COLLECTION_NAME = "homepage_slides";

export const homepageSlideService = {
  async getAllSlides(): Promise<HomepageSlide[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME));
      const snapshot = await getDocs(q);
      const slides = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HomepageSlide));
      return slides.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    } catch (error) {
      console.error("Error fetching all slides:", error);
      return [];
    }
  },

  async getActiveSlides(): Promise<HomepageSlide[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where("is_active", "==", true)
      );
      const snapshot = await getDocs(q);
      const slides = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HomepageSlide));
      
      // Sort in memory to avoid index requirement
      return slides.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    } catch (error) {
      console.error("Error fetching active slides:", error);
      return [];
    }
  },

  async createSlide(data: InsertHomepageSlide): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateSlide(id: string, data: Partial<HomepageSlide>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteSlide(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  }
};
