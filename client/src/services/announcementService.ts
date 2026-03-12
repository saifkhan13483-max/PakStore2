import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type Announcement, type InsertAnnouncement } from "@shared/announcement-schema";

const COLLECTION_NAME = "announcements";

export const announcementService = {
  async getAnnouncements(): Promise<Announcement[]> {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION_NAME));
      const announcements = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as Announcement)
      );
      return announcements.sort(
        (a, b) => (a.display_order || 0) - (b.display_order || 0)
      );
    } catch (error) {
      console.error("Error fetching announcements:", error);
      return [];
    }
  },

  async getActiveAnnouncements(): Promise<Announcement[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("is_active", "==", true)
      );
      const snapshot = await getDocs(q);
      const announcements = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as Announcement)
      );
      return announcements.sort(
        (a, b) => (a.display_order || 0) - (b.display_order || 0)
      );
    } catch (error) {
      console.error("Error fetching active announcements:", error);
      return [];
    }
  },

  async createAnnouncement(data: InsertAnnouncement): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateAnnouncement(
    id: string,
    data: Partial<Announcement>
  ): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteAnnouncement(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  },
};
