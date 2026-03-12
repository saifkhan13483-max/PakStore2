/**
 * Product-aware review template engine.
 *
 * Provides category detection, weighted rating distribution,
 * realistic timestamp generation, variable comment counts,
 * and 50+ review templates organised by category and rating tier.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProductCategory =
  | "bags"
  | "watches"
  | "slippers"
  | "bedsheets"
  | "shoes"
  | "clothing"
  | "general";

export interface SeedProduct {
  name: string;
  category?: string;
  price?: number;
  description?: string;
}

// ---------------------------------------------------------------------------
// Category Detection
// ---------------------------------------------------------------------------

/**
 * Infers a broad review category from the product's category string or name.
 */
export function detectCategory(product: SeedProduct): ProductCategory {
  const haystack = `${product.category ?? ""} ${product.name ?? ""}`.toLowerCase();

  if (/bag|purse|handbag|clutch|tote|satchel|pouch/.test(haystack)) return "bags";
  if (/watch|timepiece|chronograph|wrist/.test(haystack)) return "watches";
  if (/slipper|chappal|flip.?flop|sandal|mule/.test(haystack)) return "slippers";
  if (/bedsheet|bed.?sheet|linen|duvet|pillow.?cover|comforter|quilt/.test(haystack)) return "bedsheets";
  if (/shoe|boot|sneaker|loafer|heel|pump|oxford/.test(haystack)) return "shoes";
  if (/shirt|kurta|kameez|trouser|dress|suit|fabric|cloth/.test(haystack)) return "clothing";
  return "general";
}

// ---------------------------------------------------------------------------
// Weighted Rating Distribution
// ---------------------------------------------------------------------------

/**
 * Picks a star rating using a realistic weighted distribution:
 * 5★ 45% | 4★ 30% | 3★ 15% | 2★ 8% | 1★ 2%
 */
export function getRealisticRating(): number {
  const roll = Math.random() * 100;
  if (roll < 45) return 5;
  if (roll < 75) return 4;
  if (roll < 90) return 3;
  if (roll < 98) return 2;
  return 1;
}

// ---------------------------------------------------------------------------
// Comment Count
// ---------------------------------------------------------------------------

/**
 * Returns how many seeded comments to create for a product.
 * Cheaper products tend to have more buyers → more reviews.
 */
export function getCommentCount(product: SeedProduct): number {
  const price = product.price ?? 5000;
  if (price < 1000) return Math.floor(Math.random() * 3) + 5; // 5-7
  if (price < 3000) return Math.floor(Math.random() * 3) + 4; // 4-6
  if (price < 7000) return Math.floor(Math.random() * 3) + 3; // 3-5
  return Math.floor(Math.random() * 3) + 2;                    // 2-4
}

// ---------------------------------------------------------------------------
// Timestamp Generation
// ---------------------------------------------------------------------------

/**
 * Generates a random Firestore-compatible timestamp spread over the last
 * 1–90 days, weighted toward realistic Pakistani waking hours (9 AM–11 PM PKT).
 */
export function generateRealisticTimestamp(): Date {
  const now = Date.now();
  const daysAgo = Math.floor(Math.random() * 90) + 1;
  const msAgo = daysAgo * 24 * 60 * 60 * 1000;

  // Pick a realistic hour (9 AM – 11 PM PKT = UTC+5, stored as UTC)
  const hour = weightedHour();
  const minute = Math.floor(Math.random() * 60);
  const second = Math.floor(Math.random() * 60);

  const base = new Date(now - msAgo);
  // Set hour in PKT (subtract 5 hours for UTC storage)
  base.setUTCHours(((hour - 5) + 24) % 24, minute, second, 0);
  return base;
}

/** Picks an hour (0-23) weighted toward 9-23. */
function weightedHour(): number {
  const activeHours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  return activeHours[Math.floor(Math.random() * activeHours.length)];
}

// ---------------------------------------------------------------------------
// Review Templates  (50+ across categories and rating tiers)
// ---------------------------------------------------------------------------

type RatingTier = 5 | 4 | 3 | 2 | 1;

interface TemplatePool {
  [key: string]: {
    [R in RatingTier]?: string[];
  };
}

