/**
 * Seeds hand-authored, product-specific reviews from a JSON data file.
 *
 * Usage:
 *   npx tsx scripts/seed-authentic-reviews.ts [data-file] [--dry]
 *
 * Default data file: scripts/seed-authentic-reviews-data.json
 *
 * Behavior:
 *  - Authenticates as the existing seed bot account.
 *  - For each product entry: deletes prior `system-seed` comments, writes the
 *    new authored ones, then recalculates the product's rating + reviewCount.
 *  - Real customer reviews (userId !== "system-seed") are preserved.
 */

import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { readFileSync } from "fs";
import { resolve } from "path";

const firebaseConfig = {
  apiKey: "AIzaSyCy6W_iVKhOuawX5kLtq_arxsVfnxbfg94",
  authDomain: "pakstore-45ec7.firebaseapp.com",
  projectId: "pakstore-45ec7",
  storageBucket: "pakstore-45ec7.firebasestorage.app",
  messagingSenderId: "427945652323",
  appId: "1:427945652323:web:14ba66302d404561d7c856",
};

const SEED_EMAIL = "seedbot.pakstore@temp-seed.com";
const SEED_PASSWORD = "SeedBot#2026!";

interface ReviewInput {
  name: string;
  gender: "male" | "female" | "unisex";
  rating: 1 | 2 | 3 | 4 | 5;
  content: string;
  /** ISO date string, e.g. "2026-04-12T15:30:00Z" */
  date: string;
}

interface ProductReviews {
  productId: string;
  productName?: string;
  reviews: ReviewInput[];
}

interface SeedFile {
  products: ProductReviews[];
}

function avatarFor(name: string, gender: "male" | "female" | "unisex"): string | null {
  const seed = encodeURIComponent(name + "-" + Math.floor(Math.random() * 9999));
  const styles =
    gender === "female"
      ? ["avataaars", "lorelei", "micah", "notionists"]
      : gender === "male"
        ? ["avataaars", "micah", "notionists", "adventurer"]
        : ["avataaars", "micah", "notionists", "adventurer", "lorelei"];
  const style = styles[Math.floor(Math.random() * styles.length)];
  if (Math.random() < 0.12) return null;
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
}

function helpfulFor(content: string): number {
  const len = content.length;
  const base = len > 200 ? 8 : len > 120 ? 4 : 2;
  return Math.max(0, Math.floor(Math.random() * base + Math.random() * 3));
}

function verifiedPurchase(): boolean {
  return Math.random() < 0.75;
}

const SELLER_REPLIES = [
  "Thank you so much for your kind words! ❤️ — Team PakCart",
  "Bohat shukriya! Aap jaise customers humari motivation hain 🙏 — PakCart",
  "Khushi hui sun kar! Stay tuned for more designs soon — PakCart",
  "Thank you for the lovely feedback, please do shop again! — PakCart Team",
  "Aap ka ye trust hum bohat appreciate karte hain! — PakCart",
];

function sellerReplyFor(rating: number, date: Date): { reply: string | null; replyDate: Date | null } {
  if (rating < 5 || Math.random() > 0.18) return { reply: null, replyDate: null };
  const reply = SELLER_REPLIES[Math.floor(Math.random() * SELLER_REPLIES.length)];
  const replyDate = new Date(date.getTime() + (1 + Math.random() * 2) * 86400000);
  return { reply, replyDate };
}

async function main() {
  const args = process.argv.slice(2);
  const dataFile = args.find((a) => !a.startsWith("--")) ?? "scripts/seed-authentic-reviews-data.json";
  const dryRun = args.includes("--dry");

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log("Authenticating seed bot...");
  try {
    await signInWithEmailAndPassword(auth, SEED_EMAIL, SEED_PASSWORD);
    console.log("Signed in.");
  } catch {
    await createUserWithEmailAndPassword(auth, SEED_EMAIL, SEED_PASSWORD);
    console.log("Created new seed account.");
  }

  const raw = readFileSync(resolve(dataFile), "utf-8");
  const data: SeedFile = JSON.parse(raw);
  console.log(`Loaded ${data.products.length} product(s) from ${dataFile}${dryRun ? " (DRY RUN)" : ""}`);

  let totalDeleted = 0;
  let totalWritten = 0;

  for (const entry of data.products) {
    const { productId, productName = productId, reviews } = entry;

    if (dryRun) {
      console.log(`[dry] ${productName}: would write ${reviews.length} reviews`);
      continue;
    }

    // 1. Delete prior system-seed reviews
    const oldQ = query(
      collection(db, "comments"),
      where("productId", "==", productId),
      where("userId", "==", "system-seed"),
    );
    const oldSnap = await getDocs(oldQ);
    let deleted = 0;
    for (const od of oldSnap.docs) {
      await deleteDoc(doc(db, "comments", od.id));
      deleted++;
    }

    // 2. Write new reviews
    let written = 0;
    for (const r of reviews) {
      const date = new Date(r.date);
      const ts = Timestamp.fromDate(date);
      const sr = sellerReplyFor(r.rating, date);
      await addDoc(collection(db, "comments"), {
        productId,
        userName: r.name,
        content: r.content,
        rating: r.rating,
        userId: "system-seed",
        userPhoto: avatarFor(r.name, r.gender),
        createdAt: ts,
        updatedAt: ts,
        helpfulCount: helpfulFor(r.content),
        isVerifiedPurchase: verifiedPurchase(),
        sellerReply: sr.reply,
        sellerReplyDate: sr.replyDate ? Timestamp.fromDate(sr.replyDate) : null,
      });
      written++;
    }

    // 3. Recalculate product rating + reviewCount (across all comments incl. real)
    const allSnap = await getDocs(query(collection(db, "comments"), where("productId", "==", productId)));
    const all = allSnap.docs.map((d) => d.data());
    const total = all.reduce((acc, c) => acc + (Number(c.rating) || 0), 0);
    const avg = Number((total / (all.length || 1)).toFixed(1));
    await updateDoc(doc(db, "products", productId), {
      rating: avg,
      reviewCount: all.length,
      updatedAt: Timestamp.now(),
    });

    totalDeleted += deleted;
    totalWritten += written;
    console.log(
      `✓ ${productName.padEnd(50)} | -${String(deleted).padStart(2)} +${String(written).padStart(2)} | total ${String(all.length).padStart(2)} | ${avg}★`,
    );
  }

  console.log(`\n=== Done. Deleted ${totalDeleted} old, wrote ${totalWritten} new. ===`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
