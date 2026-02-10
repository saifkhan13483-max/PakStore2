import { auth, googleProvider, db } from "./firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { create } from "zustand";
import { User } from "@shared/schema";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  login: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      // Sync with Firestore
      const userRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userRef);
      
      const userData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName: firebaseUser.displayName || "",
        photoURL: firebaseUser.photoURL || "",
        createdAt: new Date().toISOString(),
      };

      if (!userDoc.exists()) {
        await setDoc(userRef, userData);
      }
      
      set({ user: userData });
    } catch (error) {
      console.error("Login failed:", error);
    }
  },
  logout: async () => {
    await signOut(auth);
    set({ user: null });
  },
}));

// Initialize auth listener
onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      useAuth.getState().setUser(userDoc.data() as User);
    }
  } else {
    useAuth.getState().setUser(null);
  }
});
