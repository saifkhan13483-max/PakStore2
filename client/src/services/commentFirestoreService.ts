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
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Comment));
  },

  async createComment(comment: InsertComment): Promise<Comment> {
    const data = {
      ...comment,
      createdAt: new Timestamp(Math.floor(Date.now() / 1000), 0).toDate().toISOString()
    };
    const docRef = await addDoc(collection(db, "comments"), data);
    return {
      id: docRef.id,
      ...data
    } as Comment;
  }
};