const TEMPLATES: TemplatePool = {
  bags: {
    5: [
      "Absolutely love my {productName}! The quality is top-notch and the colour is exactly as shown. Already getting compliments everywhere I go!",
      "This {productName} exceeded all my expectations. The stitching is perfect, it fits everything I need, and it looks stunning. Worth every rupee!",
      "Been using the {productName} for a few weeks now and I am completely in love. Spacious, stylish, and very durable. Highly recommend to everyone!",
      "Gifted this {productName} to my sister and she absolutely adores it. The packaging was beautiful too. Definitely ordering again from PakCart!",
      "Second time ordering the {productName}. Quality remains consistent and delivery was faster than expected. 5 stars without hesitation!",
      "Tried several alternatives before settling on this. The {productName} is by far the best in this price range — premium feel at an accessible price.",
      "Bought the {productName} as an Eid gift for my wife. She was thrilled! The zip quality, interior pockets, and overall finish are all excellent.",
    ],
    4: [
      "The {productName} is really nice — great material and a good size. The strap could be slightly longer for my liking but overall very satisfied.",
      "Happy with my {productName}. Quality is good and it looks exactly like the photos. Delivery took 3 days which is acceptable. Would buy again.",
      "Really like the {productName}. Sturdy, stylish, and spacious. One small note — the colour is slightly darker than in the listing photo, but still beautiful.",
      "Good quality bag. The {productName} is well-stitched and the hardware feels solid. Docking one star only because the dust bag was missing. Still recommended!",
      "Solid purchase. The {productName} is exactly what I needed for daily use — not too big, not too small. Great value for the price.",
    ],
    3: [
      "The {productName} is decent but I expected slightly thicker leather at this price. It looks nice and serves its purpose, so it is fine overall.",
      "Mixed feelings on the {productName}. The design is lovely but one of the inner pockets is smaller than shown. Functional enough but not perfect.",
      "The {productName} looks good but packaging was a bit rough on arrival — there was a small scratch on the clasp. Customer service helped resolve it quickly though.",
      "Average quality for the price. The {productName} works fine for casual use. Would not call it premium but it does the job.",
    ],
    2: [
      "Disappointed with the {productName}. The stitching on one side started coming loose after just two weeks of light use. Expected better quality at this price.",
      "The {productName} looks different from the product photos — much shinier material in person. Not what I was expecting. Quality feels cheap.",
    ],
    1: [
      "The {productName} arrived with a broken zipper. Very poor quality control. Contacted support but still waiting for a response.",
    ],
  },

  watches: {
    5: [
      "The {productName} is simply stunning. The dial is crisp, the strap feels premium, and it keeps perfect time. Everyone keeps asking where I bought it!",
      "Bought the {productName} for Eid and it made the perfect gift. My husband was thrilled with the quality at this price point. Highly recommended!",
      "This {productName} looks way more expensive than what I paid. Build quality is solid and the finishing is impeccable. Very happy with this purchase.",
      "Absolutely love the {productName}. Comfortable on the wrist, accurate timekeeping, and the design turns heads. Brilliant value for money.",
      "Third watch I have bought from PakCart and the {productName} is the best yet. Packaging was secure and delivery was on time. 5 stars!",
      "Tried many local alternatives — the {productName} is by far the most reliable and well-built in this segment. Highly recommend to watch enthusiasts.",
    ],
    4: [
      "The {productName} is a great looking timepiece. Crown feels a little stiff but everything else is top quality. Good purchase overall.",
      "Happy with the {productName}. Looks exactly like the photos and feels solid on the wrist. Loses maybe a minute per month which is acceptable at this price.",
      "Nice watch overall. The {productName} has a clean design and the strap is comfortable. Strap buckle could be smoother but I am satisfied.",
      "Good value. The {productName} functions perfectly and the dial is very easy to read. Packaging was secure. Would buy again.",
    ],
    3: [
      "The {productName} looks fine but the back case scratches very easily. Keeping it in the original box when not in use. Design is lovely though.",
      "Decent watch for the price. The {productName} keeps accurate time but the luminous hands are barely visible in the dark. Expected slightly brighter.",
      "Average build quality on the {productName}. The crown feels wobbly and the strap is a bit stiff. Works fine but not quite premium.",
    ],
    2: [
      "Disappointed with the {productName}. The glass developed a hairline crack within a month of careful use. Expected far better build quality.",
      "The {productName} stopped working after 6 weeks. The battery died early and replacing it was a hassle. Not worth the price.",
    ],
    1: [
      "The {productName} I received is clearly not what was shown in the listing. Colour and dial design are completely different. Very misleading.",
    ],
  },

  slippers: {
    5: [
      "Absolutely love these {productName}! Super comfortable from day one — no breaking-in period needed. Wearing them all day around the house.",
      "The {productName} are incredible value. Soft, sturdy sole, and the fit is perfect. My whole family has now ordered a pair each!",
      "Best slippers I have owned. The {productName} are comfortable, stylish, and have not worn down even after months of daily use. 5 stars!",
      "Bought these {productName} as a gift for my mother and she absolutely loves them. Says they are the most comfortable slippers she has ever had.",
      "Second pair of the {productName} and quality is just as good as the first. Fast delivery, great packaging. Will keep reordering!",
    ],
    4: [
      "Really comfortable {productName}. Sole is solid and they look great. The size runs slightly large so I would recommend going a half size down.",
      "Happy with the {productName}. Good quality stitching and comfortable padding. Colour is slightly different from the photo but still nice.",
      "Good daily slippers. The {productName} are comfortable and well-made. Strap loosened slightly after a month but still functional.",
    ],
    3: [
      "The {productName} are comfortable but the sole is thinner than I expected. Fine for indoor use but I would not wear them outdoors.",
      "Decent slippers overall. The {productName} look good but the cushioning flattened out after about 3 weeks of regular use.",
    ],
    2: [
      "The {productName} started peeling at the toe area after just 2 weeks. Not the durability I was hoping for at this price.",
    ],
    1: [
      "Wrong size delivered. The {productName} I received were 2 sizes smaller than ordered. Still sorting out the return.",
    ],
  },

  bedsheets: {
    5: [
      "The {productName} are absolutely gorgeous! Soft fabric, vibrant colours that did not fade after washing, and the fit on our king bed is perfect.",
      "Ordered the {productName} and I am blown away. The cotton feels high-thread-count quality at a very reasonable price. Sleeping so much better!",
      "Beautiful bedsheets! The {productName} look even better in real life than in the photos. Family loved the design. Ordering another set soon.",
      "Bought the {productName} as a house-warming gift. Everyone in the house compliments them daily. Excellent quality and packaging.",
      "Second order of the {productName}. Quality is consistent — soft, fade-resistant, and the stitching on the edges is still holding perfectly.",
      "Compared many brands before choosing the {productName}. Best decision — premium feel and very durable. Highly recommend for gifting!",
    ],
    4: [
      "Really happy with the {productName}. Fabric is soft and the design is elegant. Shrunk very slightly after the first wash but otherwise perfect.",
      "Good quality bedsheets. The {productName} look luxurious and are comfortable. Colour was slightly lighter than expected but still beautiful.",
      "The {productName} are nice and soft. Good stitch quality along the borders. One colour variant was out of stock so I had to pick second choice.",
    ],
    3: [
      "The {productName} are decent but the fabric feels slightly thin. Comfortable enough in summer but I would want something thicker for winter.",
      "Okay product. The {productName} look nice but one corner of the fitted sheet does not stay tucked properly on our deep mattress.",
    ],
    2: [
      "The {productName} started pilling after just 2 washes. The colour also faded significantly. Expected much better quality.",
    ],
    1: [
      "The {productName} arrived with a visible tear along one seam. Very poor packaging and quality control. Returning the order.",
    ],
  },

  shoes: {
    5: [
      "The {productName} are fantastic — comfortable from the very first wear, great grip, and they look sharp with both casual and formal outfits.",
      "Absolutely thrilled with my {productName}. The leather is supple and the sole is solid. Getting tons of compliments. Highly recommended!",
      "Best shoes I have bought online. The {productName} fit true to size, look premium, and feel very comfortable after a full day on my feet.",
      "Gifted the {productName} to my brother and he was delighted. Excellent finishing and packaging. Will definitely shop here again.",
    ],
    4: [
      "Really nice shoes. The {productName} look great and the build quality is solid. Took a couple of days to fully break in but now very comfortable.",
      "Happy with the {productName}. Good quality leather and clean stitching. Insole could be slightly more cushioned but overall a great buy.",
      "Good value shoes. The {productName} look exactly like the photos and have held up well over two months of regular use.",
    ],
    3: [
      "The {productName} look good but the sole felt a bit slippery on smooth floors initially. Got better after a week of use. Decent overall.",
      "Average experience with the {productName}. Design is attractive but the lining inside rubbed a blister on my heel for the first week.",
    ],
    2: [
      "The {productName} stitching separated on the side after just 3 weeks of use. Disappointing quality for the price paid.",
    ],
    1: [
      "Both shoes in the {productName} pair were the same foot — both rights. Complete quality control failure. Still waiting for a replacement.",
    ],
  },

  clothing: {
    5: [
      "The {productName} fabric is exceptional — soft, breathable, and the colour is vibrant. Stitching is very clean. Would definitely order again!",
      "Absolutely love the {productName}! Fits perfectly, the fabric is comfortable even in the heat, and the design is exactly as shown.",
      "Gifted the {productName} to my mother for Eid and she was overjoyed. The embroidery quality is beautiful and the fabric is luxurious.",
      "The {productName} is now my go-to outfit. Comfortable, stylish, and washes well without losing shape or colour. Top quality!",
    ],
    4: [
      "Good quality fabric on the {productName}. The fit is true to size and the stitching is clean. Colour is slightly less vibrant than the photos but still lovely.",
      "Happy with the {productName}. Material is comfortable and the design is elegant. Delivery was prompt and packaging was neat.",
    ],
    3: [
      "The {productName} is decent. Fabric feels a bit synthetic compared to the description but the design is attractive and it fits well.",
      "Okay purchase. The {productName} looks nice but the embroidery lost a couple of threads after the first wash. Still wearable.",
    ],
    2: [
      "The {productName} fabric is much thinner than expected and the colour faded significantly after just one wash. Not worth the price.",
    ],
    1: [
      "The {productName} sizing is completely off — a large fits like a small. No quality control at all. Very disappointed.",
    ],
  },

  general: {
    5: [
      "Great product! The {productName} is exactly as described and the quality is impressive. Delivery was fast and packaging was secure. Highly recommended!",
      "Absolutely satisfied with my {productName}. Worth every rupee and then some. PakCart never disappoints!",
      "Tried several alternatives before this. The {productName} is by far the best in this range. Will be a repeat customer for sure.",
      "Bought this as a gift for my mother and she loved it! The {productName} arrived well-packaged and looks premium. 5 stars!",
      "Second time ordering this. Quality of the {productName} is consistent and delivery keeps getting faster. Highly recommend.",
      "The {productName} exceeded my expectations completely. Solid build, great finish, and very good value for money.",
      "Very happy with the {productName}. Does exactly what it promises and looks great too. Will definitely order again from PakCart!",
    ],
    4: [
      "Good purchase overall. The {productName} works well and quality is solid. Minor packaging issue but the product itself is excellent.",
      "The {productName} is very good for daily use. Packaging could be slightly better but the product itself is solid. Would buy again.",
      "Happy with the {productName}. Does what it says, looks good, and arrived on time. Small improvement in packing would make it 5 stars.",
      "Solid value. The {productName} is well-made and functional. One minor gripe about the colour being slightly off from the listing but overall satisfied.",
    ],
    3: [
      "Decent product. The {productName} works fine for everyday use but I feel the quality could be better at this price point.",
      "The {productName} is okay — not great, not bad. It does the job. Delivery was a day late but customer support was helpful.",
      "Mixed experience with the {productName}. The product itself is fine but the packaging was damaged on arrival. Quality of the item is acceptable.",
    ],
    2: [
      "Expected better quality for the price of the {productName}. It works but does not feel as premium as the listing suggested. A bit misleading.",
      "The {productName} did not match the product description. Material feels cheap and it looks different from the photos. Disappointed.",
    ],
    1: [
      "The {productName} stopped working within a week. Very poor quality. Contacted support with no resolution so far.",
      "Product description of the {productName} is completely inaccurate. Sent back immediately. Would not recommend this seller.",
    ],
  },
};

// ---------------------------------------------------------------------------
// Content Generator
// ---------------------------------------------------------------------------

/**
 * Picks a review template matching the given category and rating,
 * then substitutes {productName} with the actual product name.
 */
export function generateReviewContent(
  productName: string,
  category: ProductCategory,
  rating: RatingTier
): string {
  const catPool = TEMPLATES[category] ?? TEMPLATES["general"];
  const ratingPool =
    catPool[rating] ??
    TEMPLATES["general"][rating] ??
    TEMPLATES["general"][5]!;

  const template = ratingPool[Math.floor(Math.random() * ratingPool.length)];
  return template.replace(/\{productName\}/g, productName);
}
