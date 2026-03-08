import { db } from "./firebase";
import { collection, getDocs, addDoc, doc, updateDoc, query, where, Timestamp } from "firebase/firestore";

const RANDOM_COMMENTS = [
  "Amazing product! Highly recommended.",
  "The quality is better than I expected.",
  "Fast delivery and great packaging.",
  "Worth every penny. I will buy again.",
  "Exactly as described in the pictures.",
  "Very artisanal and unique. Love it!",
  "Great customer service and high-quality item.",
  "A bit expensive but the craftsmanship is superb.",
  "Perfect gift for my friend, they loved it.",
  "Five stars! Excellent experience."
];

const RANDOM_NAMES = [
  "Ahmed Khan", "Sara Ali", "Zainab Malik", "Omar Farooq", "Fatima Shah",
  "Bilal Hassan", "Ayesha Siddiqui", "Hamza Javed", "Mariam Tariq", "Usman Sheikh"
];

export async function seedRandomComments() {
  console.log("Starting to seed random comments...");
  
  try {
    const productsSnapshot = await getDocs(collection(db, "products"));
    console.log(`Found ${productsSnapshot.size} products.`);

    if (productsSnapshot.empty) {
      console.log("No products found to seed comments for.");
      return true;
    }

    for (const productDoc of productsSnapshot.docs) {
      const productId = productDoc.id;
      const productName = productDoc.data().name;
      
      const numComments = Math.floor(Math.random() * 2) + 2;
      console.log(`Adding ${numComments} comments to ${productName}...`);
      
      for (let i = 0; i < numComments; i++) {
        const comment = RANDOM_COMMENTS[Math.floor(Math.random() * RANDOM_COMMENTS.length)];
        const name = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
        const rating = Math.floor(Math.random() * 2) + 4;

        try {
          await addDoc(collection(db, "comments"), {
            productId,
            userName: name,
            content: comment,
            rating,
            userId: "system-seed",
            userPhoto: "",
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          });
        } catch (e: any) {
          console.error(`Failed to add comment for ${productName}:`, e);
          if (e.code === 'permission-denied') {
             throw new Error("Missing or insufficient permissions. Please check your Firestore Rules to allow writes to the 'comments' collection.");
          }
          throw e;
        }
      }

      const commentsQuery = query(collection(db, "comments"), where("productId", "==", productId));
      const commentsSnapshot = await getDocs(commentsQuery);
      const comments = commentsSnapshot.docs.map(d => d.data());
      const totalRating = comments.reduce((acc, c) => acc + (Number(c.rating) || 0), 0);
      const averageRating = Number((totalRating / (comments.length || 1)).toFixed(1));

      try {
        await updateDoc(doc(db, "products", productId), {
          rating: averageRating,
          reviewCount: comments.length,
          updatedAt: Timestamp.now()
        });
      } catch (e: any) {
        console.error(`Failed to update product ${productName}:`, e);
        if (e.code === 'permission-denied') {
           throw new Error("Missing or insufficient permissions. Please check your Firestore Rules to allow updates to the 'products' collection.");
        }
        throw e;
      }
    }

    console.log("Seeding complete!");
    return true;
  } catch (error) {
    console.error("Error seeding comments:", error);
    throw error;
  }
}
