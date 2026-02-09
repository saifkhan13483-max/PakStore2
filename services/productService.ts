import { db } from "../config/firebase";

const COLLECTION_NAME = "products";

export const productService = {
  async createProduct(productData: any) {
    const docRef = db.collection(COLLECTION_NAME).doc();
    await docRef.set({
      ...productData,
      id: docRef.id,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  },

  async getProductById(productId: string) {
    const docSnap = await db.collection(COLLECTION_NAME).doc(productId).get();
    if (docSnap.exists) {
      return docSnap.data();
    }
    return null;
  },

  async getProductBySlug(slug: string) {
    const snapshot = await db.collection(COLLECTION_NAME).where("slug", "==", slug).limit(1).get();
    if (snapshot.empty) {
      return null;
    }
    return snapshot.docs[0].data();
  },

  async updateProduct(productId: string, updateData: any) {
    const docRef = db.collection(COLLECTION_NAME).doc(productId);
    await docRef.update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });
  },

  async deleteProduct(productId: string) {
    await db.collection(COLLECTION_NAME).doc(productId).delete();
  },

  async getAllProducts(pageSize = 10, lastVisibleDocId = null) {
    let query = db.collection(COLLECTION_NAME).orderBy("createdAt", "desc").limit(pageSize);

    if (lastVisibleDocId) {
      const lastDoc = await db.collection(COLLECTION_NAME).doc(lastVisibleDocId).get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }

    const querySnapshot = await query.get();
    const products = querySnapshot.docs.map(doc => doc.data());
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    return {
      products,
      lastVisibleId: lastVisible ? lastVisible.id : null
    };
  }
};
