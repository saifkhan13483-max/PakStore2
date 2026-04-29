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
 * Picks a star rating using the target positive distribution:
 * 5★ 60% | 4★ 25% | 3★ 15%
 */
export function getRealisticRating(): number {
  const roll = Math.random() * 100;
  if (roll < 60) return 5;
  if (roll < 85) return 4;
  return 3;
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

/** Picks an hour (0-23) weighted toward 9-23 PKT. */
function weightedHour(): number {
  const activeHours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  return activeHours[Math.floor(Math.random() * activeHours.length)];
}

/**
 * Generates `count` timestamps with a realistic burst-clustering pattern.
 *
 * Picks 1–2 random "burst dates" (mimicking post-sale review spikes), clusters
 * 40–60% of timestamps within ±3 days of those bursts, and spreads the rest
 * randomly across the full 90-day window. Results are sorted chronologically.
 */
export function generateClusteredTimestamps(count: number, maxDays = 90): Date[] {
  const now = Date.now();
  const numBursts = Math.random() < 0.5 ? 1 : 2;
  const burstMs: number[] = [];
  const safeMax = Math.max(6, maxDays); // ensure room for ±3 day buffer

  for (let b = 0; b < numBursts; b++) {
    const daysAgo = Math.floor(Math.random() * (safeMax - 5)) + 4; // 4–(maxDays-1) days ago
    burstMs.push(now - daysAgo * 86_400_000);
  }

  const clusterCount = Math.round(count * (0.4 + Math.random() * 0.2)); // 40–60%
  const timestamps: Date[] = [];

  for (let i = 0; i < count; i++) {
    let ms: number;
    if (i < clusterCount) {
      const burst = burstMs[Math.floor(Math.random() * burstMs.length)];
      const offsetMs = (Math.random() * 6 - 3) * 86_400_000; // ±3 days
      ms = burst + offsetMs;
    } else {
      const daysAgo = Math.floor(Math.random() * safeMax) + 1;
      ms = now - daysAgo * 86_400_000;
    }
    // Clamp: never in the future, never older than maxDays
    ms = Math.max(now - safeMax * 86_400_000, Math.min(now - 60_000, ms));

    const d = new Date(ms);
    const pktHour = weightedHour();
    d.setUTCHours(((pktHour - 5) + 24) % 24, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60), 0);
    timestamps.push(d);
  }

  return timestamps.sort((a, b) => a.getTime() - b.getTime());
}

// ---------------------------------------------------------------------------
// Review Templates  (50+ across categories and rating tiers)
// ---------------------------------------------------------------------------

type RatingTier = 5 | 4 | 3 | 2 | 1;
export type ReviewLanguage = "en" | "ur";

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
      "Really like the design — it looks great and the material feels solid. The zipper could be a touch smoother but overall a good purchase for the price.",
      "Lovely looking bag and it gets compliments too. The interior pockets are slightly smaller than I expected but it holds all my daily essentials just fine.",
      "Good bag for everyday use. The colour is exactly as shown and it has a nice shape. Shoulder strap could be a little longer but still comfortable to carry.",
      "Nice bag overall — stylish and functional. Packaging was secure and delivery was on time. A small improvement in hardware finish would easily make it five stars.",
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
      "Nice looking watch and it keeps accurate time. The strap is a little stiff initially but softens up with wear. Good value for casual daily use.",
      "Pretty watch — the dial looks smart and clean. Crown is a bit tight but setting the time is still easy. Happy with the overall look and feel.",
      "Good watch for the price — looks more premium in person than in the photos. The finishing on the case is nice. Just keep it away from heavy activity and it will last well.",
      "Solid timepiece for everyday use. Design is eye-catching and the fit on the wrist is comfortable. A slightly more polished buckle would make it perfect.",
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
      "Very comfortable slippers for indoor use — soft base and nice design. The colour was slightly different from what I ordered but still looks good.",
      "Good slippers for home use. Cushioning is decent and they fit true to size. A touch more arch support would be ideal but for the price they are absolutely fine.",
      "Comfy enough for daily indoor wear. Good stitching and the sole holds up well. Happy with the purchase overall — good value for what you pay.",
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
      "Pretty bedsheets — the design is lovely and the fabric feels comfortable. Light material which is great for summer. Would prefer slightly heavier for winter but overall satisfied.",
      "Nice bedsheets and the colour is vibrant and exactly as shown. Fits our bed well. The fitted sheet corners are a touch loose on a deep mattress but manageable.",
      "Good quality for the price. The embroidery detail is attractive and the fabric washes well. A small loose thread on one pillowcase but easily fixed — still happy with the purchase.",
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
      "Good looking shoes that match the photos well. Took a few days to fully break in but now comfortable and supportive. Sole grip is solid.",
      "Nice shoes for the price — leather looks good and the finishing is clean. Added a gel insole for extra cushioning and now very comfortable.",
      "Decent shoes overall. The design is sharp and they look great with formal outfits. The toe box was a touch snug initially but eased out within a week.",
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
      "Good quality fabric and a lovely design. The fit is comfortable and the colour is as shown. Sizing runs a little small so I would suggest going one size up.",
      "Nice clothing item overall — the style is attractive and the stitching is clean. The dupatta is slightly less embroidered than in the photo but the overall look is still very presentable.",
      "Comfortable fabric and a beautiful design. Washes well without losing shape. A small embroidery detail came slightly loose after the first wash but easily fixed and still a great outfit.",
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
      "Good product overall and it works well for daily use. Packaging was simple but secure. Very satisfied with the quality for the price paid.",
      "Decent product that does exactly what it promises. Delivery was on time and the item matches the photos. A small quality improvement would make it a 5-star purchase.",
      "Happy with this purchase overall. Product is functional and looks good in person. Customer service was also very responsive when I had a question.",
      "Good value for money. The product is well-made and practical for everyday use. Arrived on time and well-packed. Would recommend to friends.",
    ],
  },
};

