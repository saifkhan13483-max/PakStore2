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

function convertToDate(value: any): Date {
  if (value instanceof Date) return value;
  if (typeof value === 'string') return new Date(value);
  if (value?.toDate instanceof Function) return value.toDate();
  if (value?.seconds) return new Date(value.seconds * 1000);
  return new Date();
}

export const commentFirestoreService = {
  async getComments(productId: string): Promise<Comment[]> {
    try {
      if (!productId) return [];
      
      const q = query(
        collection(db, "comments"),
        where("productId", "==", productId),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id, // Always use Firestore doc ID last so it takes priority
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
        } as Comment;
      });
    } catch (error) {
      console.error("Error fetching comments:", { productId, error });
      // Fallback: try without orderBy in case index is missing
      try {
        const q = query(
          collection(db, "comments"),
          where("productId", "==", productId)
        );
        const snapshot = await getDocs(q);
        const comments = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
          } as Comment;
        });
        return comments.sort((a, b) => convertToDate(b.createdAt).getTime() - convertToDate(a.createdAt).getTime());
      } catch (fallbackError) {
        console.error("Error fetching comments (fallback):", fallbackError);
        return [];
      }
    }
  },

  async createComment(comment: InsertComment): Promise<Comment> {
    const data = {
      ...comment,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
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
      const averageRating = totalRating / (comments.length || 1);
      
      const productRef = doc(db, "products", comment.productId);
      await updateDoc(productRef, {
        rating: Number(averageRating.toFixed(1)),
        reviewCount: comments.length,
        updatedAt: Timestamp.now()
      });
      
      await queryClient.invalidateQueries({ queryKey: ["comments", comment.productId] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["product", comment.productId] });

      return {
        id: docRef.id,
        productId: comment.productId,
        userId: comment.userId,
        userName: comment.userName,
        userPhoto: comment.userPhoto,
        content: comment.content,
        rating: comment.rating,
        images: comment.images,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Comment;
    } catch (error) {
      console.error("Error creating comment:", error);
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

      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["product", commentData.productId] });
      await queryClient.invalidateQueries({ queryKey: ["product"] });
    } catch (error) {
      console.error("Error updating comment:", error);
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

      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["product", commentData.productId] });
      await queryClient.invalidateQueries({ queryKey: ["product"] });
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  }
};
