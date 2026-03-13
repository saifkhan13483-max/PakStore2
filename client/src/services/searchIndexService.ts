import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { categoryFirestoreService } from "@/services/categoryFirestoreService";
import type { Product, Category, ParentCategory } from "@shared/schema";
import type { SearchIndexEntry } from "@shared/schema";

const SEARCH_INDEX_COLLECTION = "searchIndex";
const PRODUCTS_COLLECTION = "products";

export function generateTokens(name: string): string[] {
  const tokens = new Set<string>();
  const words = name
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);

  for (const word of words) {
    tokens.add(word);
    for (let i = 2; i < word.length; i++) {
      tokens.add(word.slice(0, i));
    }
  }

  return Array.from(tokens);
}

function computeSearchScore(product: Product): number {
  const rating = Number(product.rating ?? 0);
  const reviewCount = Number(product.reviewCount ?? 0);
  const labels = Array.isArray(product.labels) ? product.labels : [];
  const isBestSeller = labels.includes("Best Seller");
  const inStock = product.inStock ?? false;

  return (
    rating * reviewCount * 0.3 +
    (isBestSeller ? 50 : 0) +
    (inStock ? 20 : 0)
  );
}

function buildIndexEntry(
  product: Product,
  category: Category | undefined,
  parentCategory: ParentCategory | undefined
): SearchIndexEntry {
  return {
    productId: product.id,
    name: product.name,
    nameLower: product.name.toLowerCase(),
    nameTokens: generateTokens(product.name),
    categoryName: category?.name ?? "",
    categorySlug: category?.slug ?? "",
    parentCategoryName: parentCategory?.name ?? "",
    price: product.price,
    primaryImage: Array.isArray(product.images) ? (product.images[0] ?? "") : "",
    slug: product.slug,
    labels: Array.isArray(product.labels) ? product.labels : [],
    inStock: product.inStock ?? false,
    active: product.active ?? true,
    rating: Number(product.rating ?? 0),
    reviewCount: Number(product.reviewCount ?? 0),
    searchScore: computeSearchScore(product),
  };
}

export const searchIndexService = {
  async buildSearchIndex(): Promise<void> {
    const productsSnap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    const products = productsSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Product[];

    const categories = await categoryFirestoreService.getAllCategories();
    const parentCategories = await categoryFirestoreService.getAllParentCategories();

    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const parentCategoryMap = new Map(parentCategories.map((p) => [p.id, p]));

    const BATCH_SIZE = 499;
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      const slice = products.slice(i, i + BATCH_SIZE);

      for (const product of slice) {
        const category = categoryMap.get(product.categoryId);
        const parentCategory = category?.parentCategoryId
          ? parentCategoryMap.get(category.parentCategoryId)
          : undefined;

        const entry = buildIndexEntry(product, category, parentCategory);
        const docRef = doc(db, SEARCH_INDEX_COLLECTION, product.id);
        batch.set(docRef, entry);
      }

      await batch.commit();
    }
  },

  async updateSearchIndexForProduct(productId: string): Promise<void> {
    const productDoc = await getDoc(doc(db, PRODUCTS_COLLECTION, productId));
    if (!productDoc.exists()) {
      await this.deleteSearchIndexForProduct(productId);
      return;
    }

    const product = { id: productDoc.id, ...productDoc.data() } as Product;
    const categories = await categoryFirestoreService.getAllCategories();
    const parentCategories = await categoryFirestoreService.getAllParentCategories();

    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const parentCategoryMap = new Map(parentCategories.map((p) => [p.id, p]));

    const category = categoryMap.get(product.categoryId);
    const parentCategory = category?.parentCategoryId
      ? parentCategoryMap.get(category.parentCategoryId)
      : undefined;

    const entry = buildIndexEntry(product, category, parentCategory);
    await setDoc(doc(db, SEARCH_INDEX_COLLECTION, productId), entry);
  },

  async deleteSearchIndexForProduct(productId: string): Promise<void> {
    await deleteDoc(doc(db, SEARCH_INDEX_COLLECTION, productId));
  },
};
