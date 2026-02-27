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
import { type HeroSlide, type InsertHeroSlide } from "@shared/hero-schema";

const HERO_SLIDES_COLLECTION = "hero_slides";

export const heroFirestoreService = {
  async getAllSlides(): Promise<HeroSlide[]> {
    try {
      const q = query(
        collection(db, HERO_SLIDES_COLLECTION),
        orderBy("order", "asc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HeroSlide[];
    } catch (error: any) {
      console.error("Error getting hero slides:", error);
      return [];
    }
  },

  async getActiveSlides(): Promise<HeroSlide[]> {
    try {
      const q = query(
        collection(db, HERO_SLIDES_COLLECTION),
        where("active", "==", true),
        orderBy("order", "asc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HeroSlide[];
    } catch (error: any) {
      console.error("Error getting active hero slides:", error);
      return [];
    }
  },

  async createSlide(data: InsertHeroSlide): Promise<string> {
    const docRef = await addDoc(collection(db, HERO_SLIDES_COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateSlide(id: string, data: Partial<HeroSlide>): Promise<void> {
    const docRef = doc(db, HERO_SLIDES_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteSlide(id: string): Promise<void> {
    await deleteDoc(doc(db, HERO_SLIDES_COLLECTION, id));
  }
};
