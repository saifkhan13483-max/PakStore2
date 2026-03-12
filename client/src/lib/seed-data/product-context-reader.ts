/**
 * Product context reader — extracts product attributes and generates
 * contextual hints that make seeded reviews feel product-specific.
 *
 * Works for both the client-side seeder (Firebase SDK) and the CLI script.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProductContext {
  name: string;
  price?: number;
  discountPrice?: number;
  variants?: string[];
  description?: string;
  category?: string;
}

// ---------------------------------------------------------------------------
// Hint pools
// ---------------------------------------------------------------------------

const DISCOUNT_HINTS = [
  "Great deal at the sale price.",
  "Worth buying at this discounted price.",
  "Grabbed it during the sale — no regrets!",
  "The discount made it an even better value for money.",
  "Caught it on offer and very pleased with the decision.",
];

const HIGH_PRICE_HINTS = [
  "Worth the investment for sure.",
  "Definitely a premium product and worth every rupee.",
  "High price is fully justified by the quality.",
  "Expensive but absolutely worth it — no compromises on quality.",
  "You get what you pay for and this delivers.",
];

const LOW_PRICE_HINTS = [
  "Can't beat this price honestly.",
  "Incredible value at this price point.",
  "Good for the price — no complaints at all.",
  "Amazing what you get for this price!",
  "Budget-friendly and does not feel cheap at all.",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Normalises a raw Firestore variants field into a flat string array.
 * Handles string arrays, object arrays (with color/size/name keys), and nullish values.
 */
export function extractVariants(rawVariants: unknown): string[] {
  if (!rawVariants) return [];
  if (Array.isArray(rawVariants)) {
    return rawVariants
      .map((v) => {
        if (typeof v === "string") return v;
        if (typeof v === "object" && v !== null) {
          const obj = v as Record<string, unknown>;
          return String(obj["color"] ?? obj["size"] ?? obj["name"] ?? "");
        }
        return "";
      })
      .filter(Boolean);
  }
  return [];
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Generates a short contextual sentence based on product attributes.
 * Returns an empty string when no strong context signal is detected or
 * probability thresholds are not met (keeping most reviews unaffected).
 *
 * Only called for positive reviews (rating ≥ 3) — negative reviews rarely
 * mention price in a positive light.
 */
export function getProductContextHint(product: ProductContext, rating: number): string {
  if (rating < 3) return "";

  const candidates: string[] = [];

  // Discount pricing (~45% chance when applicable)
  if (
    product.discountPrice != null &&
    product.price != null &&
    product.discountPrice < product.price &&
    Math.random() < 0.45
  ) {
    candidates.push(pick(DISCOUNT_HINTS));
  }

  // High price >5000 PKR (~40% chance)
  if ((product.price ?? 0) > 5000 && Math.random() < 0.40) {
    candidates.push(pick(HIGH_PRICE_HINTS));
  }

  // Low price <500 PKR (~40% chance)
  if ((product.price ?? 99_999) < 500 && Math.random() < 0.40) {
    candidates.push(pick(LOW_PRICE_HINTS));
  }

  // Variant mention (~35% chance when variants exist)
  if (product.variants && product.variants.length > 0 && Math.random() < 0.35) {
    const variant = pick(product.variants);
    candidates.push(`Ordered the ${variant} — looks exactly like the pictures.`);
  }

  if (candidates.length === 0) return "";
  return pick(candidates);
}
