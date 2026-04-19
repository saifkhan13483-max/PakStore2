import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useToast } from "@/hooks/use-toast";
import {
  Package,
  Truck,
  BadgeCheck,
  TrendingUp,
  Wallet,
  HeadphonesIcon,
  CheckCircle2,
} from "lucide-react";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  storeUrl: z.string().optional(),
  platform: z.string().min(1, "Please select your selling platform"),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const benefits = [
  {
    icon: Package,
    title: "No Inventory Needed",
    description:
      "List our products on your store without buying any stock. Zero upfront investment required.",
  },
  {
    icon: Truck,
    title: "We Handle Shipping",
    description:
      "We pack and ship every order directly to your customer. You never touch the product.",
  },
  {
    icon: BadgeCheck,
    title: "Proven Products",
    description:
      "50,000+ happy customers. Every product we offer has already been tested in the Pakistani market.",
  },
  {
    icon: TrendingUp,
    title: "Real Profit Margins",
    description:
      "Set your own prices and keep the difference. Competitive wholesale prices so you always profit.",
  },
  {
    icon: Wallet,
    title: "Zero Risk",
    description:
      "No sale, no loss. You only pay for a product after your customer has already paid you.",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    description:
      "Our team is always available to help you with orders, tracking, and any product questions.",
  },
];

const steps = [
  {
    number: "01",
    title: "Register Below",
    description: "Fill out the short form below to apply for the program.",
  },
  {
    number: "02",
    title: "Get Approved",
    description:
      "Our team reviews your application within 24 hours and sends you the product catalog.",
  },
  {
    number: "03",
    title: "List Products",
    description:
      "Add PakCart products to your store with our ready-made images and descriptions.",
  },
  {
    number: "04",
    title: "Earn on Every Sale",
    description:
      "When an order comes in, forward it to us. We ship it. You keep the profit.",
  },
];

export default function Dropshipper() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      storeUrl: "",
      platform: "",
      message: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "dropshipper_applications"), {
        ...values,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      form.reset();
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Could not submit your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <SEO
        title="Dropshipper Program - Earn by Selling PakCart Products | PakCart"
        description="Join PakCart's dropshipper program. List proven products on your store — we handle stock, packaging, and delivery. Zero risk, real profit."
        url="https://pakcart.store/dropshipper"
        robots="index,follow"
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-700 to-green-900 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-green-200 hover:text-white">
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-green-400" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">Dropshipper Program</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="max-w-3xl">
            <span className="inline-block bg-green-600 text-green-100 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              Now Open — Limited Spots
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Sell PakCart Products.
              <br />
              We Handle Everything Else.
            </h1>
            <p className="text-lg text-green-100 mb-8 max-w-2xl">
              Join Pakistan's fastest-growing dropshipper program. List our proven products on
              your store, bring the customer — and we take care of stock, packaging, and
              delivery. Zero risk. Real profit.
            </p>
            <a href="#register">
              <Button
                size="lg"
                className="bg-white text-green-800 hover:bg-green-50 font-bold px-8 rounded-full"
                data-testid="hero-register-btn"
              >
                Register Now — It's Free
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-green-800 text-white">
        <div className="container mx-auto px-4 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { value: "50,000+", label: "Happy Customers" },
              { value: "100+", label: "Products Available" },
              { value: "PKR 0", label: "Upfront Cost" },
              { value: "24hrs", label: "Application Review" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-green-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Why Dropship with PakCart?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We've built the infrastructure so you can focus only on what matters — making
              sales.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="h-5 w-5 text-green-700" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Getting started takes less than 5 minutes.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="relative text-center">
                <div className="w-14 h-14 rounded-full bg-green-700 text-white flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {step.number}
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-[calc(50%+28px)] right-0 h-px bg-green-200" />
                )}
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Products You Can Sell
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            All categories are available for dropshipping. High-demand products with proven
            sales records.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Premium Watches",
              "Luxury Bags",
              "Crystal Cotton Bedsheets",
              "Eid Special Collections",
              "Women's Slippers",
              "Kids Bags",
              "Jewelry Sets",
              "Fashion Accessories",
            ].map((cat) => (
              <span
                key={cat}
                className="bg-white border border-green-200 text-green-800 text-sm font-medium px-4 py-2 rounded-full shadow-sm"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section id="register" className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Apply to Join the Program
              </h2>
              <p className="text-muted-foreground">
                Fill out the form below and our team will contact you within 24 hours.
              </p>
            </div>

            {submitted ? (
              <div
                className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center"
                data-testid="success-message"
              >
                <CheckCircle2 className="h-14 w-14 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  Application Received!
                </h3>
                <p className="text-green-700">
                  Thank you for applying. Our team will review your application and contact
                  you within 24 hours on the phone number or email you provided.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-5"
                    data-testid="dropshipper-form"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your full name"
                                data-testid="input-fullname"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone / WhatsApp *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="+92 3XX XXXXXXX"
                                data-testid="input-phone"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              data-testid="input-email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="platform"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Where do you sell? *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Facebook Shop, Instagram, WhatsApp, Own Website, Daraz"
                              data-testid="input-platform"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="storeUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store / Page Link (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://yourstore.com or Facebook page link"
                              data-testid="input-storeurl"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Anything you want to tell us? (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about your business, how many sales you currently do, etc."
                              className="resize-none"
                              rows={3}
                              data-testid="input-message"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-12 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-full"
                      disabled={isSubmitting}
                      data-testid="button-submit-application"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Application"}
                    </Button>
                  </form>
                </Form>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Do I need to buy stock first?",
                a: "No. You only pay for a product after your customer has placed an order and paid you. There is zero upfront investment.",
              },
              {
                q: "How much profit can I make?",
                a: "You set your own selling price. We provide you the wholesale price and you keep everything above it. Margins vary by product.",
              },
              {
                q: "How fast do you ship orders?",
                a: "We process and dispatch orders within 1–2 business days. Delivery across Pakistan typically takes 3–5 working days.",
              },
              {
                q: "What if my customer returns a product?",
                a: "We handle returns according to our standard policy. Our team will guide you through the return process on a case-by-case basis.",
              },
              {
                q: "Can I dropship on Facebook, Instagram, or WhatsApp?",
                a: "Yes, absolutely. Most of our dropshippers sell through Facebook Shops, Instagram pages, WhatsApp groups, and their own websites.",
              },
            ].map((faq) => (
              <div key={faq.q} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-green-700 text-white py-14">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Earning?</h2>
          <p className="text-green-100 mb-8 max-w-lg mx-auto">
            Join hundreds of dropshippers already selling PakCart products across Pakistan.
            Register today — it's completely free.
          </p>
          <a href="#register">
            <Button
              size="lg"
              className="bg-white text-green-800 hover:bg-green-50 font-bold px-10 rounded-full"
              data-testid="bottom-register-btn"
            >
              Apply Now — Free
            </Button>
          </a>
        </div>
      </section>
    </>
  );
}
