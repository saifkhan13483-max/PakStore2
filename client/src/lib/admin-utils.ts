// Promotion script for PakCart Admins
// To run this, you can execute it via a temporary component or use Firebase Console as described in the summary.

import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

const ADMIN_EMAILS = [
  'saifkhan16382@gmail.com',
  'ch.ayan.arain786@gmail.com'
];

/**
 * INSTRUCTIONS FOR MANUAL UPDATE IN FIREBASE CONSOLE:
 * 
 * 1. Go to Firebase Console -> Firestore Database.
 * 2. Look for the 'users' collection.
 * 3. Find the document corresponding to the user's UID (you can find UIDs in the Authentication tab).
 * 4. Add or edit the field 'role' and set its value to "admin" (string).
 * 5. Add or edit the field 'updatedAt' using the "Server timestamp" option.
 */

export async function promoteToAdmin(uid: string, email: string) {
  if (!ADMIN_EMAILS.includes(email)) {
    console.error(`Email ${email} is not in the authorized admin list.`);
    return;
  }

  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      role: 'admin',
      email: email,
      updatedAt: serverTimestamp()
    }, { merge: true });
    console.log(`Successfully promoted ${email} to admin.`);
  } catch (error) {
    console.error(`Error promoting ${email} to admin:`, error);
  }
}
