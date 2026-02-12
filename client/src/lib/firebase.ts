import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence, type Firestore } from "firebase/firestore";
import { getAnalytics, type Analytics, logEvent } from "firebase/analytics";
import { getPerformance, type FirebasePerformance } from "firebase/performance";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;
let auth: Auth;
let googleProvider: GoogleAuthProvider;
let db: Firestore;
let analytics: Analytics | null = null;
let performance: FirebasePerformance | null = null;

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

    // Initialize Analytics and Performance if supported
    if (typeof window !== "undefined") {
      // Analytics measurementId is optional but recommended
      if (firebaseConfig.measurementId) {
        analytics = getAnalytics(app);
      }
      performance = getPerformance(app);

      enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Firestore persistence failed: Multiple tabs open');
        } else if (err.code === 'unimplemented') {
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

/**
 * Analytics utility wrapper
 */
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (analytics) {
    logEvent(analytics, eventName, eventParams);
  }
};

export { auth, googleProvider, db, analytics, performance };
export default app;
