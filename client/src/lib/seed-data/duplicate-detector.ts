/**
 * Duplicate detector — prevents seeded comments from looking artificially
 * repetitive on the same product or across all products.
 *
 * Rules enforced:
 * - No two comments on the same product share the same reviewer name
 * - No two comments on the same product start with the same 5 words
 * - The same name does not appear more than `maxNameUses` times globally
 * - No exact-match duplicate content on the same product
 *
 * Usage: create one instance per seed run, share it across all products.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractOpener(content: string): string {
  return content
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .slice(0, 5)
    .join(" ");
}

// ---------------------------------------------------------------------------
// Main class
// ---------------------------------------------------------------------------

export class DuplicateDetector {
  private productNames = new Map<string, Set<string>>();
  private productOpeners = new Map<string, Set<string>>();
  private productContents = new Map<string, string[]>();
  private globalNameCount = new Map<string, number>();

  /** Maximum times the same name may appear across the entire seed run. */
  readonly maxNameUses: number;

  constructor(maxNameUses = 3) {
    this.maxNameUses = maxNameUses;
  }

  // ── Query helpers ──────────────────────────────────────────────────────────

  /** True if this reviewer name already has a comment on the given product. */
  isNameUsedOnProduct(productId: string, name: string): boolean {
    return this.productNames.get(productId)?.has(name) ?? false;
  }

  /** True if this name has already been used `maxNameUses` or more times globally. */
  isNameOverused(name: string): boolean {
    return (this.globalNameCount.get(name) ?? 0) >= this.maxNameUses;
  }

  /** True if the first 5 words of `content` already exist on this product. */
  isOpenerDuplicate(productId: string, content: string): boolean {
    const opener = extractOpener(content);
    return this.productOpeners.get(productId)?.has(opener) ?? false;
  }

  /** True if `content` is an exact match to any previously registered review on this product. */
  isSimilarToExisting(productId: string, content: string): boolean {
    const normalised = content.trim().toLowerCase();
    return (this.productContents.get(productId) ?? []).some(
      (e) => e.trim().toLowerCase() === normalised
    );
  }

  // ── Registration ───────────────────────────────────────────────────────────

  /** Registers a successfully placed comment so future calls respect the constraints. */
  register(productId: string, name: string, content: string): void {
    if (!this.productNames.has(productId)) this.productNames.set(productId, new Set());
    this.productNames.get(productId)!.add(name);

    this.globalNameCount.set(name, (this.globalNameCount.get(name) ?? 0) + 1);

    const opener = extractOpener(content);
    if (!this.productOpeners.has(productId)) this.productOpeners.set(productId, new Set());
    this.productOpeners.get(productId)!.add(opener);

    if (!this.productContents.has(productId)) this.productContents.set(productId, []);
    this.productContents.get(productId)!.push(content);
  }

  /**
   * Pre-loads existing comments for a product (real or seeded) so they count
   * toward the duplicate constraints during the current run.
   */
  loadExisting(
    productId: string,
    comments: Array<{ userName: string; content: string }>
  ): void {
    for (const c of comments) {
      this.register(productId, c.userName, c.content);
    }
  }
}
