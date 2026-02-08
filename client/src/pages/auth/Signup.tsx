import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useLocation } from "wouter";
import { CheckCircle, AlertCircle, Eye, EyeOff, X, Check, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
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
import { auth, db, googleProvider } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc, updateDoc, writeBatch, collection, getDocs } from "firebase/firestore";
import { SocialAuthButton } from "@/components/auth/SocialAuthButton";

const signupSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .regex(/^[a-zA-Z\s]+$/, "Full name should only contain letters and spaces"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Please accept our terms to continue",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

const passwordRequirements = [
  { id: "length", label: "Minimum 8 characters", regex: /.{8,}/ },
  { id: "uppercase", label: "At least one uppercase letter (A-Z)", regex: /[A-Z]/ },
  { id: "lowercase", label: "At least one lowercase letter (a-z)", regex: /[a-z]/ },
  { id: "number", label: "At least one number (0-9)", regex: /[0-9]/ },
  { id: "special", label: "At least one special character (!@#$%^&*)", regex: /[^A-Za-z0-9]/ },
];

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
    mode: "onChange",
  });

  const { touchedFields, errors } = form.formState;
  const password = form.watch("password");
  const confirmPassword = form.watch("confirmPassword");

  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 20;
    if (/[A-Z]/.test(password)) score += 20;
    if (/[a-z]/.test(password)) score += 20;
    if (/[0-9]/.test(password)) score += 20;
    if (/[^A-Za-z0-9]/.test(password)) score += 20;
    return score;
  }, [password]);

  const getStrengthColor = (score: number) => {
    if (score <= 40) return "bg-red-500";
    if (score <= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthLabel = (score: number) => {
    if (score === 0) return "";
    if (score <= 40) return "Weak";
    if (score <= 80) return "Medium";
    return "Strong";
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Create new user document with consistent fields
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          phoneNumber: "",
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          provider: "google",
          emailVerified: user.emailVerified,
          preferences: {},
          shippingAddresses: [],
        });
      } else {
        // Update last login and potentially sync profile info
        await updateDoc(userDocRef, {
          lastLoginAt: serverTimestamp(),
          // Optional: sync displayName or photoURL if they changed
          displayName: user.displayName || userDoc.data().displayName,
          photoURL: user.photoURL || userDoc.data().photoURL,
        });
      }

      // Sync Cart from localStorage to Firestore
      const guestCartJson = localStorage.getItem("cart-storage");
      if (guestCartJson) {
        try {
          const guestCartData = JSON.parse(guestCartJson);
          const guestItems = guestCartData.state?.items || [];
          
          if (guestItems.length > 0) {
            const cartCollectionRef = collection(db, "users", user.uid, "cart");
            const existingCartSnap = await getDocs(cartCollectionRef);
            const existingItemsMap = new Map();
            existingCartSnap.docs.forEach(doc => {
              existingItemsMap.set(doc.data().productId, { id: doc.id, ...doc.data() });
            });

            const batch = writeBatch(db);
            
            guestItems.forEach((item: any) => {
              const existingItem = existingItemsMap.get(item.id);
              if (existingItem) {
                // Use higher quantity
                const newQuantity = Math.max(existingItem.quantity, item.quantity);
                batch.update(doc(db, "users", user.uid, "cart", existingItem.id), {
                  quantity: newQuantity,
                  updatedAt: serverTimestamp()
                });
              } else {
                // Add new item
                const newDocRef = doc(collection(db, "users", user.uid, "cart"));
                batch.set(newDocRef, {
                  productId: item.id,
                  quantity: item.quantity,
                  addedAt: serverTimestamp(),
                  // Add other product info if needed
                });
              }
            });

            await batch.commit();
            // Optional: Notify user about cart merge in next part
          }
        } catch (e) {
          console.error("Cart sync error:", e);
        }
      }

      toast({
        title: "Welcome back!",
        description: `Successfully signed in as ${user.displayName}`,
      });

      setLocation("/");
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      let message = "Failed to sign in with Google. Please try again.";

      if (error.code === "auth/popup-blocked") {
        message = "Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.";
      } else if (error.code === "auth/popup-closed-by-user") {
        message = "Sign-in was cancelled. Click the button to try again when you're ready.";
      } else if (error.code === "auth/account-exists-with-different-credential") {
        message = "An account already exists with the same email address but different sign-in credentials.";
      }

      toast({
        variant: "destructive",
        title: "Sign-in Failed",
        description: message,
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  async function onSubmit(data: SignupFormValues) {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: data.fullName });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: data.email,
        displayName: data.fullName,
        phoneNumber: "",
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        provider: "password",
        emailVerified: false,
        preferences: {},
        shippingAddresses: [],
      });

      toast({
        title: "Account created!",
        description: "Welcome to PakCart. Redirecting you to home...",
      });

      setLocation("/");
    } catch (error: any) {
      console.error("Signup error:", error);
      let message = "An error occurred during registration. Please try again.";
      
      if (error.code === "auth/email-already-in-use") {
        message = "An account already exists with this email address. Please sign in instead or use a different email.";
      } else if (error.code === "auth/weak-password") {
        message = "Password should be at least 8 characters with uppercase, lowercase, number and special character for better security.";
      } else if (error.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (error.code === "auth/operation-not-allowed") {
        message = "Email/password accounts are not enabled. Please contact support.";
      } else if (error.code === "auth/network-request-failed") {
        message = "Check your connection and try again.";
      }

      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create Account"
      description="Join thousands of satisfied customers shopping across Pakistan. Free delivery, cash on delivery available."
    >
      <SEO
        title="Create Account"
        description="Join thousands of satisfied customers shopping across Pakistan. Free delivery, cash on delivery available."
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Enter your full name"
                      disabled={isLoading}
                      className={`min-h-[44px] text-base transition-colors ${
                        touchedFields.fullName
                          ? errors.fullName
                            ? "border-red-500 focus-visible:ring-red-500"
                            : "border-green-500 focus-visible:ring-green-500"
                          : ""
                      }`}
                      {...field}
                      data-testid="input-fullname"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {touchedFields.fullName && (
                        <>
                          {errors.fullName ? (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          ) : (
                            field.value.length >= 2 && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      disabled={isLoading}
                      className={`min-h-[44px] text-base transition-colors ${
                        touchedFields.email
                          ? errors.email
                            ? "border-red-500 focus-visible:ring-red-500"
                            : "border-green-500 focus-visible:ring-green-500"
                          : ""
                      }`}
                      {...field}
                      data-testid="input-email"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {touchedFields.email && (
                        <>
                          {errors.email ? (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          ) : (
                            field.value.includes("@") && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )
                          )}
                        </>
                      )}
                    </div>
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a secure password"
                      autoComplete="new-password"
                      disabled={isLoading}
                      className={`min-h-[44px] pr-10 text-base transition-colors ${
                        touchedFields.password
                          ? errors.password
                            ? "border-red-500 focus-visible:ring-red-500"
                            : "border-green-500 focus-visible:ring-green-500"
                          : ""
                      }`}
                      {...field}
                      data-testid="input-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </FormControl>
                {password && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Strength:</span>
                      <span className={`font-medium ${
                        passwordStrength <= 40 ? "text-red-500" : 
                        passwordStrength <= 80 ? "text-yellow-600" : "text-green-600"
                      }`}>
                        {getStrengthLabel(passwordStrength)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ease-in-out ${getStrengthColor(passwordStrength)}`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
                      {passwordRequirements.map((req) => {
                        const isMet = req.regex.test(password);
                        return (
                          <li 
                            key={req.id} 
                            className={`flex items-center gap-2 text-xs transition-colors ${
                              isMet ? "text-green-600" : "text-muted-foreground"
                            }`}
                          >
                            {isMet ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <X className="h-3.5 w-3.5 text-red-400" />
                            )}
                            {req.label}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      disabled={isLoading}
                      className={`min-h-[44px] pr-10 text-base transition-colors ${
                        touchedFields.confirmPassword
                          ? errors.confirmPassword
                            ? "border-red-500 focus-visible:ring-red-500"
                            : "border-green-500 focus-visible:ring-green-500"
                          : ""
                      }`}
                      {...field}
                      data-testid="input-confirm-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                    <div className="absolute right-10 top-1/2 -translate-y-1/2">
                      {confirmPassword && !errors.confirmPassword && password === confirmPassword && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md py-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                    data-testid="checkbox-terms"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal text-muted-foreground">
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:underline" target="_blank">
                      Terms & Conditions
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:underline" target="_blank">
                      Privacy Policy
                    </Link>
                  </FormLabel>
                  <FormMessage className="text-xs" />
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full min-h-[44px]"
            disabled={isLoading || isGoogleLoading}
            data-testid="button-submit-signup"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-background px-2 text-muted-foreground">OR</span>
            </div>
          </div>

          <SocialAuthButton
            onClick={handleGoogleSignIn}
            isLoading={isGoogleLoading}
            disabled={isLoading}
          />

          <div className="text-center mt-4">
            <span className="text-sm text-muted-foreground">
              Already have an account?{" "}
            </span>
            <Link
              href="/auth/login"
              className="text-sm font-medium text-primary hover:underline"
              data-testid="link-signin"
            >
              Sign in
            </Link>
          </div>
        </form>
      </Form>
    </AuthLayout>
  );
}
