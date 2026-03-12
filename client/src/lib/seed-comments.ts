import { db } from "./firebase";
import {
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
import { getRandomName, getDiceBearUrl } from "./seed-data/name-pool";
import {
  detectCategory,
  getRealisticRating,
  getCommentCount,
  generateReviewContent,
  generateClusteredTimestamps,
} from "./seed-data/review-templates";
import {
  generateHelpfulCount,
  generateIsVerifiedPurchase,
  generateSellerReply,
} from "./seed-data/engagement-simulator";

/**
 * Seeds realistic, product-aware comments for every product in Firestore.
 *
 * Phase 1 features:
 *   - Product-aware review content matched to category
 *   - Weighted rating distribution (5★ 45% → 1★ 2%)
 *   - 80+ realistic Pakistani reviewer names with DiceBear avatars
 *   - 2–7 comments per product based on price tier
 *
 * Phase 2 additions:
 *   - Clustered timestamps (burst pattern mimicking post-sale review spikes)
 *   - helpfulCount correlated with review length
 *   - isVerifiedPurchase badge (~70% of comments)
 *   - sellerReply + sellerReplyDate (~20% of comments, matched to rating)
 */
export async function seedRandomComments(): Promise<true> {
  console.log("Starting to seed realistic comments (Phase 2)...");

  const productsSnapshot = await getDocs(collection(db, "products"));
  console.log(`Found ${productsSnapshot.size} products.`);

  if (productsSnapshot.empty) {
    console.log("No products found to seed comments for.");
    return true;
  }

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
    const timestamps = generateClusteredTimestamps(numComments);

    console.log(`Adding ${numComments} comments to "${productName}" (${category})...`);

    for (let i = 0; i < numComments; i++) {
      const { name } = getRandomName();
      const rating = getRealisticRating();
      const content = generateReviewContent(productName, category, rating as 1 | 2 | 3 | 4 | 5);
      const commentDate = timestamps[i];
      const firestoreTs = Timestamp.fromDate(commentDate);

      const helpfulCount = generateHelpfulCount(content);
      const isVerifiedPurchase = generateIsVerifiedPurchase();
      const replyData = generateSellerReply(rating, commentDate);

      const commentPayload: Record<string, unknown> = {
        productId,
        userName: name,
        content,
        rating,
        userId: "system-seed",
        userPhoto: getDiceBearUrl(name),
        createdAt: firestoreTs,
        updatedAt: firestoreTs,
        helpfulCount,
        isVerifiedPurchase,
        sellerReply: replyData?.sellerReply ?? null,
        sellerReplyDate: replyData ? Timestamp.fromDate(replyData.sellerReplyDate) : null,
      };

      try {
        await addDoc(collection(db, "comments"), commentPayload);
      } catch (e: any) {
        console.error(`Failed to add comment for "${productName}":`, e);
        if (e.code === "permission-denied") {
          throw new Error(
            "Missing or insufficient permissions. Please check your Firestore Rules to allow writes to the 'comments' collection."
          );
        }
        throw e;
      }
    }

    // --- Recalculate product averageRating & reviewCount ---
    const allCommentsSnapshot = await getDocs(
      query(collection(db, "comments"), where("productId", "==", productId))
    );
    const allComments = allCommentsSnapshot.docs.map((d) => d.data());
    const total = allComments.reduce((acc, c) => acc + (Number(c.rating) || 0), 0);
    const averageRating = Number((total / (allComments.length || 1)).toFixed(1));

    try {
      await updateDoc(doc(db, "products", productId), {
        rating: averageRating,
        reviewCount: allComments.length,
        updatedAt: Timestamp.now(),
      });
    } catch (e: any) {
      console.error(`Failed to update product "${productName}":`, e);
      if (e.code === "permission-denied") {
        throw new Error(
          "Missing or insufficient permissions. Please check your Firestore Rules to allow updates to the 'products' collection."
        );
      }
      throw e;
    }
  }

  console.log("Seeding complete!");
  return true;
}
