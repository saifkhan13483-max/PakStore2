import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  Timestamp,
  deleteDoc,
  getDoc,
  orderBy,
  limit,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getRandomName, getDiceBearUrl } from "./seed-data/name-pool";
import {
  detectCategory,
  getCommentCount,
  generateReviewContent,
  generateClusteredTimestamps,
  generateRealisticTimestamp,
  type ProductCategory,
} from "./seed-data/review-templates";
import {
  generateHelpfulCount,
  generateIsVerifiedPurchase,
  generateSellerReply,
} from "./seed-data/engagement-simulator";

// ---------------------------------------------------------------------------
// Public Types
// ---------------------------------------------------------------------------

export interface SeedOptions {
  commentsPerProduct: number | "random";
  ratingBias: "realistic" | "positive" | "very_positive";
  includeReplies: boolean;
  includeVerified: boolean;
  dateRangeDays: number;
}

export const DEFAULT_SEED_OPTIONS: SeedOptions = {
  commentsPerProduct: "random",
  ratingBias: "realistic",
  includeReplies: true,
  includeVerified: true,
  dateRangeDays: 90,
};

export interface SeedProgress {
  current: number;
  total: number;
  currentProductName: string;
  commentsCreated: number;
  errors: string[];
  done: boolean;
}

export interface SeededStats {
  totalSeededComments: number;
  productsWithSeeded: number;
  productsWithNoComments: number;
  averageRating: number;
  lastSeeded: Date | null;
}

export interface SeedLog {
  id: string;
  action: "seed" | "delete";
  adminUserId: string;
  adminEmail: string;
  timestamp: { seconds: number; nanoseconds: number };
  scope: "all" | "empty_only" | "category" | "single_product";
  scopeDetail: string | null;
  commentsCreated: number;
  commentsDeleted: number;
  settings: Partial<SeedOptions> | null;
}

export interface PreviewComment {
  userName: string;
  userPhoto: string;
  rating: number;
  content: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  sellerReply: string | null;
  createdAt: Date;
}

export interface AdminUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

// ---------------------------------------------------------------------------
// Internal: Rating by Bias
// ---------------------------------------------------------------------------

function getRatingByBias(bias: SeedOptions["ratingBias"]): number {
  const roll = Math.random() * 100;
  if (bias === "realistic") {
    if (roll < 45) return 5;
    if (roll < 75) return 4;
    if (roll < 90) return 3;
    if (roll < 98) return 2;
    return 1;
  }
  if (bias === "positive") {
    if (roll < 60) return 5;
    if (roll < 90) return 4;
    if (roll < 98) return 3;
    return 2;
  }
  // very_positive
  if (roll < 80) return 5;
  if (roll < 98) return 4;
  return 3;
}

// ---------------------------------------------------------------------------
// Internal: Write Seed Log
// ---------------------------------------------------------------------------

async function writeSeedLog(params: {
  action: "seed" | "delete";
  scope: SeedLog["scope"];
  scopeDetail: string | null;
  admin: AdminUser;
  commentsCreated: number;
  commentsDeleted: number;
  settings: Partial<SeedOptions> | null;
}): Promise<void> {
  try {
    await addDoc(collection(db, "seed_logs"), {
      action: params.action,
      adminUserId: params.admin.uid,
      adminEmail: params.admin.email ?? "",
      timestamp: Timestamp.now(),
      scope: params.scope,
      scopeDetail: params.scopeDetail,
      commentsCreated: params.commentsCreated,
      commentsDeleted: params.commentsDeleted,
      settings: params.settings,
    });
  } catch (e) {
    console.warn("Failed to write seed log:", e);
  }
}

// ---------------------------------------------------------------------------
// Internal: Recalculate product averageRating after changes
// ---------------------------------------------------------------------------

