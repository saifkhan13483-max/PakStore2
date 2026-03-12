/**
 * CLI seed script — run with:  npx tsx scripts/seed-comments.ts
 *
 * Uses the same data engine as the frontend admin button so results
 * are identical regardless of which entry point triggers the seeding.
 */

import { initializeApp } from "firebase/app";
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

// Shared data engine (same files used by the frontend)
import { getRandomName, getDiceBearUrl } from "../client/src/lib/seed-data/name-pool";
import {
  detectCategory,
  getRealisticRating,
  getCommentCount,
  generateReviewContent,
  generateRealisticTimestamp,
} from "../client/src/lib/seed-data/review-templates";

const firebaseConfig = {
  apiKey: "AIzaSyCy6W_iVKhOuawX5kLtq_arxsVfnxbfg94",
  authDomain: "pakstore-45ec7.firebaseapp.com",
  projectId: "pakstore-45ec7",
  storageBucket: "pakstore-45ec7.firebasestorage.app",
  messagingSenderId: "427945652323",
  appId: "1:427945652323:web:14ba66302d404561d7c856",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedRandomComments(): Promise<void> {
  console.log("Starting to seed realistic comments...");

  const productsSnapshot = await getDocs(collection(db, "products"));
  console.log(`Found ${productsSnapshot.size} products.`);

  for (const productDoc of productsSnapshot.docs) {
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
        console.error(`Failed to delete old comment: ${e.message}`);
      }
    }

    // --- Generate new comments ---
    const category = detectCategory(product);
    const numComments = getCommentCount(product);
    console.log(`Adding ${numComments} comments to "${productName}" (${category})...`);

    for (let i = 0; i < numComments; i++) {
      const { name } = getRandomName();
      const rating = getRealisticRating();
      const content = generateReviewContent(productName, category, rating as 1 | 2 | 3 | 4 | 5);
      const ts = generateRealisticTimestamp();
      const firestoreTs = Timestamp.fromDate(ts);

      await addDoc(collection(db, "comments"), {
        productId,
        userName: name,
        content,
        rating,
        userId: "system-seed",
        userPhoto: getDiceBearUrl(name),
        createdAt: firestoreTs,
        updatedAt: firestoreTs,
      });
    }

    // --- Recalculate product averageRating & reviewCount ---
    const allCommentsSnapshot = await getDocs(
      query(collection(db, "comments"), where("productId", "==", productId))
    );
    const allComments = allCommentsSnapshot.docs.map((d) => d.data());
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

  console.log("\nSeeding complete!");
}

seedRandomComments().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
