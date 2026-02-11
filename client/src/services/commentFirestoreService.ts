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
      where("productId", "==", productId)
      // Temporarily remove orderBy to check if index is the issue
      // orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    const comments = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
      } as Comment;
    });
    // Sort manually if needed
    return comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async createComment(comment: InsertComment): Promise<Comment> {
    const data = {
      ...comment,
      createdAt: Timestamp.now()
    };
    try {
      const docRef = await addDoc(collection(db, "comments"), data);
      return {
        id: docRef.id,
        ...data,
        createdAt: data.createdAt.toDate().toISOString()
      } as Comment;
    } catch (error) {
      console.error("Error creating comment in Firestore:", error);
      throw error;
    }
  }
};
