import { db, firebaseInitialized } from "../config/firebase";

async function promoteAdmins(emails) {
  if (!firebaseInitialized) {
    console.error("Firebase not initialized. Check your credentials.");
    return;
  }

  const USERS_COLLECTION = "users";
  
  for (const email of emails) {
    try {
      const snapshot = await db.collection(USERS_COLLECTION)
        .where('email', '==', email)
        .get();
      
      if (snapshot.empty) {
        console.log(`PROMOTE_RESULT: No user found with email: ${email}`);
        continue;
      }
      
      for (const userDoc of snapshot.docs) {
        await db.collection(USERS_COLLECTION).doc(userDoc.id).update({
          role: 'admin',
          isAdmin: true,
          updatedAt: new Date()
        });
        console.log(`PROMOTE_RESULT: Successfully promoted ${email} to admin.`);
      }
    } catch (err) {
      console.error(`PROMOTE_RESULT: Error promoting ${email}: ${err.message}`);
    }
  }
}

const targetEmails = ['saifkhan16382@gmail.com', 'ch.ayan.arain.786@gmail.com'];
promoteAdmins(targetEmails).then(() => {
  console.log("Promotion process finished.");
}).catch(err => {
  console.log(`PROMOTE_RESULT: CRITICAL ERROR: ${err.message}`);
});
