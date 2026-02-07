import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthUser, AuthError } from '@/types/auth';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: AuthError | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: AuthError | null) => void;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const mapFirebaseUserToAuthUser = (user: FirebaseUser): AuthUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
  phoneNumber: user.phoneNumber,
  emailVerified: user.emailVerified,
  createdAt: user.metadata.creationTime || new Date().toISOString(),
  lastLoginAt: user.metadata.lastSignInTime || new Date().toISOString(),
  providerId: user.providerData[0]?.providerId || 'password',
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      error: null,
      isAuthenticated: false,
      setUser: (user) => 
        set({ 
          user, 
          isAuthenticated: !!user, 
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

// Initialize auth listener
onAuthStateChanged(auth, (firebaseUser) => {
  if (firebaseUser) {
    useAuthStore.getState().setUser(mapFirebaseUserToAuthUser(firebaseUser));
  } else {
    useAuthStore.getState().setUser(null);
  }
});
