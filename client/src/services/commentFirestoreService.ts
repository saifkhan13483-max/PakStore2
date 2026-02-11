import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from "firebase/firestore";
import { Comment, InsertComment } from "@shared/schema";

export const commentFirestoreService = {
  async getComments(productId: string): Promise<Comment[]> {
    const q = query(
      collection(db, "comments"),
      where("productId", "==", productId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Ensure createdAt is a string if it's a Firestore Timestamp
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
      } as Comment;
    });
  },

  async createComment(comment: InsertComment): Promise<Comment> {
    const data = {
      ...comment,
      createdAt: Timestamp.now()
    };
    const docRef = await addDoc(collection(db, "comments"), data);
    return {
      id: docRef.id,
      ...data,
      createdAt: data.createdAt.toDate().toISOString()
    } as Comment;
  }
};
