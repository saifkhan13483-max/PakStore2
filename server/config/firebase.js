import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// Reconstruct service account from individual secrets
const serviceAccount = {
  type: "service_account",
  project_id: process.env.VITE_FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  token_uri: "https://oauth2.googleapis.com/token",
};

if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
  console.error("FIREBASE_PRIVATE_KEY or FIREBASE_CLIENT_EMAIL is not defined in environment variables.");
}

const app = initializeApp({
  credential: cert(serviceAccount)
});

export const db = getFirestore(app);
export const auth = getAuth(app);
