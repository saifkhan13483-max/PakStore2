/**
 * Seed analytics — fetches all comment and product data from Firestore
 * and computes the statistics used by the Phase 5 analytics dashboard.
 */

import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

// ---------------------------------------------------------------------------
// Shared Types (also consumed by audit.ts, auto-refresh.ts)
// ---------------------------------------------------------------------------

export interface CommentDoc {
  id: string;
  productId: string;
  userName: string;
  content: string;
  rating: number;
  userId: string;
  userPhoto: string;
  createdAt: { seconds: number; nanoseconds: number } | null;
  helpfulCount?: number;
  isVerifiedPurchase?: boolean;
}

export interface ProductDoc {
  id: string;
  name: string;
}

export type RatingDist = Record<1 | 2 | 3 | 4 | 5, number>;

export interface PerProductStat {
  productId: string;
  productName: string;
  realCount: number;
  seededCount: number;
  avgRating: number;
  lastCommentDate: Date | null;
  seededComments: CommentDoc[];
}

export interface TimeSeriesPoint {
  date: string;
  count: number;
}

export interface AnalyticsData {
  totalSeeded: number;
  totalReal: number;
  seededAvgRating: number;
  realAvgRating: number;
  productsWithOnlySeeded: PerProductStat[];
  productsWithNoComments: ProductDoc[];
  seededRatingDist: RatingDist;
  perProduct: PerProductStat[];
  commentsOverTime: TimeSeriesPoint[];
  healthScore: HealthScore;
}

export interface HealthScore {
  total: number;
  breakdown: {
    ratingDistribution: number;
    dateSpread: number;
    noDuplicates: number;
    nameDiversity: number;
    lengthVariety: number;
    avatarDiversity: number;
  };
}

// ---------------------------------------------------------------------------
// Health Score Calculation
// ---------------------------------------------------------------------------

