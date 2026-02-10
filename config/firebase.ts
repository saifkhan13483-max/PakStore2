import { initializeApp, cert, getApps, ServiceAccount } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

let db: Firestore;
let auth: Auth;
let firebaseInitialized = false;

const env = process.env.NODE_ENV || 'development';

try {
  const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  // 1. Handling different environments (dev/staging/prod)
  // 2. Proper error handling for missing credentials
  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
    if (!getApps().length) {
      initializeApp({
        credential: cert(serviceAccount),
        // 3. Connection optimization (Internal Firebase Admin SDK handles this)
      });
    }
    db = getFirestore();
    auth = getAuth();
    
    // 3. Firestore optimization settings
    if (env === 'production') {
      db.settings({
        ignoreUndefinedProperties: true,
      });
    }
    
    firebaseInitialized = true;
  } else {
    const missing: string[] = [];
    if (!serviceAccount.projectId) missing.push("FIREBASE_PROJECT_ID");
    if (!serviceAccount.clientEmail) missing.push("FIREBASE_CLIENT_EMAIL");
    if (!serviceAccount.privateKey) missing.push("FIREBASE_PRIVATE_KEY");
    
    if (env === 'production') {
      throw new Error(`CRITICAL: Missing required Firebase credentials: ${missing.join(', ')}`);
    } else {
      console.warn(`Firebase credentials not configured in ${env} mode. Missing: ${missing.join(', ')}. Firebase features will be disabled.`);
    }
  }
} catch (error) {
  if (env === 'production') {
    console.error("CRITICAL: Firebase initialization failed in production:", error);
    process.exit(1); // 4. Security: Exit in production if DB fails to connect
  } else {
    console.warn("Firebase initialization failed:", error);
  }
}

export { db, auth, firebaseInitialized };
