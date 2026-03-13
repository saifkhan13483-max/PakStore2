import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { SearchResult, SearchOptions, Suggestion } from "@shared/schema";

const SEARCH_INDEX_COLLECTION = "searchIndex";
const CATEGORIES_COLLECTION = "categories";
const RECENT_SEARCHES_KEY = "pakCart_recentSearches";
const MAX_RECENT_SEARCHES = 5;

interface RawIndexEntry {
  productId: string;
  name: string;
  nameLower: string;
  nameTokens: string[];
  categoryName: string;
  categorySlug: string;
  parentCategoryName: string;
  price: number;
  primaryImage: string;
  slug: string;
  labels: string[];
  inStock: boolean;
  active: boolean;
  rating: number;
  reviewCount: number;
  searchScore: number;
}

function getLongestWord(words: string[]): string {
  return words.reduce((a, b) => (a.length >= b.length ? a : b), "");
}

function computeRelevanceScore(
  entry: Pick<RawIndexEntry, "searchScore" | "nameLower" | "nameTokens">,
  queryLower: string,
  queryWords: string[]
): number {
  let score = entry.searchScore;

  if (entry.nameLower === queryLower) score += 100;
  else if (entry.nameLower.startsWith(queryLower)) score += 50;

  for (const word of queryWords) {
    if (entry.nameTokens.includes(word)) score += 10;
  }

  return score;
}

export async function searchProducts(
  rawQuery: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const {
    limit: resultLimit = 20,
    sortBy = "relevance",
    categorySlug,
    minPrice,
    maxPrice,
    inStockOnly = false,
  } = options;

  const queryLower = rawQuery.toLowerCase().trim();
  if (!queryLower) return [];

  const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 0);
  const anchorWord = getLongestWord(queryWords);

  const baseConstraints: QueryConstraint[] = [
    where("nameTokens", "array-contains", anchorWord),
    where("active", "==", true),
  ];

  if (categorySlug) {
    baseConstraints.push(where("categorySlug", "==", categorySlug));
  }

  if (sortBy === "price_asc") {
    baseConstraints.push(orderBy("price", "asc"));
  } else if (sortBy === "price_desc") {
    baseConstraints.push(orderBy("price", "desc"));
  } else {
    baseConstraints.push(orderBy("searchScore", "desc"));
  }

  baseConstraints.push(limit(100));

  const q = query(collection(db, SEARCH_INDEX_COLLECTION), ...baseConstraints);
  const snap = await getDocs(q);

  let entries = snap.docs.map((d) => d.data() as RawIndexEntry);

  if (queryWords.length > 1) {
    const otherWords = queryWords.filter((w) => w !== anchorWord);
    entries = entries.filter((entry) =>
      otherWords.every((w) =>
        entry.nameTokens.some((t) => t === w || t.startsWith(w))
      )
    );
  }

  if (inStockOnly) {
    entries = entries.filter((entry) => entry.inStock);
  }

  if (minPrice !== undefined) {
    entries = entries.filter((entry) => entry.price >= minPrice);
  }
  if (maxPrice !== undefined) {
    entries = entries.filter((entry) => entry.price <= maxPrice);
  }

  const results: SearchResult[] = entries.map((entry) => ({
    productId: entry.productId,
    name: entry.name,
    slug: entry.slug,
    price: entry.price,
    primaryImage: entry.primaryImage,
    categoryName: entry.categoryName,
    categorySlug: entry.categorySlug,
    rating: entry.rating,
    reviewCount: entry.reviewCount,
    labels: entry.labels,
    inStock: entry.inStock,
    relevanceScore: computeRelevanceScore(entry, queryLower, queryWords),
  }));

  if (sortBy === "relevance") {
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  } else if (sortBy === "rating") {
    results.sort((a, b) => b.rating - a.rating);
  }

  return results.slice(0, resultLimit);
}

export async function getSuggestions(rawQuery: string): Promise<Suggestion[]> {
  const queryLower = rawQuery.toLowerCase().trim();
  if (queryLower.length < 2) return [];

  const productQuery = query(
    collection(db, SEARCH_INDEX_COLLECTION),
    where("nameTokens", "array-contains", queryLower),
    where("active", "==", true),
    orderBy("searchScore", "desc"),
    limit(5)
  );

  const lastChar = rawQuery.trim().slice(-1);
  const nextChar = String.fromCharCode(lastChar.charCodeAt(0) + 1);
  const prefix = rawQuery.trim().slice(0, -1);
  const categoryQuery = query(
    collection(db, CATEGORIES_COLLECTION),
    where("name", ">=", rawQuery.trim()),
    where("name", "<", prefix + nextChar),
    limit(2)
  );

  const emptyDocs: QueryDocumentSnapshot<DocumentData>[] = [];

  const [productSnap, categorySnap] = await Promise.all([
    getDocs(productQuery),
    getDocs(categoryQuery).catch(() => ({ docs: emptyDocs })),
  ]);

  const productSuggestions: Suggestion[] = productSnap.docs.map((d) => {
    const data = d.data() as RawIndexEntry;
    return {
      text: data.name,
      type: "product" as const,
      slug: data.slug,
      image: data.primaryImage,
    };
  });

  const categorySuggestions: Suggestion[] = categorySnap.docs.map((d) => {
    const data = d.data();
    return {
      text: data.name as string,
      type: "category" as const,
      slug: data.slug as string,
    };
  });

  return [...productSuggestions, ...categorySuggestions].slice(0, 7);
}

export async function getPopularSearches(): Promise<string[]> {
  const q = query(
    collection(db, SEARCH_INDEX_COLLECTION),
    where("active", "==", true),
    orderBy("searchScore", "desc"),
    limit(20)
  );
  const snap = await getDocs(q);

  const seen = new Set<string>();
  const result: string[] = [];

  for (const d of snap.docs) {
    const data = d.data() as RawIndexEntry;
    const catName = data.categoryName;
    if (catName && !seen.has(catName)) {
      seen.add(catName);
      result.push(catName);
    }
    if (result.length >= 8) break;
  }

  return result;
}

export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT_SEARCHES) : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(rawQuery: string): void {
  const q = rawQuery.trim();
  if (!q) return;
  try {
    const existing = getRecentSearches();
    const filtered = existing.filter(
      (s) => s.toLowerCase() !== q.toLowerCase()
    );
    const updated = [q, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // ignore localStorage errors in restricted environments
  }
}

export function clearRecentSearchesStorage(): void {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // ignore
  }
}
