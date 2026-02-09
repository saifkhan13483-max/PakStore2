import * as admin from "firebase-admin";

let firebaseInitialized = false;
let auth: admin.auth.Auth;
let db: admin.firestore.Firestore;

try {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    
    auth = admin.auth();
    db = admin.firestore();
    firebaseInitialized = true;
    console.log("Firebase Admin initialized successfully");
  } else {
    console.warn("FIREBASE_SERVICE_ACCOUNT environment variable not set. Firebase features will be disabled.");
    auth = {} as admin.auth.Auth;
    db = {} as admin.firestore.Firestore;
  }
} catch (error) {
  console.error("Error initializing Firebase Admin:", error);
  auth = {} as admin.auth.Auth;
  db = {} as admin.firestore.Firestore;
}

export { auth, db, firebaseInitialized };
