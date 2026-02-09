import { db } from "../config/firebase";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  limit, 
  startAfter,
  orderBy
} from "firebase/firestore";

const COLLECTION_NAME = "products";

export const productService = {
  async createProduct(productData: any) {
    const docRef = doc(collection(db, COLLECTION_NAME));
    await setDoc(docRef, {
      ...productData,
      id: docRef.id,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  },

  async getProductById(productId: string) {
    const docRef = doc(db, COLLECTION_NAME, productId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  },

  async updateProduct(productId: string, updateData: any) {
    const docRef = doc(db, COLLECTION_NAME, productId);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
  },

  async deleteProduct(productId: string) {
    const docRef = doc(db, COLLECTION_NAME, productId);
    await deleteDoc(docRef);
  },

  async getAllProducts(pageSize = 10, lastVisibleDoc = null) {
    let q = query(
      collection(db, COLLECTION_NAME),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    if (lastVisibleDoc) {
      q = query(q, startAfter(lastVisibleDoc));
    }

    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map(doc => doc.data());
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    return {
      products,
      lastVisible
    };
  }
};
