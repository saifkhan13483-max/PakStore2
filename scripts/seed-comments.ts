import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, query, where, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCy6W_iVKhOuawX5kLtq_arxsVfnxbfg94",
  authDomain: "pakstore-45ec7.firebaseapp.com",
  projectId: "pakstore-45ec7",
  storageBucket: "pakstore-45ec7.firebasestorage.app",
  messagingSenderId: "427945652323",
  appId: "1:427945652323:web:14ba66302d404561d7c856"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

async function seedRandomComments() {
  console.log("Starting to seed random comments...");
  
  try {
    const productsSnapshot = await getDocs(collection(db, "products"));
    console.log(`Found ${productsSnapshot.size} products.`);

    for (const productDoc of productsSnapshot.docs) {
      const productId = productDoc.id;
      const productName = productDoc.data().name;
      
      const numComments = Math.floor(Math.random() * 2) + 2;
      console.log(`Adding ${numComments} comments to ${productName}...`);
      
      for (let i = 0; i < numComments; i++) {
        const comment = RANDOM_COMMENTS[Math.floor(Math.random() * RANDOM_COMMENTS.length)];
        const name = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
        const rating = Math.floor(Math.random() * 2) + 4;

        await addDoc(collection(db, "comments"), {
          productId,
          userName: name,
          content: comment,
          rating,
          userId: "system-seed",
          userPhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.split(' ')[0])}`,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }

      const commentsQuery = query(collection(db, "comments"), where("productId", "==", productId));
      const commentsSnapshot = await getDocs(commentsQuery);
      const comments = commentsSnapshot.docs.map(d => d.data());
      const totalRating = comments.reduce((acc, c) => acc + (Number(c.rating) || 0), 0);
      const averageRating = Number((totalRating / (comments.length || 1)).toFixed(1));

      await updateDoc(doc(db, "products", productId), {
        rating: averageRating,
        reviewCount: comments.length,
        updatedAt: Timestamp.now()
      });
    }

    console.log("Seeding complete!");
  } catch (error) {
    console.error("Error seeding comments:", error);
  }
}

seedRandomComments().catch(console.error);
