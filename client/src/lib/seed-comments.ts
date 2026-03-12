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
import { applyNaturalness } from "./seed-data/naturalness-engine";
import {
  getProductContextHint,
  extractVariants,
  type ProductContext,
} from "./seed-data/product-context-reader";
import { getSeasonalNote } from "./seed-data/seasonal-context";
import { DuplicateDetector } from "./seed-data/duplicate-detector";

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

/**
 * Phase 4: Nudges a rating toward the real average so seeded comments
 * don't dramatically differ from genuine reviews on the same product.
 *
 * If the real average is < 3.5, prevents seeding an all-5-star set.
 * If the real average is > 4.2, prevents seeding heavy 1-2 star reviews.
 */
function nudgeRating(raw: number, realAvg: number): number {
  if (realAvg < 3.5 && raw === 5 && Math.random() < 0.6) {
    return Math.max(2, Math.round(realAvg) + (Math.random() < 0.5 ? 0 : 1));
  }
  if (realAvg > 4.2 && raw <= 2 && Math.random() < 0.7) {
    return 3;
  }
  return raw;
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
// Internal: Build enriched review content (Phase 4 pipeline)
// ---------------------------------------------------------------------------

/**
 * Generates a review string using:
 * 1. Category-matched template (Phases 1–2)
 * 2. Naturalness imperfections (Phase 4)
 * 3. Product context hint — price/variant mentions (Phase 4)
 * 4. Seasonal/occasion note (Phase 4)
 */
function buildReviewContent(
  productName: string,
  category: ProductCategory,
  rating: 1 | 2 | 3 | 4 | 5,
  productCtx: ProductContext,
  commentDate: Date
): string {
  let content = generateReviewContent(productName, category, rating);
  content = applyNaturalness(content);

  const contextHint = getProductContextHint(productCtx, rating);
  if (contextHint) content = content.trimEnd() + " " + contextHint;

  const seasonalNote = getSeasonalNote(commentDate, category);
  if (seasonalNote) content = content.trimEnd() + " " + seasonalNote;

  return content;
}

// ---------------------------------------------------------------------------
// Internal: Seed one product  (Phase 4 enhanced)
// ---------------------------------------------------------------------------

async function seedOneProduct(
  productDoc: QueryDocumentSnapshot,
  options: SeedOptions,
  signal: AbortSignal,
  detector: DuplicateDetector
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

  // Phase 4: fetch real (non-seeded) comments for graceful coexistence
  const realSnap = await getDocs(
    query(collection(db, "comments"), where("productId", "==", productId))
  );
  const realComments = realSnap.docs
    .map((d) => d.data())
    .filter((c) => c.userId !== "system-seed");

  // Pre-load real comments into the detector so names/openers are respected
  detector.loadExisting(
    productId,
    realComments.map((c) => ({
      userName: String(c.userName ?? ""),
      content: String(c.content ?? ""),
    }))
  );

  // Phase 4: cap seeded count at 3 when real comments already exist
  const rawCount =
    options.commentsPerProduct === "random"
      ? getCommentCount(product)
      : Math.max(1, Math.min(10, Number(options.commentsPerProduct)));
  const numComments = realComments.length > 0 ? Math.min(3, rawCount) : rawCount;

  // Phase 4: compute real average for rating nudging
  const realAvg =
    realComments.length > 0
      ? realComments.reduce((acc, c) => acc + (Number(c.rating) || 0), 0) /
        realComments.length
      : -1;

  const category = detectCategory(product);
  const timestamps = generateClusteredTimestamps(numComments, options.dateRangeDays);

  // Phase 4: build full product context for context hint generation
  const productCtx: ProductContext = {
    name: productName,
    price: data.price ?? data.discountedPrice,
    discountPrice: data.discountedPrice ?? data.discountPrice,
    variants: extractVariants(data.variants ?? data.colors ?? data.sizes),
    description: data.description,
    category: product.category,
  };

  let created = 0;

  for (let i = 0; i < numComments; i++) {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");

    // Phase 4: smart name picking — retry up to 20 times to avoid duplicates
    let selectedName = getRandomName();
    for (let attempt = 0; attempt < 20; attempt++) {
      const candidate = getRandomName();
      if (
        !detector.isNameUsedOnProduct(productId, candidate.name) &&
        !detector.isNameOverused(candidate.name)
      ) {
        selectedName = candidate;
        break;
      }
    }

    const rawRating = getRatingByBias(options.ratingBias);
    const rating = realAvg >= 0 ? nudgeRating(rawRating, realAvg) : rawRating;
    const commentDate = timestamps[i];

    // Phase 4: build content with dedup retry
    let content = buildReviewContent(
      productName,
      category,
      rating as 1 | 2 | 3 | 4 | 5,
      productCtx,
      commentDate
    );
    let dedupAttempts = 0;
    while (
      (detector.isOpenerDuplicate(productId, content) ||
        detector.isSimilarToExisting(productId, content)) &&
      dedupAttempts < 5
    ) {
      content = buildReviewContent(
        productName,
        category,
        rating as 1 | 2 | 3 | 4 | 5,
        productCtx,
        commentDate
      );
      dedupAttempts++;
    }

    detector.register(productId, selectedName.name, content);

    const firestoreTs = Timestamp.fromDate(commentDate);
    const helpfulCount = generateHelpfulCount(content);
    const isVerifiedPurchase = options.includeVerified ? generateIsVerifiedPurchase() : false;
    const replyData = options.includeReplies ? generateSellerReply(rating, commentDate) : null;

    // Phase 4: gender-aware avatar with diversity (15% no-avatar chance built into getDiceBearUrl)
    const userPhoto = getDiceBearUrl(selectedName.name, selectedName.gender);

    await addDoc(collection(db, "comments"), {
      productId,
      userName: selectedName.name,
      content,
      rating,
      userId: "system-seed",
      userPhoto,
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
// Internal: Batch processor  (threads DuplicateDetector through all products)
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

  // Phase 4: one shared detector per entire seed run
  const detector = new DuplicateDetector(3);

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = productDocs.slice(i, i + BATCH_SIZE);

    for (const productDoc of batch) {
      if (signal.aborted) throw new DOMException("Aborted", "AbortError");

      const current = i + batch.indexOf(productDoc) + 1;
      const productName = String(productDoc.data().name ?? "Product");
      onProgress({ current, total, currentProductName: productName, commentsCreated, errors, done: false });

      try {
        const count = await seedOneProduct(productDoc, options, signal, detector);
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

const PREVIEW_SAMPLE_PRODUCTS: Array<ProductContext & { category: string }> = [
  { name: "Premium Leather Bag", category: "bags", price: 4500 },
  { name: "Classic Men's Watch", category: "watches", price: 3200 },
  { name: "Comfort Home Slippers", category: "slippers", price: 900 },
  { name: "Soft Cotton Bedsheet Set", category: "bedsheets", price: 2800 },
  { name: "Casual Leather Sneakers", category: "shoes", price: 2200 },
];

/**
 * Generates sample preview comments without writing anything to Firestore.
 * Phase 4: applies the full intelligence pipeline (naturalness, context hints,
 * seasonal notes, avatar diversity, dedup) to previews as well.
 */
export function generateCommentPreview(options: SeedOptions, count = 4): PreviewComment[] {
  const detector = new DuplicateDetector(3);
  const results: PreviewComment[] = [];

  for (let i = 0; i < count; i++) {
    const sample = PREVIEW_SAMPLE_PRODUCTS[i % PREVIEW_SAMPLE_PRODUCTS.length];
    const selectedName = getRandomName();
    const rawRating = getRatingByBias(options.ratingBias);
    const commentDate = generateRealisticTimestamp();

    let content = buildReviewContent(
      sample.name,
      sample.category as ProductCategory,
      rawRating as 1 | 2 | 3 | 4 | 5,
      sample,
      commentDate
    );

    let dedupAttempts = 0;
    const previewId = `preview-${i}`;
    while (
      (detector.isOpenerDuplicate(previewId, content) ||
        detector.isSimilarToExisting(previewId, content)) &&
      dedupAttempts < 5
    ) {
      content = buildReviewContent(
        sample.name,
        sample.category as ProductCategory,
        rawRating as 1 | 2 | 3 | 4 | 5,
        sample,
        commentDate
      );
      dedupAttempts++;
    }
    detector.register(previewId, selectedName.name, content);

    const replyData = options.includeReplies ? generateSellerReply(rawRating, commentDate) : null;

    results.push({
      userName: selectedName.name,
      userPhoto: getDiceBearUrl(selectedName.name, selectedName.gender),
      rating: rawRating,
      content,
      isVerifiedPurchase: options.includeVerified ? generateIsVerifiedPurchase() : false,
      helpfulCount: generateHelpfulCount(content),
      sellerReply: replyData?.sellerReply ?? null,
      createdAt: commentDate,
    });
  }

  return results;
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
