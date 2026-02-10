import { 
  collection, 
  getCountFromServer,
  query,
  getDocs,
  limit
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const PRODUCTS_COLLECTION = "products";
const CATEGORIES_COLLECTION = "categories";
const ORDERS_COLLECTION = "orders";
const USERS_COLLECTION = "users";

export interface AdminStats {
  totalProducts: number;
  totalCategories: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
}

export class AdminStatsService {
  /**
   * Get admin statistics using Firestore aggregations
   */
  async getAdminStats(): Promise<AdminStats> {
    try {
      // Use count() aggregation to minimize read costs
      const productsSnapshot = await getCountFromServer(collection(db, PRODUCTS_COLLECTION));
      const categoriesSnapshot = await getCountFromServer(collection(db, CATEGORIES_COLLECTION));
      
      // These collections might not exist yet or have different schemas, 
      // but following the requested format
      const usersSnapshot = await getCountFromServer(collection(db, USERS_COLLECTION));
      const ordersSnapshot = await getCountFromServer(collection(db, ORDERS_COLLECTION));

      // For revenue, we might need a more complex aggregation or a separate stats document
      // For now, we'll try to sum from a few recent orders if possible, 
      // or return 0 if the collection is empty/unstructured for it.
      // In a real production app, you'd maintain a 'metadata/stats' document updated by Cloud Functions.
      let totalRevenue = 0;
      try {
        const q = query(collection(db, ORDERS_COLLECTION), limit(100));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          totalRevenue += (data.total || data.amount || 0);
        });
      } catch (e) {
        console.warn("Could not calculate revenue from orders collection:", e);
      }

      return {
        totalProducts: productsSnapshot.data().count,
        totalCategories: categoriesSnapshot.data().count,
        totalUsers: usersSnapshot.data().count,
        totalOrders: ordersSnapshot.data().count,
        totalRevenue: totalRevenue
      };
    } catch (error: any) {
      console.error("Error getting admin stats:", error);
      throw new Error(`Failed to fetch admin stats: ${error.message}`);
    }
  }
}

export const adminStatsService = new AdminStatsService();