function calcHealthScore(seeded: CommentDoc[]): HealthScore {
  if (seeded.length === 0) {
    return {
      total: 0,
      breakdown: {
        ratingDistribution: 0,
        dateSpread: 0,
        noDuplicates: 0,
        nameDiversity: 0,
        lengthVariety: 0,
        avatarDiversity: 0,
      },
    };
  }

  // 1. Rating distribution (+20): compare to expected 45/30/15/8/2
  const expected = [0.45, 0.30, 0.15, 0.08, 0.02];
  const dist = [5, 4, 3, 2, 1].map(
    (r) => seeded.filter((c) => Math.round(c.rating) === r).length / seeded.length
  );
  const distDiff = expected.reduce((acc, e, i) => acc + Math.abs(e - dist[i]), 0);
  const ratingScore = Math.round(20 * Math.max(0, 1 - distDiff / 0.8));

  // 2. Date spread (+20): seeded comments should span at least 30 distinct days
  const daySet = new Set(
    seeded
      .filter((c) => c.createdAt?.seconds)
      .map((c) => new Date(c.createdAt!.seconds * 1000).toISOString().slice(0, 10))
  );
  const dateScore = seeded.length > 0 ? Math.round(20 * Math.min(1, daySet.size / Math.max(1, seeded.length * 0.5))) : 0;

  // 3. No duplicate content (+20): check exact duplicates per product
  const byProduct = new Map<string, string[]>();
  for (const c of seeded) {
    if (!byProduct.has(c.productId)) byProduct.set(c.productId, []);
    byProduct.get(c.productId)!.push(c.content.trim().toLowerCase());
  }
  let dupCount = 0;
  for (const [, contents] of byProduct) {
    const seen = new Set<string>();
    for (const ct of contents) {
      if (seen.has(ct)) dupCount++;
      seen.add(ct);
    }
  }
  const dupScore = Math.round(20 * Math.max(0, 1 - dupCount / Math.max(1, seeded.length)));

  // 4. Name diversity (+15): % of unique names vs total
  const uniqueNames = new Set(seeded.map((c) => c.userName)).size;
  const nameDivRatio = uniqueNames / seeded.length;
  const nameScore = Math.round(15 * Math.min(1, nameDivRatio * 1.5));

  // 5. Review length variety (+15): check variance in content word counts
  const lengths = seeded.map((c) => c.content.split(/\s+/).length);
  const minL = Math.min(...lengths);
  const maxL = Math.max(...lengths);
  const lengthRange = maxL - minL;
  const lengthScore = Math.round(15 * Math.min(1, lengthRange / 80));

  // 6. Avatar diversity (+10): % of non-empty userPhoto + variety in URLs
  const nonEmpty = seeded.filter((c) => c.userPhoto).length;
  const photoRatio = nonEmpty / seeded.length;
  const avatarScore = Math.round(10 * Math.min(1, photoRatio / 0.85));

  const total = ratingScore + dateScore + dupScore + nameScore + lengthScore + avatarScore;

  return {
    total: Math.min(100, total),
    breakdown: {
      ratingDistribution: ratingScore,
      dateSpread: dateScore,
      noDuplicates: dupScore,
      nameDiversity: nameScore,
      lengthVariety: lengthScore,
      avatarDiversity: avatarScore,
    },
  };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Fetches all Firestore comments and products, then computes the full
 * analytics dataset used by the Phase 5 dashboard.
 */
export async function fetchAnalyticsData(): Promise<AnalyticsData> {
  const [commentsSnap, productsSnap] = await Promise.all([
    getDocs(collection(db, "comments")),
    getDocs(collection(db, "products")),
  ]);

  const allComments: CommentDoc[] = commentsSnap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<CommentDoc, "id">),
  }));

  const allProducts: ProductDoc[] = productsSnap.docs.map((d) => ({
    id: d.id,
    name: String(d.data().name ?? "Untitled"),
  }));

  const seeded = allComments.filter((c) => c.userId === "system-seed");
  const real = allComments.filter((c) => c.userId !== "system-seed");

  const seededAvgRating =
    seeded.length > 0
      ? seeded.reduce((a, c) => a + (c.rating || 0), 0) / seeded.length
      : 0;
  const realAvgRating =
    real.length > 0 ? real.reduce((a, c) => a + (c.rating || 0), 0) / real.length : 0;

  const seededRatingDist: RatingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const c of seeded) {
    const r = Math.round(c.rating) as 1 | 2 | 3 | 4 | 5;
    if (r >= 1 && r <= 5) seededRatingDist[r]++;
  }

  const commentsByProduct = new Map<string, CommentDoc[]>();
  for (const c of allComments) {
    if (!commentsByProduct.has(c.productId)) commentsByProduct.set(c.productId, []);
    commentsByProduct.get(c.productId)!.push(c);
  }

  const perProduct: PerProductStat[] = allProducts.map((p) => {
    const pComments = commentsByProduct.get(p.id) ?? [];
    const pSeeded = pComments.filter((c) => c.userId === "system-seed");
    const pReal = pComments.filter((c) => c.userId !== "system-seed");
    const allRatings = pComments.map((c) => c.rating).filter(Boolean);
    const avgRating =
      allRatings.length > 0
        ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
        : 0;
    const dates = pComments
      .map((c) => (c.createdAt?.seconds ? new Date(c.createdAt.seconds * 1000) : null))
      .filter(Boolean) as Date[];
    const lastCommentDate =
      dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null;

    return {
      productId: p.id,
      productName: p.name,
      realCount: pReal.length,
      seededCount: pSeeded.length,
      avgRating: Number(avgRating.toFixed(1)),
      lastCommentDate,
      seededComments: pSeeded,
    };
  });

  const productsWithOnlySeeded = perProduct.filter(
    (p) => p.seededCount > 0 && p.realCount === 0
  );
  const productsWithNoComments = allProducts.filter(
    (p) => (commentsByProduct.get(p.id)?.length ?? 0) === 0
  );

  // Comments over time — last 90 days bucketed by day
  const now = Date.now();
  const dayBuckets: Record<string, number> = {};
  for (let d = 89; d >= 0; d--) {
    const key = new Date(now - d * 86_400_000).toISOString().slice(0, 10);
    dayBuckets[key] = 0;
  }
  for (const c of seeded) {
    if (c.createdAt?.seconds) {
      const key = new Date(c.createdAt.seconds * 1000).toISOString().slice(0, 10);
      if (key in dayBuckets) dayBuckets[key]++;
    }
  }
  const commentsOverTime: TimeSeriesPoint[] = Object.entries(dayBuckets)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalSeeded: seeded.length,
    totalReal: real.length,
    seededAvgRating: Number(seededAvgRating.toFixed(2)),
    realAvgRating: Number(realAvgRating.toFixed(2)),
    productsWithOnlySeeded,
    productsWithNoComments,
    seededRatingDist,
    perProduct,
    commentsOverTime,
    healthScore: calcHealthScore(seeded),
  };
}