// ---------------------------------------------------------------------------
// Roman Urdu Review Templates  (mirrors English pools per category × rating)
// ---------------------------------------------------------------------------

const TEMPLATES_UR: TemplatePool = {
  bags: {
    5: [
      "Mashallah bag bohat khoobsurat hai. Quality top class, stitching ekdum perfect aur colour bilkul tasveer jaisa. Roz compliments mil rahe hain!",
      "Iss bag pe paisa lagana faida hai. Material strong, sab samaan aaram se aa jata hai aur dekhne mein bhi premium lagta hai. Paisa wasool!",
      "Behan ke liye gift kiya tha, bohat pasand aaya. Packaging bhi achi thi. PakCart se phir order karunga inshaAllah.",
      "Wife ke liye Eid pe liya tha. Bohat khush hui woh dekh ke. Zip, inside pockets aur finishing sab kuch top notch hai.",
      "2nd time order kiya hai PakCart se. Quality bilkul same achi hai aur delivery expected se bhi fast thi. 5 stars bila shak.",
      "Bohat options compare ki, lekin yeh bag iss range mein sab se behtar nikla. Premium feel hai aur price reasonable.",
      "Roz use karne wala bag chahiye tha, yeh perfect mila. Strap shoulder pe comfortable, andar 3 compartments hain. Mashallah.",
    ],
    4: [
      "Bag overall acha hai, material strong aur design simple. Strap thori si choti hai meri height ke hisab se warna sab sahi.",
      "Quality theek thaak hai, photo jaisa hi mila. 3 din mein deliver hua jo acceptable hai. Phir order karunga.",
      "Bag pasand aaya, sirf dust bag missing tha isliye 4 star. Baqi sab perfect, recommended.",
      "Daily use ke liye perfect hai. Na bohat bara na chota. Iss price mein achi value mili.",
      "Solid purchase hai. Stitching saaf, hardware bhi solid lagta hai. Color thora gehra hai photo se but achi lagti hai.",
    ],
    3: [
      "Design bohat acha hai, material bhi theek hai. Zipper shuru mein thora tight tha lekin use karne se sahi ho gaya. Iss price ke liye good purchase.",
      "Bag dekhne mein acha lagta hai, sab tareef karte hain. Inside pockets thore chote hain magar daily ka samaan aaram se aa jata hai.",
      "Color bilkul jaisa dikha tha waisa hi mila. Strap thori si lambi honi chahiye thi but comfortable hai carry karne mein.",
      "Stylish aur functional bag hai. Packaging secure thi aur on time aaya. Hardware finishing thori behtar hoti to easily 5 stars.",
    ],
  },

  watches: {
    5: [
      "Mashallah ghari bohat khoobsurat hai. Dial clear, strap premium aur time bilkul sahi rakhti hai. Sab puchte hain kahan se li!",
      "Eid pe husband ke liye gift kiya tha. Itni khush hui woh dekh ke. Iss price mein excellent quality. Highly recommended!",
      "Ghari live mein bohat mehngi lagti hai. Build quality solid aur finishing ekdum top class. PakCart se kabhi disappointment nahi hoti.",
      "Wrist pe comfortable, time accurate aur design ekdum stylish. Brilliant value for money bhai.",
      "Yeh meri 3rd ghari hai PakCart se aur sab se behtar yehi nikli. Packaging secure thi, delivery on time. 5 stars!",
      "Bohat brands try ki, lekin yeh ghari sab se reliable nikli iss range mein. Watch lovers ke liye must buy.",
    ],
    4: [
      "Design bohat clean hai aur strap comfortable. Crown thora hard hai but baqi sab acha. Overall achi purchase.",
      "Photo jaisi exact mili. Solid lagti hai wrist pe. Mahine mein 1 minute lose karti hai but iss price pe acceptable.",
      "Acha timepiece hai casual use ke liye. Strap buckle thora rough hai magar baqi sab OK. Satisfied hun.",
      "Sahi value ki ghari, dial easy to read aur packaging secure thi. Phir order karunga.",
    ],
    3: [
      "Acha look hai aur time accurate rakhti hai. Strap shuru mein stiff thi lekin baad mein soft ho jati hai. Casual daily use ke liye sahi.",
      "Khoobsurat ghari, dial smart aur clean. Crown thora tight magar time set karna easy hai. Look pasand aaya.",
      "Iss price mein achi hai, photos se zyada premium lagti hai live mein. Heavy activity mein use mat karein, lambi chalegi.",
      "Daily wear ke liye solid timepiece. Design eye-catching aur fit comfortable. Buckle thori polished hoti to perfect.",
    ],
  },

  slippers: {
    5: [
      "Inn slippers ka koi jawab nahi! Pehle din se hi bohat comfortable, breaking-in ki need nahi padi. Saara din ghar mein pehen ke ghoomta hun.",
      "Iss price mein itni achi quality milna mushkil hai. Sole strong, fit perfect. Ghar wale sab ne ek ek pair order kiya hai!",
      "Best slippers hain jo kabhi li hain. Comfortable, stylish aur mahino baad bhi naye jaise. 5 stars pakka!",
      "Ammi ke liye gift ki thi, bohat khush hui. Kehti hain itni comfortable slippers kabhi nahi pehni. MashaAllah.",
      "Inka 2nd pair order kiya, pehle wala jaisa hi acha. Delivery fast aur packaging solid. Phir mangwaunga inshaAllah.",
    ],
    4: [
      "Bohat comfortable slippers hain. Sole solid hai aur dekhne mein achi lagti hain. Size thora bara hai, half size niche karein.",
      "Quality achi hai, stitching neat aur padding comfortable. Color photo se thora alag hai magar achi lagti hain.",
      "Daily ghar mein pehnne ke liye perfect hain. Acha bana hua hai. Strap mahine baad thora dheela hua but kaam chal raha hai.",
    ],
    3: [
      "Indoor use ke liye bohat comfortable. Soft base aur design acha. Color order kiye se thora alag tha but achi lagti hain.",
      "Ghar ke use ke liye sahi slippers. Cushioning theek hai, fit true to size. Thora arch support aur hota to ideal magar iss price mein OK.",
      "Daily indoor wear ke liye comfy. Stitching achi aur sole strong. Overall purchase se khush hun, paisa wasool.",
    ],
  },

  bedsheets: {
    5: [
      "Mashallah bedsheet bohat khoobsurat hai! Fabric soft, color vibrant aur dhone ke baad bhi fade nahi hua. King bed pe perfect fit.",
      "Order karne ka faisla bilkul sahi tha. Cotton ka feel premium hai itni reasonable price pe. Neend bhi achi aati hai!",
      "Khoobsurat bedsheets, photo se bhi behtar live mein. Ghar wale sab tareef karte hain. Aik aur set order karne wala hun.",
      "Naye ghar ke liye house warming gift ke tor pe liya. Sab ko bohat pasand aaya. Quality aur packaging excellent.",
      "2nd order hai inka. Quality consistent hai - soft, fade-resistant aur edges ki stitching ab tak strong.",
      "Bohat brands compare karne ke baad yeh choose ki. Best decision - premium feel aur durable. Gifting ke liye must buy!",
    ],
    4: [
      "Bohat khush hun is purchase se. Fabric soft aur design elegant. Pehli wash pe thora shrink hua but baqi sab perfect.",
      "Achi quality bedsheets. Luxurious dikhti hain aur comfortable hain. Color thora light tha expect se but phir bhi khoobsurat.",
      "Soft hain aur fabric acha hai. Border ki stitching solid hai. Aik color out of stock tha to 2nd choice leni padi.",
    ],
    3: [
      "Khoobsurat bedsheets, design lovely aur fabric comfortable. Light material hai, summer ke liye perfect. Winter ke liye thori heavy hoti to behtar.",
      "Achi bedsheets, color vibrant aur photo jaisa exact. Bed pe sahi fit. Fitted sheet ka corner thora loose hai deep mattress pe but manageable.",
      "Iss price ke liye achi quality. Embroidery detail attractive aur fabric wash bhi sahi hota hai. Aik pillowcase pe loose thread tha but easily fix ho gaya.",
    ],
  },

  shoes: {
    5: [
      "Shoes lajawab hain - pehle din se hi comfortable, grip strong aur formal/casual dono ke saath sharp lagte hain.",
      "Bohat khush hun shoes se. Leather soft aur sole solid. Sab tareef karte hain. Highly recommended!",
      "Online se liye sab se behtar shoes. Size fit, premium look aur saara din pehnne ke baad bhi comfortable.",
      "Bhai ke liye gift kiye, bohat khush hua. Excellent finishing aur packaging. Phir zaroor order karunga.",
    ],
    4: [
      "Achi shoes hain. Look acha aur build quality solid. 2-3 din lagey break-in mein, ab bohat comfortable hain.",
      "Khush hun shoes se. Leather quality achi aur stitching clean. Insole thori aur cushioned hoti to perfect, baqi great buy.",
      "Acha value shoes. Photos jaisa exact aur 2 mahine se regular use ho rahe, ab bhi naye jaise.",
    ],
    3: [
      "Acha look hai photo jaisa. Break-in mein 2-3 din lagey, ab comfortable aur supportive hain. Sole grip solid.",
      "Iss price mein achi shoes - leather acha aur finishing clean. Gel insole add ki extra cushioning ke liye, ab bohat comfortable.",
      "Decent shoes hain overall. Design sharp, formal ke saath bohat ache lagte. Toe box thora tight tha shuru mein but hafte mein ease ho gaya.",
    ],
  },

  clothing: {
    5: [
      "Mashallah fabric exceptional hai - soft, breathable aur color vibrant. Stitching bohat clean. Phir order karunga zaroor!",
      "Bohat pasand aaya! Fit perfect, fabric garmi mein bhi comfortable aur design exact photo jaisa.",
      "Ammi ke liye Eid pe gift kiya, bohat khush hui. Embroidery beautiful aur fabric luxurious.",
      "Yeh meri go-to outfit ban gaya hai. Comfortable, stylish aur wash karne ke baad bhi shape colour same.",
    ],
    4: [
      "Fabric quality achi hai. Fit true to size aur stitching clean. Color photos se thora kam vibrant hai magar phir bhi lovely.",
      "Khush hun is purchase se. Material comfortable aur design elegant. Delivery fast aur packaging neat thi.",
    ],
    3: [
      "Achi quality fabric aur lovely design. Fit comfortable aur color jaisa dikhaya gaya. Sizing thori chhoti hai, ek size up lein.",
      "Acha clothing item overall - style attractive aur stitching clean. Dupatta thori kam embroidered hai photo se but overall look presentable hai.",
      "Comfortable fabric aur khoobsurat design. Wash karne pe shape sahi rehti hai. Pehli wash pe ek embroidery loose hui but easily fix ho gayi.",
    ],
  },

  general: {
    5: [
      "Excellent product! Bilkul jaisa describe kiya hai waisa hi hai aur quality impressive. Delivery fast aur packaging secure. Highly recommended!",
      "Apni purchase se ekdum satisfied hun. Har rupay ka mol pura hua. PakCart kabhi disappoint nahi karta!",
      "Bohat alternatives try ki, but yeh sab se behtar nikla iss range mein. Repeat customer banunga pakka.",
      "Ammi ke liye gift liya, bohat pasand aaya. Achi packaging mein aaya aur premium lagta hai. 5 stars!",
      "2nd time order kiya yeh. Quality consistent aur delivery aur fast hoti ja rahi hai. Highly recommend.",
      "Mere expectations se zyada nikla. Solid build, finish acha aur paisa wasool deal.",
      "Bohat khush hun is product se. Wahi karta hai jo promise kiya aur dikhta bhi acha hai. Phir zaroor order karunga PakCart se!",
    ],
    4: [
      "Overall achi purchase. Product sahi kaam karta hai aur quality solid. Packaging mein chhoti issue thi but product khud excellent.",
      "Daily use ke liye bohat acha. Packaging thori behtar ho sakti thi but product solid hai. Repeat order karunga.",
      "Khush hun product se. Jaisa kaha tha waisa hai, look acha aur on time aaya. Packing mein chhoti improvement aur 5 stars.",
      "Solid value. Product accha bana hua aur functional. Color thora off tha listing se but baqi sab satisfied.",
    ],
    3: [
      "Acha product overall, daily use ke liye sahi kaam karta hai. Packaging simple but secure. Iss price ke liye quality se khush hun.",
      "Decent product, jo promise kiya wahi karta hai. Delivery on time aur photos jaisa exact. Thori quality improvement aur 5 star ho jata.",
      "Is purchase se khush hun. Product functional aur live mein acha lagta hai. Customer service bhi responsive thi sawal ka jawab dene mein.",
      "Sahi value for money. Product accha bana hua aur daily use ke liye practical. On time aur achi packing mein aaya. Doston ko recommend karunga.",
    ],
  },
};

