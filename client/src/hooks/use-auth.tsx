import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  signInWithPopup
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: typeof signInWithEmailAndPassword;
  register: typeof createUserWithEmailAndPassword;
  logout: typeof signOut;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const setUserStore = useAuthStore((state) => state.setUser);
  const clearUserStore = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        setUserStore({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
      } else {
        clearUserStore();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUserStore, clearUserStore]);

  const login = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);
  const register = (email: string, pass: string) => createUserWithEmailAndPassword(auth, email, pass);
  const logout = () => signOut(auth);
  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