async function recalcProductRating(productId: string): Promise<void> {
  const snap = await getDocs(
    query(collection(db, "comments"), where("productId", "==", productId))
  );
  const comments = snap.docs.map((d) => d.data());
  const total = comments.reduce((acc, c) => acc + (Number(c.rating) || 0), 0);
  const avg = comments.length > 0 ? Number((total / comments.length).toFixed(1)) : 0;
  await updateDoc(doc(db, "products", productId), {
    rating: avg,
    reviewCount: comments.length,
    updatedAt: Timestamp.now(),
  });
}

// ---------------------------------------------------------------------------
// Internal: Seed one product
// ---------------------------------------------------------------------------

async function seedOneProduct(
  productDoc: QueryDocumentSnapshot,
  options: SeedOptions,
  signal: AbortSignal
): Promise<number> {
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");

  const productId = productDoc.id;
  const data = productDoc.data();
  const productName: string = data.name ?? "this product";
  const product = {
    name: productName,
    category: data.category ?? data.categoryName ?? "",
    price: data.price ?? data.discountedPrice ?? 0,
    description: data.description ?? "",
  };

  // Delete existing seeded comments
  const oldSnap = await getDocs(
    query(
      collection(db, "comments"),
      where("productId", "==", productId),
      where("userId", "==", "system-seed")
    )
  );
  for (const oldDoc of oldSnap.docs) {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    await deleteDoc(doc(db, "comments", oldDoc.id));
  }

  const category = detectCategory(product);
  const numComments =
    options.commentsPerProduct === "random"
      ? getCommentCount(product)
      : Math.max(1, Math.min(10, Number(options.commentsPerProduct)));

  const timestamps = generateClusteredTimestamps(numComments, options.dateRangeDays);
  let created = 0;

  for (let i = 0; i < numComments; i++) {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");

    const { name } = getRandomName();
    const rating = getRatingByBias(options.ratingBias);
    const content = generateReviewContent(productName, category, rating as 1 | 2 | 3 | 4 | 5);
    const commentDate = timestamps[i];
    const firestoreTs = Timestamp.fromDate(commentDate);
    const helpfulCount = generateHelpfulCount(content);
    const isVerifiedPurchase = options.includeVerified ? generateIsVerifiedPurchase() : false;
    const replyData = options.includeReplies ? generateSellerReply(rating, commentDate) : null;

    await addDoc(collection(db, "comments"), {
      productId,
      userName: name,
      content,
      rating,
      userId: "system-seed",
      userPhoto: getDiceBearUrl(name),
      createdAt: firestoreTs,
      updatedAt: firestoreTs,
      helpfulCount,
      isVerifiedPurchase,
      sellerReply: replyData?.sellerReply ?? null,
      sellerReplyDate: replyData ? Timestamp.fromDate(replyData.sellerReplyDate) : null,
    });
    created++;
  }

  await recalcProductRating(productId);
  return created;
}

// ---------------------------------------------------------------------------
// Internal: Batch processor
// ---------------------------------------------------------------------------

async function runSeedBatch(
  productDocs: QueryDocumentSnapshot[],
  options: SeedOptions,
  onProgress: (p: SeedProgress) => void,
  signal: AbortSignal
): Promise<{ created: number; errors: string[] }> {
  const total = productDocs.length;
  let commentsCreated = 0;
  const errors: string[] = [];
  const BATCH_SIZE = 10;

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = productDocs.slice(i, i + BATCH_SIZE);

    for (const productDoc of batch) {
      if (signal.aborted) throw new DOMException("Aborted", "AbortError");

      const current = i + batch.indexOf(productDoc) + 1;
      const productName = String(productDoc.data().name ?? "Product");
      onProgress({ current, total, currentProductName: productName, commentsCreated, errors, done: false });

      try {
        const count = await seedOneProduct(productDoc, options, signal);
        commentsCreated += count;
      } catch (e: any) {
        if (e.name === "AbortError" || signal.aborted) throw e;
        console.error(`Failed to seed ${productName}:`, e);
        errors.push(`${productName}: ${e.message}`);
      }
    }
  }

  onProgress({ current: total, total, currentProductName: "", commentsCreated, errors, done: true });
  return { created: commentsCreated, errors };
}

