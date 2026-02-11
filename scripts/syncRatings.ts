import { db } from "../client/src/lib/firebase";
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";

async function syncRatings() {
  const productsSnapshot = await getDocs(collection(db, "products"));
  console.log(`Found ${productsSnapshot.size} products to sync.`);

  for (const productDoc of productsSnapshot.docs) {
    const productId = productDoc.id;
    const commentsQuery = query(collection(db, "comments"), where("productId", "==", productId));
    const commentsSnapshot = await getDocs(commentsQuery);
    
    if (!commentsSnapshot.empty) {
      const comments = commentsSnapshot.docs.map(d => d.data());
      const totalRating = comments.reduce((acc, c) => acc + (Number(c.rating) || 0), 0);
      const averageRating = Number((totalRating / comments.length).toFixed(1));
      
      console.log(`Updating product ${productId}: rating=${averageRating}, count=${comments.length}`);
      await updateDoc(doc(db, "products", productId), {
        rating: averageRating,
        reviewCount: comments.length
      });
    } else {
      console.log(`Product ${productId} has no reviews.`);
      await updateDoc(doc(db, "products", productId), {
        rating: 0,
        reviewCount: 0
      });
    }
  }
  console.log("Sync complete!");
}

syncRatings().catch(console.error);
