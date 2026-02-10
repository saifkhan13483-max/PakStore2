import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from "firebase/firestore";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  createdAt?: any;
}

const productsCol = collection(db, "products");

export const productService = {
  async getProducts() {
    const snapshot = await getDocs(productsCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  },

  async getProductBySlug(slug: string) {
    const q = query(productsCol, where("slug", "==", slug));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docData = snapshot.docs[0];
    return { id: docData.id, ...docData.data() } as Product;
  },

  async createProduct(product: Omit<Product, "id">) {
    const docRef = await addDoc(productsCol, {
      ...product,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    const docRef = doc(db, "products", id);
    await updateDoc(docRef, updates);
  },

  async deleteProduct(id: string) {
    const docRef = doc(db, "products", id);
    await deleteDoc(docRef);
  }
};
