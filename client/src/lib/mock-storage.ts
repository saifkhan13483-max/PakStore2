import { type Product, type Category, type ParentCategory, type InsertProduct, type InsertCategory, type InsertParentCategory } from "@shared/schema";
import { mockProducts } from "../data/products";

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

  saveProduct(product: InsertProduct & { id?: number }): Product {
    const products = this.getProducts();
    let updatedProduct: Product;

    if (product.id) {
      const index = products.findIndex(p => p.id === product.id);
      if (index === -1) throw new Error("Product not found");
      updatedProduct = { ...products[index], ...product } as Product;
      products[index] = updatedProduct;
    } else {
      const newId = Math.max(0, ...products.map(p => p.id)) + 1;
      updatedProduct = { ...product, id: newId } as Product;
      products.push(updatedProduct);
    }

    this.setData(STORAGE_KEYS.PRODUCTS, products);
    return updatedProduct;
  }

  deleteProduct(id: number): void {
    const products = this.getProducts().filter(p => p.id !== id);
    this.setData(STORAGE_KEYS.PRODUCTS, products);
  }

  getParentCategories(): ParentCategory[] {
    return this.getData(STORAGE_KEYS.PARENT_CATEGORIES, initialParentCategories);
  }

  saveParentCategory(category: InsertParentCategory & { id?: number }): ParentCategory {
    const categories = this.getParentCategories();
    let updated: ParentCategory;

    if (category.id) {
      const index = categories.findIndex(c => c.id === category.id);
      updated = { ...categories[index], ...category } as ParentCategory;
      categories[index] = updated;
    } else {
      const newId = Math.max(0, ...categories.map(c => c.id)) + 1;
      updated = { ...category, id: newId } as ParentCategory;
      categories.push(updated);
    }

    this.setData(STORAGE_KEYS.PARENT_CATEGORIES, categories);
    return updated;
  }

  getCategories(): Category[] {
    return this.getData(STORAGE_KEYS.CATEGORIES, initialCategories);
  }

  saveCategory(category: InsertCategory & { id?: number }): Category {
    const categories = this.getCategories();
    let updated: Category;

    if (category.id) {
      const index = categories.findIndex(c => c.id === category.id);
      updated = { ...categories[index], ...category } as Category;
      categories[index] = updated;
    } else {
      const newId = Math.max(0, ...categories.map(c => c.id)) + 1;
      updated = { ...category, id: newId } as Category;
      categories.push(updated);
    }

    this.setData(STORAGE_KEYS.CATEGORIES, categories);
    return updated;
  }
}

export const mockStorage = new MockStorage();
