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

import { getRandomName, getDiceBearUrl } from "../client/src/lib/seed-data/name-pool";
import {
  detectCategory,
  getRealisticRating,
  getCommentCount,
  generateReviewContent,
  generateClusteredTimestamps,
  type ProductCategory,
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
// Phase 4: full review content pipeline
// ---------------------------------------------------------------------------

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

    // Phase 4: cap at 3 seeded if real comments already exist
    const rawCount = getCommentCount(product);
    const numComments = realComments.length > 0 ? Math.min(3, rawCount) : rawCount;

    // Phase 4: compute real average for rating nudging
    const realAvg =
      realComments.length > 0
        ? realComments.reduce((acc, c) => acc + (Number(c.rating) || 0), 0) /
          realComments.length
        : -1;

    const category = detectCategory(product);
    const timestamps = generateClusteredTimestamps(numComments);

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

    for (let i = 0; i < numComments; i++) {
      // Phase 4: smart name picking with retry
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

      const rawRating = getRealisticRating();
      const rating = realAvg >= 0 ? nudgeRating(rawRating, realAvg) : rawRating;
      const commentDate = timestamps[i];

      // Phase 4: full content pipeline with dedup retry
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
