/**
 * CLI seed script — run with:  npx tsx scripts/seed-comments.ts
 *
 * Uses the same data engine as the frontend admin button so results are
 * identical regardless of which entry point triggers the seeding.
 *
 * Phase 4: Integrates the full intelligence pipeline:
 * - DuplicateDetector (per-run, cross-product deduplication)
 * - applyNaturalness (typos, Pakistani English, emphasis caps)
 * - getProductContextHint (price/variant-aware sentences)
 * - getSeasonalNote (Eid, summer, winter, gifting-season awareness)
 * - Graceful coexistence with real comments (cap at 3, nudge ratings)
 * - Gender-aware avatar diversity (multi-style DiceBear, 15% no-avatar)
 */

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";

import {
  getGenderMatchedName,
  getDiceBearUrl,
  type GenderTarget,
} from "../client/src/lib/seed-data/name-pool";
import {
  detectCategory,
  getRealisticRating,
  getCommentCount,
  generateReviewContent,
  generateClusteredTimestamps,
  type ProductCategory,
  type ReviewLanguage,
} from "../client/src/lib/seed-data/review-templates";
import {
  generateHelpfulCount,
  generateIsVerifiedPurchase,
  generateSellerReply,
} from "../client/src/lib/seed-data/engagement-simulator";
import { applyNaturalness } from "../client/src/lib/seed-data/naturalness-engine";
import {
  getProductContextHint,
  extractVariants,
  type ProductContext,
} from "../client/src/lib/seed-data/product-context-reader";
import { getSeasonalNote } from "../client/src/lib/seed-data/seasonal-context";
import { DuplicateDetector } from "../client/src/lib/seed-data/duplicate-detector";

