import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let googleProvider: GoogleAuthProvider;
let db: Firestore;

const isConfigValid = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  import.meta.env.VITE_FIREBASE_APP_ID
);

if (isConfigValid) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    db = getFirestore(app);

    // Enable Offline Persistence (Part 22)
    if (typeof window !== "undefined") {
      enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled in one tab at a time.
          console.warn('Firestore persistence failed: Multiple tabs open');
        } else if (err.code === 'unimplemented') {
          // The current browser does not support all of the features required to enable persistence
          console.warn('Firestore persistence is not available in this browser');
        }
      });
    }
  } catch (e) {
    console.error("Firebase initialization error:", e);
    
    const createErrorProxy = (name: string) => new Proxy({}, {
      get: (_, prop) => {
        if (prop === 'then') return undefined;
        return () => {
          throw new Error(`${name} failed to initialize. Please check your Firebase console and environment variables.`);
        };
      }
    });

    db = createErrorProxy("Firestore") as unknown as Firestore;
    auth = createErrorProxy("Auth") as unknown as Auth;
    app = {} as FirebaseApp;
    googleProvider = {} as GoogleAuthProvider;
  }
} else {
  console.warn("Firebase environment variables are missing. Initialization skipped.");
  
  const createMissingConfigProxy = (name: string) => new Proxy({}, {
    get: (_, prop) => {
      if (typeof prop === 'string') {
        return () => {
          throw new Error(`${name} is not initialized because environment variables are missing. Please set VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, and VITE_FIREBASE_APP_ID in your Secrets.`);
        };
      }
      return undefined;
    }
  });

  db = createMissingConfigProxy("Firestore") as unknown as Firestore;
  auth = createMissingConfigProxy("Auth") as unknown as Auth;
  app = {} as FirebaseApp;
  googleProvider = {} as GoogleAuthProvider;
}

export { auth, googleProvider, db };
export default app;
