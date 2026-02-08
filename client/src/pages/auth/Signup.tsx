import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "wouter";
import { CheckCircle, AlertCircle, Eye, EyeOff, X, Check } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";

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

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
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

  async function onSubmit(data: SignupFormValues) {
    console.log(data);
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

          <Button
            type="submit"
            className="w-full min-h-[44px]"
            data-testid="button-submit-signup"
          >
            Continue
          </Button>

          <div className="text-center mt-4">
            <span className="text-sm text-muted-foreground tertiary">
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
