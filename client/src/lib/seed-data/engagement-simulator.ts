/**
 * Engagement simulator for seeded comments.
 *
 * Generates realistic engagement signals — helpful vote counts, verified
 * purchase badges, and seller replies — that make seeded reviews look organic.
 * All fields are OPTIONAL on real user comments; this module only populates
 * them for seeded (userId === "system-seed") documents.
 */

// ---------------------------------------------------------------------------
// Seller reply templates keyed by sentiment
// ---------------------------------------------------------------------------

const SELLER_REPLIES = {
  positive: [
    "Thank you for your wonderful review! We are so glad you love your purchase. 😊",
    "We really appreciate your kind words! It means a lot to us. Thank you for shopping with PakCart!",
    "Thank you! Your satisfaction is our priority and reviews like yours make our day. 😊",
    "So happy to hear that! We hope to serve you again soon. Thank you for choosing PakCart!",
    "This made our team's day! Thank you so much for the kind review. 😊",
  ],
  neutral: [
    "Thank you for sharing your experience. Your feedback helps us improve our products and service!",
    "We appreciate you taking the time to leave a review. Your feedback is valuable to us!",
    "Thank you for your honest review. We will keep working to improve and hope to exceed your expectations next time!",
    "We hear you! Thank you for the feedback — we are always looking for ways to do better.",
  ],
  negative: [
    "We are sorry to hear this. Please contact our support team and we will make it right for you.",
    "We sincerely apologise for your experience. Please reach out to us so we can resolve this immediately.",
    "Thank you for letting us know. We take quality very seriously and would like to make this right — please contact support.",
    "We are sorry this did not meet your expectations. Our team would love the opportunity to fix this for you — please get in touch.",
  ],
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

/**
 * Simulates a "helpful" vote count correlated with review text length.
 * Longer, more detailed reviews naturally attract more helpful votes.
 */
export function generateHelpfulCount(content: string): number {
  const len = content.length;
  if (len < 30) return Math.floor(Math.random() * 3);        // 0–2
  if (len < 100) return Math.floor(Math.random() * 5) + 1;   // 1–5
  if (len < 200) return Math.floor(Math.random() * 7) + 2;   // 2–8
  return Math.floor(Math.random() * 11) + 5;                  // 5–15
}

/**
 * Returns true ~70% of the time, simulating a verified-purchase badge.
 */
export function generateIsVerifiedPurchase(): boolean {
  return Math.random() < 0.70;
}

export interface SellerReplyData {
  sellerReply: string;
  sellerReplyDate: Date;
}

/**
 * Returns a seller reply for ~20% of comments.
 * Reply sentiment matches the star rating.
 * Reply date is 1–3 days after the comment date (never in the future).
 */
export function generateSellerReply(
  rating: number,
  commentDate: Date
): SellerReplyData | null {
  if (Math.random() > 0.20) return null;

  const bucket = rating >= 4 ? "positive" : rating === 3 ? "neutral" : "negative";
  const pool = SELLER_REPLIES[bucket];
  const sellerReply = pool[Math.floor(Math.random() * pool.length)];

  const daysAfter = Math.floor(Math.random() * 3) + 1; // 1–3 days later
  let replyDate = new Date(commentDate.getTime() + daysAfter * 86_400_000);
  const now = new Date();
  if (replyDate > now) {
    replyDate = new Date(now.getTime() - 3_600_000); // cap at 1 hour ago
  }

  return { sellerReply, sellerReplyDate: replyDate };
}
