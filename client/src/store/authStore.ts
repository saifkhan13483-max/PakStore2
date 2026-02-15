import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthUser, AuthError } from '@/types/auth';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: AuthError | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: AuthError | null) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  register: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
}

import defaultAvatar from '@/assets/images/default-avatar.png';

const mapFirebaseUserToAuthUser = (user: FirebaseUser, role: 'admin' | 'user' = 'user'): AuthUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL || defaultAvatar,
  phoneNumber: user.phoneNumber,
  emailVerified: user.emailVerified,
  createdAt: user.metadata.creationTime || new Date().toISOString(),
  lastLoginAt: user.metadata.lastSignInTime || new Date().toISOString(),
  providerId: user.providerData[0]?.providerId || 'password',
  role: role,
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      error: null,
      isAuthenticated: false,
      isAdmin: false,
      setUser: (user) => 
        set({ 
          user, 
          isAuthenticated: !!user, 
          isAdmin: user?.role === 'admin',
          isLoading: false,
          error: null 
        }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error, isLoading: false }),
      signInWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          await signInWithPopup(auth, googleProvider);
        } catch (error: any) {
          set({ 
            error: { code: error.code, message: error.message }, 
            isLoading: false 
          });
          throw error;
        }
      },
      signInWithEmail: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
          set({ 
            error: { code: error.code, message: error.message }, 
            isLoading: false 
          });
          throw error;
        }
      },
      resetPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          await sendPasswordResetEmail(auth, email);
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: { code: error.code, message: error.message }, 
            isLoading: false 
          });
          throw error;
        }
      },
      register: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          return await createUserWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
          set({ 
            error: { code: error.code, message: error.message }, 
            isLoading: false 
          });
          throw error;
        }
      },
      logout: async () => {
        set({ isLoading: true });
        try {
          await signOut(auth);
          set({ 
            user: null, 
            isAuthenticated: false, 
            isAdmin: false,
            error: null,
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: { code: error.code, message: error.message }, 
            isLoading: false 
          });
        }
      },
    }),
    {
      name: 'pakcart-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin
      }),
    }
  )
);

if (auth) {
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        let role: 'admin' | 'user' = 'user';
        
        if (userDoc.exists()) {
          role = userDoc.data().role === 'admin' ? 'admin' : 'user';
        } else {
          // Create initial user document if it doesn't exist
          await setDoc(userDocRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: 'user',
            photoURL: firebaseUser.photoURL || null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
        
        useAuthStore.getState().setUser(mapFirebaseUserToAuthUser(firebaseUser, role));
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // Fallback to basic user mapping if firestore fails
        useAuthStore.getState().setUser(mapFirebaseUserToAuthUser(firebaseUser));
      }
    } else {
      useAuthStore.getState().setUser(null);
    }
  });
} else {
  useAuthStore.getState().setLoading(false);
}
