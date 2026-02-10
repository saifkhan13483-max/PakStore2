import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

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
  } catch (e) {
    console.error("Firebase initialization error:", e);
    // Fallback to proxy objects to prevent "Expected first argument to collection() to be a FirebaseFirestore" errors
    db = new Proxy({}, {
      get: () => { throw new Error("Firebase not initialized. Check your environment variables."); }
    }) as Firestore;
    auth = {} as Auth;
    app = {} as FirebaseApp;
    googleProvider = {} as GoogleAuthProvider;
  }
} else {
  console.warn("Firebase environment variables are missing. Initialization skipped.");
  // Use proxies that throw descriptive errors when accessed
  const createProxy = (name: string) => new Proxy({}, {
    get: (_, prop) => {
      if (prop === 'then') return undefined; // Avoid issues with async/await
      return () => {
        throw new Error(`${name} is not initialized because environment variables are missing. Please set VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, and VITE_FIREBASE_APP_ID.`);
      };
    }
  });

  db = createProxy("Firestore") as unknown as Firestore;
  auth = createProxy("Auth") as unknown as Auth;
  app = {} as FirebaseApp;
  googleProvider = {} as GoogleAuthProvider;
}

export { auth, googleProvider, db };
export default app;
