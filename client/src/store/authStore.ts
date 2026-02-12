import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthUser, AuthError } from '@/types/auth';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: AuthError | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  /**
   * Zustand is used for UI state (loading, error) and client-side derived auth state.
   * Firebase Auth is the source of truth for the user object itself.
   */
  setUser: (user: AuthUser | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: AuthError | null) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

import defaultAvatar from '@/assets/images/default-avatar.png';

const ADMIN_EMAILS = ['admin@pakcart.com', 'owner@pakcart.com', 'saifkhan16382@gmail.com'];

const mapFirebaseUserToAuthUser = (user: FirebaseUser): AuthUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL || defaultAvatar,
  phoneNumber: user.phoneNumber,
  emailVerified: user.emailVerified,
  createdAt: user.metadata.creationTime || new Date().toISOString(),
  lastLoginAt: user.metadata.lastSignInTime || new Date().toISOString(),
  providerId: user.providerData[0]?.providerId || 'password',
  role: ADMIN_EMAILS.includes(user.email || '') ? 'admin' : 'user',
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
      logout: async () => {
        set({ isLoading: true });
        try {
          await signOut(auth);
          set({ 
            user: null, 
            isAuthenticated: false, 
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
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

if (auth) {
  onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      useAuthStore.getState().setUser(mapFirebaseUserToAuthUser(firebaseUser));
    } else {
      useAuthStore.getState().setUser(null);
    }
  });
} else {
  useAuthStore.getState().setLoading(false);
}