// ---------------------------------------------------------------------------
// Content Generator
// ---------------------------------------------------------------------------

/**
 * Replaces {productName} placeholders with natural generic references.
 * Handles plural (slippers/shoes/bedsheets), possessive, and sentence-start
 * patterns so the resulting text reads naturally without the product name.
 */
function replaceWithGeneric(template: string): string {
  return template
    .replace(/these \{productName\}/g, "them")
    .replace(/The \{productName\} are/g, "They are")
    .replace(/the \{productName\} are/g, "they are")
    .replace(/The \{productName\} is/g, "It is")
    .replace(/the \{productName\} is/g, "it is")
    .replace(/my \{productName\}/g, "it")
    .replace(/The \{productName\}/g, "It")
    .replace(/the \{productName\}/g, "it")
    .replace(/This \{productName\}/g, "It")
    .replace(/this \{productName\}/g, "it")
    .replace(/^\{productName\}/, "This product")
    .replace(/\{productName\}/g, "this product");
}

/**
 * Picks a review template matching the given category and rating,
 * then substitutes {productName}. Only ~10% of reviews include the
 * full product name; the rest use natural generic references.
 *
 * @param lang - "en" for English (default) or "ur" for Roman Urdu
 */
export function generateReviewContent(
  productName: string,
  category: ProductCategory,
  rating: RatingTier,
  lang: ReviewLanguage = "en"
): string {
  const pool = lang === "ur" ? TEMPLATES_UR : TEMPLATES;
  const catPool = pool[category] ?? pool["general"];
  const ratingPool =
    catPool[rating] ??
    pool["general"][rating] ??
    pool["general"][5]!;

  const template = ratingPool[Math.floor(Math.random() * ratingPool.length)];

  // Roman Urdu templates rarely include {productName} — they reference items
  // implicitly ("yeh bag", "ghari"), which feels more natural in Urdu speech.
  // For both languages, ~10% of templates that DO have the placeholder show
  // the actual product name; the rest swap to generic references (English only).
  if (Math.random() < 0.10 && template.includes("{productName}")) {
    return template.replace(/\{productName\}/g, productName);
  }

  if (lang === "ur") {
    // Most Urdu templates don't carry the placeholder; if any do, drop it.
    return template
      .replace(/\s+\{productName\}/g, "")
      .replace(/\{productName\}\s+/g, "")
      .replace(/\{productName\}/g, "");
  }

  return replaceWithGeneric(template);
}