// ---------------------------------------------------------------------------
// Public API: Stats & Logs
// ---------------------------------------------------------------------------

/** Fetches aggregate statistics about seeded comments across the store. */
export async function getSeededStats(): Promise<SeededStats> {
  const [seededSnap, productsSnap, allCommentsSnap] = await Promise.all([
    getDocs(query(collection(db, "comments"), where("userId", "==", "system-seed"))),
    getDocs(collection(db, "products")),
    getDocs(collection(db, "comments")),
  ]);

  const seededComments = seededSnap.docs.map((d) => d.data());
  const productIds = productsSnap.docs.map((d) => d.id);
  const productIdsWithComments = new Set(allCommentsSnap.docs.map((d) => d.data().productId));
  const productIdsWithSeeded = new Set(seededComments.map((c) => c.productId));
  const totalRating = seededComments.reduce((acc, c) => acc + (Number(c.rating) || 0), 0);
  const avgRating = seededComments.length > 0 ? totalRating / seededComments.length : 0;

  const timestamps = seededComments
    .map((c) => (c.createdAt?.seconds ? new Date(c.createdAt.seconds * 1000) : null))
    .filter(Boolean) as Date[];

  const lastSeeded =
    timestamps.length > 0 ? new Date(Math.max(...timestamps.map((d) => d.getTime()))) : null;

  return {
    totalSeededComments: seededComments.length,
    productsWithSeeded: productIdsWithSeeded.size,
    productsWithNoComments: productIds.filter((id) => !productIdsWithComments.has(id)).length,
    averageRating: Number(avgRating.toFixed(1)),
    lastSeeded,
  };
}

/** Returns the last 20 seed action logs from Firestore. */
export async function getSeedLogs(): Promise<SeedLog[]> {
  try {
    const snap = await getDocs(
      query(collection(db, "seed_logs"), orderBy("timestamp", "desc"), limit(20))
    );
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SeedLog));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Public API: Count helpers (pre-confirmation counts for the UI)
// ---------------------------------------------------------------------------

export async function countSeededAll(): Promise<number> {
  const snap = await getDocs(
    query(collection(db, "comments"), where("userId", "==", "system-seed"))
  );
  return snap.size;
}

export async function countSeededByCategory(category: ProductCategory): Promise<number> {
  const [productsSnap, seededSnap] = await Promise.all([
    getDocs(collection(db, "products")),
    getDocs(query(collection(db, "comments"), where("userId", "==", "system-seed"))),
  ]);
  const categoryProductIds = new Set(
    productsSnap.docs
      .filter((d) => {
        const data = d.data();
        return (
          detectCategory({ name: data.name || "", category: data.category || data.categoryName || "" }) === category
        );
      })
      .map((d) => d.id)
  );
  return seededSnap.docs.filter((d) => categoryProductIds.has(d.data().productId)).length;
}

export async function countSeededOlderThan(date: Date): Promise<number> {
  const snap = await getDocs(
    query(collection(db, "comments"), where("userId", "==", "system-seed"))
  );
  return snap.docs.filter((d) => {
    const sec = d.data().createdAt?.seconds;
    return sec && new Date(sec * 1000) < date;
  }).length;
}

// ---------------------------------------------------------------------------
// Public API: Seed Actions
// ---------------------------------------------------------------------------

/** Seeds all products in the database. Replaces any existing seeded comments. */
export async function seedAllProducts(
  options: SeedOptions,
  admin: AdminUser,
  onProgress: (p: SeedProgress) => void,
  signal: AbortSignal
): Promise<{ created: number; errors: string[] }> {
  const snap = await getDocs(collection(db, "products"));
  const result = await runSeedBatch(snap.docs, options, onProgress, signal);
  await writeSeedLog({
    action: "seed", scope: "all", scopeDetail: null,
    admin, commentsCreated: result.created, commentsDeleted: 0, settings: options,
  });
  return result;
}