const firebaseConfig = {
  apiKey: "AIzaSyCy6W_iVKhOuawX5kLtq_arxsVfnxbfg94",
  authDomain: "pakstore-45ec7.firebaseapp.com",
  projectId: "pakstore-45ec7",
  storageBucket: "pakstore-45ec7.firebasestorage.app",
  messagingSenderId: "427945652323",
  appId: "1:427945652323:web:14ba66302d404561d7c856",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ---------------------------------------------------------------------------
// Phase 4: nudge rating toward real average (graceful coexistence)
// ---------------------------------------------------------------------------

function nudgeRating(raw: number, _realAvg: number): number {
  // Keep all seeded ratings positive — no downward nudging
  return raw;
}

// ---------------------------------------------------------------------------
// Gender targeting — infers the audience for a product so reviewer names
// match the buyer demographic. Strong cues take priority; falls back to
// "unisex" for genuinely neutral items (tech gadgets, household, etc.).
// ---------------------------------------------------------------------------
function inferGenderTarget(p: {
  name: string;
  description?: string;
  category?: string;
}): GenderTarget {
  const txt = `${p.name ?? ""} ${p.description ?? ""} ${p.category ?? ""}`.toLowerCase();

  // Female cues: clothing, jewelry, women's bags, etc.
  if (
    /\b(women|woman|girls?|ladies|female|her|wife|mother|ammi|behen|sister|bridal|abaya|hijab|maxi|kameez|kurta|kurti|lawn|chiffon|organza|dupatta|frock|stitched|3.?piece|jewelry|jewellery|earring|necklace|cuff|ring set|bangle|bracelet|purse|handbag|clutch|tote|crossbody|hand bag|sling)\b/.test(
      txt
    )
  )
    return "female";

  // Male cues: men's accessories, formal wear, wallets
  if (
    /\b(men|man|boys?|male|him|husband|father|brother|gents|gent's|sherwani|wallet|formal shoe|loafer|moccasin|men's watch|mens watch|men watch|beard|trimmer)\b/.test(
      txt
    )
  )
    return "male";

  // Watches: ladies/girls cue → female, otherwise male (PK market default)
  if (/watch/.test(txt)) {
    if (/(ladies|women|girls)/.test(txt)) return "female";
    return "male";
  }

  return "unisex";
}

// ---------------------------------------------------------------------------
// Phase 4: full review content pipeline
// ---------------------------------------------------------------------------

function buildReviewContent(
  productName: string,
  category: ProductCategory,
  rating: 1 | 2 | 3 | 4 | 5,
  productCtx: ProductContext,
  commentDate: Date,
  lang: ReviewLanguage
): string {
  let content = generateReviewContent(productName, category, rating, lang);
  content = applyNaturalness(content, lang);

  const contextHint = getProductContextHint(productCtx, rating, lang);
  if (contextHint) content = content.trimEnd() + " " + contextHint;

  const seasonalNote = getSeasonalNote(commentDate, category, lang);
  if (seasonalNote) content = content.trimEnd() + " " + seasonalNote;

  return content;
}

/** 70% Roman Urdu, 30% English — matches Pakistani market style. */
function pickReviewLanguage(): ReviewLanguage {
  return Math.random() < 0.70 ? "ur" : "en";
}

// ---------------------------------------------------------------------------
// Main seeding routine
// ---------------------------------------------------------------------------

async function seedRandomComments(startOffset = 0, batchSize = 15): Promise<void> {
  const SEED_EMAIL = "seedbot.pakstore@temp-seed.com";
  const SEED_PASSWORD = "SeedBot#2026!";

  console.log("Authenticating seed bot account...");
  try {
    await signInWithEmailAndPassword(auth, SEED_EMAIL, SEED_PASSWORD);
    console.log("Signed in to existing seed account.");
  } catch {
    await createUserWithEmailAndPassword(auth, SEED_EMAIL, SEED_PASSWORD);
    console.log("Created and signed in to new seed account.");
  }

  console.log(`Starting to seed realistic comments (batch offset=${startOffset}, size=${batchSize})...`);

  const productsSnapshot = await getDocs(collection(db, "products"));
  console.log(`Found ${productsSnapshot.size} products total.`);

  const allDocs = productsSnapshot.docs.slice(startOffset, startOffset + batchSize);
  console.log(`Processing ${allDocs.length} products (${startOffset + 1}–${startOffset + allDocs.length})...`);

  // Phase 4: one shared detector across the entire run
  const detector = new DuplicateDetector(3);

  for (const productDoc of allDocs) {
    const productId = productDoc.id;
    const data = productDoc.data();
    const productName: string = data.name ?? "this product";
    const product = {
      name: productName,
      category: data.category ?? data.categoryName ?? "",
      price: data.price ?? data.discountedPrice ?? 0,
      description: data.description ?? "",
    };

    // --- Remove old seeded comments ---
    const oldQuery = query(
      collection(db, "comments"),
      where("productId", "==", productId),
      where("userId", "==", "system-seed")
    );
    const oldSnapshot = await getDocs(oldQuery);
    for (const oldDoc of oldSnapshot.docs) {
      try {
        await deleteDoc(doc(db, "comments", oldDoc.id));
      } catch (e: any) {
        console.error(`  Failed to delete old comment: ${e.message}`);
      }
    }

    // Phase 4: fetch real comments for graceful coexistence
    const allCommentsSnap = await getDocs(
      query(collection(db, "comments"), where("productId", "==", productId))
    );
    const realComments = allCommentsSnap.docs
      .map((d) => d.data())
      .filter((c) => c.userId !== "system-seed");

    // Pre-load real reviewer names/content into the detector
    detector.loadExisting(
      productId,
      realComments.map((c) => ({
        userName: String(c.userName ?? ""),
        content: String(c.content ?? ""),
      }))
    );

    // Always honor the per-product 8–20 target, regardless of whether
    // the product already has real comments.
    const numComments = getCommentCount(product);

    // Phase 4: compute real average for rating nudging
    const realAvg =
      realComments.length > 0
        ? realComments.reduce((acc, c) => acc + (Number(c.rating) || 0), 0) /
          realComments.length
        : -1;

    const category = detectCategory(product);
    // 6-month spread (~180 days) with recency bias built into the clusterer
    const timestamps = generateClusteredTimestamps(numComments, 180);

    // Infer gender targeting so we use the right name pool for this product
    const genderTarget = inferGenderTarget(product);

    // Phase 4: full product context for context hints
    const productCtx: ProductContext = {
      name: productName,
      price: data.price ?? data.discountedPrice,
      discountPrice: data.discountedPrice ?? data.discountPrice,
      variants: extractVariants(data.variants ?? data.colors ?? data.sizes),
      description: data.description,
      category: product.category,
    };

    console.log(
      `Adding ${numComments} comments to "${productName}" (${category})${
        realComments.length > 0 ? ` [${realComments.length} real comments exist]` : ""
      }...`
    );

    // Track names already used on THIS product (for gender-pool helper)
    const usedOnProduct = new Set<string>();

    for (let i = 0; i < numComments; i++) {
      // Gender-aware name picking with retry (avoids reuse + overuse globally)
      let selectedName = getGenderMatchedName(genderTarget, usedOnProduct);
      for (let attempt = 0; attempt < 20; attempt++) {
        const candidate = getGenderMatchedName(genderTarget, usedOnProduct);
        if (
          !detector.isNameUsedOnProduct(productId, candidate.name) &&
          !detector.isNameOverused(candidate.name)
        ) {
          selectedName = candidate;
          break;
        }
      }
      usedOnProduct.add(selectedName.name);

      const rawRating = getRealisticRating();
      const rating = realAvg >= 0 ? nudgeRating(rawRating, realAvg) : rawRating;
      const commentDate = timestamps[i];
      const lang = pickReviewLanguage();

      // Phase 4: full content pipeline with dedup retry
      let content = buildReviewContent(
        productName,
        category,
        rating as 1 | 2 | 3 | 4 | 5,
        productCtx,
        commentDate,
        lang
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
          commentDate,
          lang
        );
        dedupAttempts++;
      }
      detector.register(productId, selectedName.name, content);

      const firestoreTs = Timestamp.fromDate(commentDate);
      const helpfulCount = generateHelpfulCount(content);
      const isVerifiedPurchase = generateIsVerifiedPurchase();
      const replyData = generateSellerReply(rating, commentDate);

      // Phase 4: gender-aware avatar URL
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
    }

    // --- Recalculate product averageRating & reviewCount ---
    const updatedCommentsSnap = await getDocs(
      query(collection(db, "comments"), where("productId", "==", productId))
    );
    const allComments = updatedCommentsSnap.docs.map((d) => d.data());
    const total = allComments.reduce((acc, c) => acc + (Number(c.rating) || 0), 0);
    const averageRating = Number((total / (allComments.length || 1)).toFixed(1));

    await updateDoc(doc(db, "products", productId), {
      rating: averageRating,
      reviewCount: allComments.length,
      updatedAt: Timestamp.now(),
    });

    console.log(
      `  → "${productName}" updated: ${averageRating}★ avg, ${allComments.length} total reviews`
    );
  }

  console.log("\nSeeding complete (Phase 4 — smart intelligence active)!");
}

const offset = parseInt(process.argv[2] ?? "0", 10) || 0;
const batchSize = parseInt(process.argv[3] ?? "15", 10) || 15;

seedRandomComments(offset, batchSize).catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
