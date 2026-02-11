import { db, auth } from "./config/firebase.js";
import { 
  ParentCategory, 
  Category, 
  Product, 
  InsertProduct, 
  User,
  Order,
  InsertOrder,
  Comment,
  InsertComment,
} from "@shared/schema";

export interface IStorage {
  // Parent Categories
  getParentCategories(): Promise<ParentCategory[]>;
  getParentCategory(id: string): Promise<ParentCategory | null>;
  
  // Categories
  getCategories(parentId?: string): Promise<Category[]>;
  getCategory(id: string): Promise<Category | null>;
  
  // Products
  getProducts(categoryId?: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  createProduct(product: InsertProduct): Promise<Product>;
  createParentCategory(pc: any): Promise<ParentCategory>;
  createCategory(cat: any): Promise<Category>;
  deleteAllProducts(): Promise<void>;
  
  // Users
  getUser(uid: string): Promise<User | null>;
  createUser(user: User): Promise<User>;

  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrders(): Promise<Order[]>;

  // Comments
  getComments(productId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
}

export class FirestoreStorage implements IStorage {
  // ... existing methods ...
  async getParentCategories(): Promise<ParentCategory[]> {
    const snapshot = await db.collection("parent_categories").get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as ParentCategory));
  }

  async getParentCategory(id: string): Promise<ParentCategory | null> {
    const doc = await db.collection("parent_categories").doc(id).get();
    return doc.exists ? ({ id: doc.id, ...doc.data() } as ParentCategory) : null;
  }

  async getCategories(parentId?: string): Promise<Category[]> {
    let query: any = db.collection("categories");
    if (parentId) {
      query = query.where("parentId", "==", parentId);
    }
    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Category));
  }

  async getCategory(id: string): Promise<Category | null> {
    const doc = await db.collection("categories").doc(id).get();
    return doc.exists ? ({ id: doc.id, ...doc.data() } as Category) : null;
  }

  async getProducts(categoryId?: string): Promise<Product[]> {
    let query: any = db.collection("products");
    if (categoryId) {
      query = query.where("categoryId", "==", categoryId);
    }
    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Product));
  }

  async getProduct(id: string): Promise<Product | null> {
    const doc = await db.collection("products").doc(id).get();
    return doc.exists ? ({ id: doc.id, ...doc.data() } as Product) : null;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const docRef = await db.collection("products").add(product);
    return { id: docRef.id, ...product } as Product;
  }

  async createParentCategory(pc: any): Promise<ParentCategory> {
    const docRef = await db.collection("parent_categories").add(pc);
    return { id: docRef.id, ...pc } as ParentCategory;
  }

  async createCategory(cat: any): Promise<Category> {
    const docRef = await db.collection("categories").add(cat);
    return { id: docRef.id, ...cat } as Category;
  }

  async deleteAllProducts(): Promise<void> {
    const snapshot = await db.collection("products").get();
    const batch = db.batch();
    snapshot.docs.forEach((doc: any) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }

  async getUser(uid: string): Promise<User | null> {
    const doc = await db.collection("users").doc(uid).get();
    return doc.exists ? (doc.data() as User) : null;
  }

  async createUser(user: User): Promise<User> {
    await db.collection("users").doc(user.uid).set(user);
    return user;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const data = {
      ...order,
      createdAt: new Date().toISOString(),
      orderId: "PC" + Math.floor(100000 + Math.random() * 900000)
    };
    const docRef = await db.collection("orders").add(data);
    return { id: docRef.id, ...data } as Order;
  }

  async getOrders(): Promise<Order[]> {
    const snapshot = await db.collection("orders").orderBy("createdAt", "desc").get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Order));
  }

  async getComments(productId: string): Promise<Comment[]> {
    const snapshot = await db.collection("comments")
      .where("productId", "==", productId)
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Comment));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const data = {
      ...comment,
      createdAt: new Date().toISOString()
    };
    const docRef = await db.collection("comments").add(data);
    return { id: docRef.id, ...data } as Comment;
  }
}

export const storage = new FirestoreStorage();
