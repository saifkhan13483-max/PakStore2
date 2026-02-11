import { db } from "@/lib/firebase";
import { queryClient } from "@/lib/queryClient";
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  Timestamp,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { Comment, InsertComment } from "@shared/schema";

export const commentFirestoreService = {
  async getComments(productId: string): Promise<Comment[]> {
    try {
      if (!productId) return [];
      
      const q = query(
        collection(db, "comments"),
        where("productId", "==", productId)
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
      // Sort manually to avoid needing a composite index in Firestore
      return comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  },

  async createComment(comment: InsertComment): Promise<Comment> {
    const data = {
      ...comment,
      createdAt: Timestamp.now()
    };
    try {
      const docRef = await addDoc(collection(db, "comments"), data);
      
      // Aggregate rating on product
      const q = query(
        collection(db, "comments"),
        where("productId", "==", comment.productId)
      );
      const snapshot = await getDocs(q);
      const comments = snapshot.docs.map(d => d.data());
      const totalRating = comments.reduce((acc, c) => acc + (Number(c.rating) || 0), 0);
      const averageRating = totalRating / comments.length;
      
      const productRef = doc(db, "products", comment.productId);
      await updateDoc(productRef, {
        rating: Number(averageRating.toFixed(1)),
        reviewCount: comments.length,
        updatedAt: Timestamp.now()
      });
      
      // Invalidate queries to refresh UI
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["product", comment.productId] });
      await queryClient.invalidateQueries({ queryKey: ["product"] }); // For slug-based queries

      return {
        id: docRef.id,
        ...data,
        createdAt: data.createdAt.toDate().toISOString()
      } as Comment;
    } catch (error) {
      console.error("Error creating comment in Firestore:", error);
      throw error;
    }
  },

  async updateComment(commentId: string, updates: Partial<InsertComment>): Promise<void> {
    try {
      const docRef = doc(db, "comments", commentId);
      const commentSnap = await getDoc(docRef);
      if (!commentSnap.exists()) throw new Error("Comment not found");
      const commentData = commentSnap.data();

      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });

      // Re-aggregate
      const q = query(
        collection(db, "comments"),
        where("productId", "==", commentData.productId)
      );
      const snapshot = await getDocs(q);
      const comments = snapshot.docs.map(d => d.data());
      const totalRating = comments.reduce((acc, c) => acc + (Number(c.rating) || 0), 0);
      const averageRating = totalRating / comments.length;
      
      const productRef = doc(db, "products", commentData.productId);
      await updateDoc(productRef, {
        rating: Number(averageRating.toFixed(1)),
        reviewCount: comments.length,
        updatedAt: Timestamp.now()
      });

      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["product", commentData.productId] });
      await queryClient.invalidateQueries({ queryKey: ["product"] });
    } catch (error) {
      console.error("Error updating comment in Firestore:", error);
      throw error;
    }
  },

  async deleteComment(commentId: string): Promise<void> {
    try {
      const docRef = doc(db, "comments", commentId);
      const commentSnap = await getDoc(docRef);
      if (!commentSnap.exists()) throw new Error("Comment not found");
      const commentData = commentSnap.data();

      await deleteDoc(docRef);

      // Re-aggregate
      const q = query(
        collection(db, "comments"),
        where("productId", "==", commentData.productId)
      );
      const snapshot = await getDocs(q);
      const comments = snapshot.docs.map(d => d.data());
      
      const productRef = doc(db, "products", commentData.productId);
      if (comments.length > 0) {
        const totalRating = comments.reduce((acc, c) => acc + (Number(c.rating) || 0), 0);
        const averageRating = totalRating / comments.length;
        await updateDoc(productRef, {
          rating: Number(averageRating.toFixed(1)),
          reviewCount: comments.length,
          updatedAt: Timestamp.now()
        });
      } else {
        await updateDoc(productRef, {
          rating: 0,
          reviewCount: 0,
          updatedAt: Timestamp.now()
        });
      }

      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["product", commentData.productId] });
      await queryClient.invalidateQueries({ queryKey: ["product"] });
    } catch (error) {
      console.error("Error deleting comment from Firestore:", error);
      throw error;
    }
  }
};
