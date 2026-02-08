import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useSearch } from "wouter";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail, ChevronRight } from "lucide-react";
import { useState } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import SEO from "@/components/SEO";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";
import { SocialAuthButton } from "@/components/auth/SocialAuthButton";
import { useCartStore } from "@/store/cartStore";
import { doc, updateDoc, serverTimestamp, collection, getDocs, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import * as z from "zod";
import { loginSchema, type LoginValues } from "@/lib/validations/auth";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { toast } = useToast();
  const { signInWithEmail, signInWithGoogle, resetPassword } = useAuthStore();
  const cartStore = useCartStore();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const handleRedirect = () => {
    const params = new URLSearchParams(searchString);
    const redirectUrl = params.get("redirect") || params.get("returnTo");
    
    if (redirectUrl && redirectUrl.startsWith("/")) {
      setLocation(redirectUrl);
    } else if (cartStore.items.length > 0) {
      setLocation("/cart");
    } else {
      setLocation("/");
    }
  };

  const syncCartAfterLogin = async (uid: string) => {
    const guestCartJson = localStorage.getItem("cart-storage");
    if (!guestCartJson) return;

    try {
      const guestCartData = JSON.parse(guestCartJson);
      const guestItems = guestCartData.state?.items || [];
      
      if (guestItems.length > 0) {
        const cartCollectionRef = collection(db, "users", uid, "cart");
        const existingCartSnap = await getDocs(cartCollectionRef);
        const existingItemsMap = new Map();
        existingCartSnap.docs.forEach(doc => {
          existingItemsMap.set(doc.data().productId, { id: doc.id, ...doc.data() });
        });

        const batch = writeBatch(db);
        
        guestItems.forEach((item: any) => {
          const productId = item.productId || item.id;
          const existingItem = existingItemsMap.get(productId);
          if (existingItem) {
            const newQuantity = Math.max(existingItem.quantity, item.quantity);
            batch.update(doc(db, "users", uid, "cart", existingItem.id), {
              quantity: newQuantity,
              updatedAt: serverTimestamp()
            });
          } else {
            const newDocRef = doc(collection(db, "users", uid, "cart"));
            batch.set(newDocRef, {
              productId: productId,
              quantity: item.quantity,
              addedAt: serverTimestamp(),
            });
          }
        });

        await batch.commit();
        localStorage.removeItem("cart-storage");
        toast({
          title: "Cart synchronized",
          description: "Your previous cart items have been saved to your account.",
        });
      }
    } catch (e) {
      console.error("Cart sync error:", e);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        await syncCartAfterLogin(currentUser.uid);
        toast({
          title: "Welcome back!",
          description: "Signed in successfully with Google.",
        });
        handleRedirect();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign-in Failed",
        description: error.message || "Failed to sign in with Google.",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = form.getValues("email");
    if (!email || !z.string().email().safeParse(email).success) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter a valid email address to reset your password.",
      });
      return;
    }

    try {
      await resetPassword(email);
      toast({
        title: "Reset link sent",
        description: "Please check your email for the password reset instructions.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send reset link.",
      });
    }
  };

  async function onSubmit(data: LoginValues) {
    setIsLoading(true);
    try {
      await signInWithEmail(data.email, data.password);
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        // Update last login in Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        await updateDoc(userDocRef, {
          lastLoginAt: serverTimestamp()
        }).catch(err => console.error("Update lastLoginAt failed:", err));

        await syncCartAfterLogin(currentUser.uid);
        
        toast({
          title: "Welcome back!",
          description: "You have signed in successfully.",
        });
        handleRedirect();
      }
    } catch (error: any) {
      console.error("Login error:", error);
      let message = "Invalid email or password. Please try again.";
      
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        message = "Invalid email or password. Please try again.";
      } else if (error.code === "auth/too-many-requests") {
        message = "Too many failed attempts. Please try again later or reset your password.";
      } else if (error.code === "auth/network-request-failed") {
        message = "Check your internet connection and try again.";
      }

      toast({
        variant: "destructive",
        title: "Login Failed",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome Back"
      description="Sign in to your PakCart account to track orders and enjoy a faster checkout experience."
    >
      <SEO
        title="Login - PakCart"
        description="Sign in to your PakCart account. Pakistani artisanal products, nationwide COD, and easy order tracking."
      />
      
      <div className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        disabled={isLoading || isGoogleLoading}
                        className="pl-10 min-h-[44px] text-base"
                        {...field}
                        data-testid="input-email"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs text-primary hover:underline font-medium"
                      tabIndex={-1}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        disabled={isLoading || isGoogleLoading}
                        className="pl-10 pr-10 min-h-[44px] text-base"
                        {...field}
                        data-testid="input-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 py-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading || isGoogleLoading}
                      data-testid="checkbox-remember-me"
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal text-muted-foreground cursor-pointer">
                    Remember me for 30 days
                  </FormLabel>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full min-h-[44px] text-base font-semibold"
              disabled={isLoading || isGoogleLoading}
              data-testid="button-login"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-muted" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <SocialAuthButton
          onClick={handleGoogleSignIn}
          isLoading={isGoogleLoading}
          disabled={isLoading}
          data-testid="button-google-login"
        />

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link 
            href="/auth/signup" 
            className="text-primary font-semibold hover:underline inline-flex items-center gap-0.5"
            data-testid="link-signup"
          >
            Create account
            <ChevronRight className="h-4 w-4" />
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