/** Seeds only products that currently have zero comments (real or seeded). */
export async function seedEmptyProducts(
  options: SeedOptions,
  admin: AdminUser,
  onProgress: (p: SeedProgress) => void,
  signal: AbortSignal
): Promise<{ created: number; errors: string[] }> {
  const [productsSnap, commentsSnap] = await Promise.all([
    getDocs(collection(db, "products")),
    getDocs(collection(db, "comments")),
  ]);
  const commentedIds = new Set(commentsSnap.docs.map((d) => d.data().productId));
  const emptyDocs = productsSnap.docs.filter((d) => !commentedIds.has(d.id));
  const result = await runSeedBatch(emptyDocs, options, onProgress, signal);
  await writeSeedLog({
    action: "seed", scope: "empty_only", scopeDetail: null,
    admin, commentsCreated: result.created, commentsDeleted: 0, settings: options,
  });
  return result;
}

/** Seeds all products whose detected category matches the provided category. */
export async function seedByCategory(
  category: ProductCategory,
  options: SeedOptions,
  admin: AdminUser,
  onProgress: (p: SeedProgress) => void,
  signal: AbortSignal
): Promise<{ created: number; errors: string[] }> {
  const snap = await getDocs(collection(db, "products"));
  const categoryDocs = snap.docs.filter((d) => {
    const data = d.data();
    return (
      detectCategory({ name: data.name || "", category: data.category || data.categoryName || "" }) === category
    );
  });
  const result = await runSeedBatch(categoryDocs, options, onProgress, signal);
  await writeSeedLog({
    action: "seed", scope: "category", scopeDetail: category,
    admin, commentsCreated: result.created, commentsDeleted: 0, settings: options,
  });
  return result;
}

/** Seeds a single product by its Firestore document ID. */
export async function seedSingleProduct(
  productId: string,
  options: SeedOptions,
  admin: AdminUser,
  onProgress: (p: SeedProgress) => void,
  signal: AbortSignal
): Promise<{ created: number; errors: string[] }> {
  const productDoc = await getDoc(doc(db, "products", productId));
  if (!productDoc.exists()) throw new Error("Product not found");
  const result = await runSeedBatch(
    [productDoc as unknown as QueryDocumentSnapshot],
    options,
    onProgress,
    signal
  );
  await writeSeedLog({
    action: "seed", scope: "single_product", scopeDetail: productId,
    admin, commentsCreated: result.created, commentsDeleted: 0, settings: options,
  });
  return result;
}

// ---------------------------------------------------------------------------
// Public API: Cleanup Actions
// ---------------------------------------------------------------------------

/** Deletes all seeded comments across all products. Returns the number deleted. */
export async function clearAllSeeded(admin: AdminUser): Promise<number> {
  const snap = await getDocs(
    query(collection(db, "comments"), where("userId", "==", "system-seed"))
  );
  const affectedProductIds = new Set(snap.docs.map((d) => d.data().productId as string));
  for (const d of snap.docs) {
    await deleteDoc(doc(db, "comments", d.id));
  }
  for (const pid of affectedProductIds) {
    await recalcProductRating(pid);
  }
  await writeSeedLog({
    action: "delete", scope: "all", scopeDetail: null,
    admin, commentsCreated: 0, commentsDeleted: snap.size, settings: null,
  });
  return snap.size;
}

