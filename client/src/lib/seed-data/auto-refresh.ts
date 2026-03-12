/**
 * Auto-refresh helpers — detects stale seeded products and new products
 * that haven't been seeded yet, powering the Phase 5 auto-maintenance UI.
 */

import type { PerProductStat } from "./analytics";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Products whose newest seeded comment is older than this are considered stale. */
const STALE_THRESHOLD_DAYS = 60;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StaleProduct {
  productId: string;
  productName: string;
  newestCommentDate: Date;
  seededCount: number;
  daysStale: number;
}

export interface NewUnseededProduct {
  productId: string;
  productName: string;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

/**
 * Returns all products where every seeded comment is older than
 * STALE_THRESHOLD_DAYS days — these need fresh review dates.
 */
export function detectStaleProducts(perProduct: PerProductStat[]): StaleProduct[] {
  const threshold = new Date(Date.now() - STALE_THRESHOLD_DAYS * 86_400_000);
  const now = Date.now();

  return perProduct
    .filter((p) => p.seededCount > 0 && p.lastCommentDate !== null)
    .filter((p) => p.lastCommentDate! < threshold)
    .map((p) => ({
      productId: p.productId,
      productName: p.productName,
      newestCommentDate: p.lastCommentDate!,
      seededCount: p.seededCount,
      daysStale: Math.floor((now - p.lastCommentDate!.getTime()) / 86_400_000),
    }))
    .sort((a, b) => a.newestCommentDate.getTime() - b.newestCommentDate.getTime());
}

/**
 * Returns all products that have zero comments (real or seeded) —
 * candidates for a quick "seed new products" one-click action.
 */
export function detectNewUnseededProducts(
  perProduct: PerProductStat[]
): NewUnseededProduct[] {
  return perProduct
    .filter((p) => p.seededCount === 0 && p.realCount === 0)
    .map((p) => ({ productId: p.productId, productName: p.productName }));
}
