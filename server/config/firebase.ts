import * as admin from "firebase-admin";

/**
 * PakCart Firebase Configuration
 * 
 * Handles different environments, provides production-ready error handling,
 * and initializes the Firebase Admin SDK for Firestore and Auth.
 */

let firebaseInitialized = false;
let auth: admin.auth.Auth;
let db: admin.firestore.Firestore;

const initializeFirebase = () => {
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    const isProduction = process.env.NODE_ENV === "production";
    
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      
      // Initialize Firebase Admin with production settings
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        // Additional production optimizations can be added here
      });
      
      auth = admin.auth();
      db = admin.firestore();
      
      // Firestore Performance Tuning for Production
      db.settings({
        ignoreUndefinedProperties: true, // Prevents errors with undefined values
      });

      firebaseInitialized = true;
      console.log(`Firebase Admin initialized successfully in ${process.env.NODE_ENV || 'development'} mode`);
    } else {
      // Critical error in production, warning in development
      if (isProduction) {
        console.error("FATAL: FIREBASE_SERVICE_ACCOUNT is not set in production environment!");
      } else {
        console.warn("FIREBASE_SERVICE_ACCOUNT not set. Firebase features are disabled for local development.");
      }
      
      // Provide dummy objects to prevent crashes, though middleware should handle the uninitialized state
      auth = {} as admin.auth.Auth;
      db = {} as admin.firestore.Firestore;
    }
  } catch (error) {
    console.error("Error during Firebase Admin initialization:", error);
    auth = {} as admin.auth.Auth;
    db = {} as admin.firestore.Firestore;
  }
};

initializeFirebase();

/**
 * Security Considerations:
 * 1. FIREBASE_SERVICE_ACCOUNT should be stored as an encrypted secret.
 * 2. This file ensures that if credentials are missing, the app doesn't crash 
 *    immediately but logs appropriate errors.
 * 3. Middleware (like verifyFirebaseToken) must check 'firebaseInitialized' before use.
 */

export { auth, db, firebaseInitialized };
