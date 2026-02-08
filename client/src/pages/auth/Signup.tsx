import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "wouter";
import { CheckCircle, AlertCircle } from "lucide-react";
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

const signupSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .regex(/^[a-zA-Z\s]+$/, "Full name should only contain letters and spaces"),
  email: z.string().email("Please enter a valid email address"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
    },
    mode: "onChange",
  });

  const { touchedFields, errors } = form.formState;

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
