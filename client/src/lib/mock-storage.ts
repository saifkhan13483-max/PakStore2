import { type Product, type Category, type ParentCategory } from "@shared/schema";
import { mockProducts } from "../data/products";

// Initial mock data
const initialParentCategories: ParentCategory[] = [
  { id: 1, name: "Power Banks", slug: "power-banks" }
];

const initialCategories: Category[] = [
  { id: 1, name: "Portable Chargers", slug: "portable-chargers", parentId: 1 }
];

const STORAGE_KEYS = {
  PRODUCTS: "app_products",
  CATEGORIES: "app_categories",
  PARENT_CATEGORIES: "app_parent_categories",
  CART: "app_cart"
};

class MockStorage {
  private getData<T>(key: string, fallback: T): T {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  }

  private setData<T>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  getProducts(): Product[] {
    return this.getData(STORAGE_KEYS.PRODUCTS, mockProducts);
  }

  getProduct(slug: string): Product | undefined {
    return this.getProducts().find(p => p.slug === slug);
  }

  getParentCategories(): ParentCategory[] {
    return this.getData(STORAGE_KEYS.PARENT_CATEGORIES, initialParentCategories);
  }

  getCategories(): Category[] {
    return this.getData(STORAGE_KEYS.CATEGORIES, initialCategories);
  }
}

export const mockStorage = new MockStorage();