/** Deletes seeded comments only for products in the given category. */
export async function clearSeededByCategory(
  category: ProductCategory,
  admin: AdminUser
): Promise<number> {
  const productsSnap = await getDocs(collection(db, "products"));
  const categoryProductIds = new Set(
    productsSnap.docs
      .filter((d) => {
        const data = d.data();
        return (
          detectCategory({ name: data.name || "", category: data.category || data.categoryName || "" }) === category
        );
      })
      .map((d) => d.id)
  );

  let deleted = 0;
  const affectedProductIds = new Set<string>();

  for (const pid of categoryProductIds) {
    const snap = await getDocs(
      query(
        collection(db, "comments"),
        where("productId", "==", pid),
        where("userId", "==", "system-seed")
      )
    );
    for (const d of snap.docs) {
      await deleteDoc(doc(db, "comments", d.id));
      affectedProductIds.add(pid);
      deleted++;
    }
  }
  for (const pid of affectedProductIds) {
    await recalcProductRating(pid);
  }
  await writeSeedLog({
    action: "delete", scope: "category", scopeDetail: category,
    admin, commentsCreated: 0, commentsDeleted: deleted, settings: null,
  });
  return deleted;
}

/** Deletes all seeded comments whose createdAt is older than the provided date. */
export async function clearSeededOlderThan(date: Date, admin: AdminUser): Promise<number> {
  const snap = await getDocs(
    query(collection(db, "comments"), where("userId", "==", "system-seed"))
  );
  let deleted = 0;
  const affectedProductIds = new Set<string>();

  for (const d of snap.docs) {
    const data = d.data();
    const sec = data.createdAt?.seconds;
    if (sec && new Date(sec * 1000) < date) {
      await deleteDoc(doc(db, "comments", d.id));
      affectedProductIds.add(data.productId as string);
      deleted++;
    }
  }
  for (const pid of affectedProductIds) {
    await recalcProductRating(pid);
  }
  await writeSeedLog({
    action: "delete", scope: "all", scopeDetail: `older than ${date.toLocaleDateString()}`,
    admin, commentsCreated: 0, commentsDeleted: deleted, settings: null,
  });
  return deleted;
}

// ---------------------------------------------------------------------------
// Public API: Preview Generator (no Firestore writes)
// ---------------------------------------------------------------------------

const PREVIEW_SAMPLE_PRODUCTS = [
  { name: "Premium Leather Bag", category: "bags", price: 4500 },
  { name: "Classic Men's Watch", category: "watches", price: 3200 },
  { name: "Comfort Home Slippers", category: "slippers", price: 900 },
  { name: "Soft Cotton Bedsheet Set", category: "bedsheets", price: 2800 },
  { name: "Casual Leather Sneakers", category: "shoes", price: 2200 },
];

/**
 * Generates sample preview comments without writing anything to Firestore.
 * Used by the admin page to let admins see what comments would look like
 * before committing to a seed run.
 */
export function generateCommentPreview(options: SeedOptions, count = 4): PreviewComment[] {
  return Array.from({ length: count }).map((_, i) => {
    const sample = PREVIEW_SAMPLE_PRODUCTS[i % PREVIEW_SAMPLE_PRODUCTS.length];
    const { name } = getRandomName();
    const rating = getRatingByBias(options.ratingBias);
    const content = generateReviewContent(
      sample.name,
      sample.category as ProductCategory,
      rating as 1 | 2 | 3 | 4 | 5
    );
    const commentDate = generateRealisticTimestamp();
    const replyData = options.includeReplies ? generateSellerReply(rating, commentDate) : null;

    return {
      userName: name,
      userPhoto: getDiceBearUrl(name),
      rating,
      content,
      isVerifiedPurchase: options.includeVerified ? generateIsVerifiedPurchase() : false,
      helpfulCount: generateHelpfulCount(content),
      sellerReply: replyData?.sellerReply ?? null,
      createdAt: commentDate,
    };
  });
}

// ---------------------------------------------------------------------------
// Backward Compatibility
// ---------------------------------------------------------------------------

/** @deprecated Use seedAllProducts() instead. Kept for backward compatibility. */
export async function seedRandomComments(): Promise<true> {
  const ac = new AbortController();
  await seedAllProducts(
    DEFAULT_SEED_OPTIONS,
    { uid: "system", email: "admin@system" },
    () => {},
    ac.signal
  );
  return true;
}
