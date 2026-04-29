import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useCartValidation } from "@/hooks/use-cart-validation";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShoppingCart, Info, CreditCard, CheckCircle, Wallet, AlertCircle, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { sendOrderEmailNotification } from "@/lib/notifications";

const checkoutInfoSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(10, "Full address is required"),
  area: z.string().min(2, "Area is required"),
  city: z.string().min(1, "City is required"),
  notes: z.string().optional(),
});

type CheckoutInfo = z.infer<typeof checkoutInfoSchema>;

const PAKISTANI_CITIES = [
  // Punjab
  "Lahore", "Faisalabad", "Rawalpindi", "Gujranwala", "Multan",
  "Sialkot", "Bahawalpur", "Sargodha", "Sheikhupura", "Jhang",
  "Rahim Yar Khan", "Gujrat", "Kasur", "Okara", "Sahiwal",
  "Wazirabad", "Mandi Bahauddin", "Narowal", "Pakpattan", "Mianwali",
  "Bahawalnagar", "Toba Tek Singh", "Khanewal", "Muzaffargarh", "Vehari",
  "Lodhran", "Layyah", "Dera Ghazi Khan", "Bhakkar", "Hafizabad",
  "Attock", "Chakwal", "Jhelum", "Khushab", "Chiniot",
  "Nankana Sahib", "Rajanpur", "Wah Cantonment",
  // Sindh
  "Karachi", "Hyderabad", "Sukkur", "Larkana", "Mirpur Khas",
  "Nawabshah", "Jacobabad", "Shikarpur", "Khairpur", "Dadu",
  "Thatta", "Badin", "Tando Adam", "Tando Allahyar", "Umerkot",
  "Kashmore", "Kandhkot", "Sanghar", "Matiari", "Jamshoro",
  "Ghotki", "Qambar Shahdadkot",
  // Khyber Pakhtunkhwa
  "Peshawar", "Mardan", "Mingora", "Abbottabad", "Mansehra",
  "Kohat", "Nowshera", "Charsadda", "Dera Ismail Khan", "Bannu",
  "Haripur", "Swabi", "Hangu", "Karak", "Lakki Marwat",
  "Tank", "Chitral", "Malakand", "Timergara", "Saidu Sharif",
  "Batkhela", "Buner",
  // Balochistan
  "Quetta", "Turbat", "Khuzdar", "Chaman", "Gwadar",
  "Hub", "Sibi", "Zhob", "Loralai", "Dalbandin",
  "Dera Allah Yar", "Kharan", "Mastung", "Kalat", "Panjgur",
  "Nushki", "Bela", "Dera Murad Jamali",
  // Islamabad Capital Territory
  "Islamabad",
  // Azad Kashmir
  "Muzaffarabad", "Mirpur", "Rawalakot", "Bagh", "Kotli",
  "Pallandri", "Bhimber",
  // Gilgit-Baltistan
  "Gilgit", "Skardu", "Hunza", "Chilas", "Ghanche",
  "Other",
].sort();

export default function Checkout() {
  const { clearCart } = useCartStore();
  const items = useCartStore((s) => s.items);
  const validation = useCartValidation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"info" | "payment">("info");
  
  // SEO for checkout page
  const seoElement = (
    <SEO 
      title="Checkout" 
      description="Complete your purchase securely"
      robots="noindex,follow"
    />
  );

  const form = useForm<CheckoutInfo>({
    resolver: zodResolver(checkoutInfoSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "+92",
      address: "",
      area: "",
      city: "",
      notes: "",
    },
  });

  const onSubmit = async (data: CheckoutInfo) => {
    if (step === "info") {
      setStep("payment");
      window.scrollTo(0, 0);
      return;
    }

    // Refuse to place an order if any item is unpurchasable. The validation
    // hook has already triggered a reconcile against Firestore, so this is the
    // last line of defence before we write to the orders collection.
    if (validation.hasBlockingIssue) {
      toast({
        title: "Cart needs your attention",
        description:
          "One or more items are out of stock or no longer available. Please update your cart and try again.",
        variant: "destructive",
      });
      setLocation("/cart");
      return;
    }
    if (validation.isValidating) {
      toast({
        title: "Verifying your cart",
        description: "Please wait a moment while we confirm the latest prices and stock.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const user = useAuthStore.getState().user;

      // Always source pricing from the validated (live) snapshot, never from
      // the persisted localStorage values, to prevent stale-price checkout.
      const purchasable = validation.items.filter((item) => !item.isBlocked);
      if (purchasable.length === 0) {
        throw new Error("Your cart is empty after removing unavailable items.");
      }

      const subtotal = purchasable.reduce(
        (sum, item) => sum + item.livePrice * item.quantity,
        0
      );
      const shipping = subtotal > 10000 ? 0 : 250;
      const total = subtotal + shipping;

      const orderData = {
        userId: user?.uid || "guest",
        items: purchasable.map((item) => ({
          id: String(item.id ?? Math.random().toString(36).substring(7)),
          productId: String(item.productId),
          quantity: Math.max(1, Math.floor(item.quantity)),
          selectedVariant: item.selectedVariant ?? {},
          product: {
            name: item.name,
            price: item.livePrice,
            profit: item.profit,
            images: Array.isArray(item.images) ? item.images : [],
            slug: item.slug,
          },
        })),
        total,
        status: "pending" as const,
        createdAt: new Date(),
        customerInfo: {
          fullName: String(data.fullName),
          email: String(data.email),
          mobileNumber: String(data.phone),
        },
        shippingAddress: {
          street: String(data.address),
          area: String(data.area),
          city: String(data.city),
        },
      };

      const { addDocument } = await import("@/lib/firestore");
      const { insertOrderSchema } = await import("@shared/schema");
      const result = await addDocument("orders", orderData, insertOrderSchema);

      toast({
        title: "Order Placed Successfully!",
        description: `Thank you for shopping with us. Your order ID is #${result}`,
      });

      const notificationData = {
        orderId: result,
        customerName: data.fullName,
        customerEmail: data.email,
        customerPhone: data.phone,
        customerAddress: `${data.address}, ${data.area}`,
        customerCity: data.city,
        items: purchasable.map((item) => ({
          name: item.name,
          quantity: Math.max(1, Math.floor(item.quantity)),
          price: item.livePrice,
        })),
        total,
        subtotal,
        shipping,
        notes: data.notes,
      };

      sendOrderEmailNotification(notificationData).catch((err) => {
        console.error("Email notification failed:", err);
      });

      clearCart();
      setLocation("/thank-you");
    } catch (error: any) {
      console.error("Order error:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: "cart", label: "Cart", icon: ShoppingCart, href: "/cart" },
    { id: "info", label: "Information", icon: Info, active: step === "info", completed: step === "payment" },
    { id: "payment", label: "Payment", icon: CreditCard, active: step === "payment" },
    { id: "confirmation", label: "Confirmation", icon: CheckCircle },
  ];

  if (items.length === 0) {
    return (
      <>
        {seoElement}
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4 text-emerald-900">Your cart is empty</h1>
          <Button asChild className="bg-emerald-800 hover:bg-emerald-900">
            <Link href="/products">Go to Shop</Link>
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      {seoElement}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Progress Indicator */}
      <div className="mb-12">
        <div className="flex items-center justify-center max-w-3xl mx-auto">
          {steps.map((s, index) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center relative group">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    s.active 
                      ? "bg-emerald-800 border-emerald-800 text-white scale-110 shadow-lg" 
                      : s.completed || s.href
                        ? "bg-emerald-100 border-emerald-800 text-emerald-800 cursor-pointer"
                        : "bg-background border-muted text-muted-foreground"
                  }`}
                  onClick={() => s.href && setLocation(s.href)}
                  data-testid={`checkout-step-${s.id}`}
                >
                  {s.completed ? <CheckCircle className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                <span 
                  className={`absolute -bottom-7 text-xs font-semibold whitespace-nowrap ${
                    s.active ? "text-emerald-900" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-[2px] mx-4 bg-muted overflow-hidden">
                  <div 
                    className={`h-full bg-emerald-800 transition-all duration-500 ${
                      s.completed || s.href ? "w-full" : "w-0"
                    }`} 
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {validation.hasBlockingIssue && (
        <Alert variant="destructive" className="mb-6" data-testid="alert-checkout-blocking">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Some items can't be ordered right now</AlertTitle>
          <AlertDescription className="text-xs">
            Please return to your cart to remove or replace unavailable items before completing your order.
            <Link href="/cart" className="ml-2 underline font-medium" data-testid="link-back-to-cart">
              Back to cart
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Left Column: Forms */}
        <div className="lg:col-span-8 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {step === "info" ? (
                <>
                  <Card className="border-emerald-100 shadow-sm overflow-hidden">
                    <div className="h-1 bg-emerald-800" />
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-6 text-emerald-900">
                        <Info className="w-5 h-5" />
                        <h2 className="text-xl font-bold">Contact Information</h2>
                      </div>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-emerald-900 font-medium">Full Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter your full name" 
                                  className="focus-visible:ring-emerald-800"
                                  {...field} 
                                  data-testid="input-fullname" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-emerald-900 font-medium">Email Address</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="email" 
                                    placeholder="Enter your email" 
                                    className="focus-visible:ring-emerald-800"
                                    {...field} 
                                    data-testid="input-email" 
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
                                <FormLabel className="text-emerald-900 font-medium">Mobile Number (Pakistan)</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="+92XXXXXXXXXX" 
                                    className="focus-visible:ring-emerald-800"
                                    {...field} 
                                    data-testid="input-phone" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-emerald-100 shadow-sm overflow-hidden">
                    <div className="h-1 bg-emerald-800" />
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-6 text-emerald-900">
                        <ShoppingCart className="w-5 h-5" />
                        <h2 className="text-xl font-bold">Shipping Address</h2>
                      </div>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-emerald-900 font-medium">Complete Street Address</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="House #, Street Name, Sector/Block, Landmark" 
                                  className="min-h-[100px] resize-none focus-visible:ring-emerald-800"
                                  {...field} 
                                  data-testid="textarea-address"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="area"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-emerald-900 font-medium">
                                  Nearest famous place <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-700 pointer-events-none" />
                                    <Input
                                      placeholder="Famous place/masjid/school"
                                      className="pl-9 focus-visible:ring-emerald-800"
                                      {...field}
                                      data-testid="input-area"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-emerald-900 font-medium">City</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter your city"
                                    className="focus-visible:ring-emerald-800"
                                    data-testid="input-city"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="border-emerald-100 shadow-sm overflow-hidden">
                  <div className="h-1 bg-emerald-800" />
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-6 text-emerald-900">
                      <CreditCard className="w-5 h-5" />
                      <h2 className="text-xl font-bold">Payment Method</h2>
                    </div>
                    
                    <RadioGroup defaultValue="cod" className="space-y-4">
                      <div className="flex items-center space-x-4 border rounded-lg p-4 cursor-pointer hover:bg-emerald-50 transition-colors border-emerald-100">
                        <RadioGroupItem value="cod" id="cod" className="text-emerald-800 border-emerald-800" />
                        <label htmlFor="cod" className="flex flex-1 items-center gap-3 cursor-pointer">
                          <Wallet className="w-6 h-6 text-emerald-800" />
                          <div>
                            <p className="font-bold text-emerald-900">Cash on Delivery (COD)</p>
                            <p className="text-sm text-muted-foreground">Pay with cash upon delivery to your doorstep.</p>
                          </div>
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-4 border rounded-lg p-4 cursor-pointer opacity-60 bg-muted/20">
                        <RadioGroupItem value="card" id="card" disabled className="text-muted border-muted" />
                        <label htmlFor="card" className="flex flex-1 items-center gap-3 cursor-not-allowed">
                          <CreditCard className="w-6 h-6 text-muted-foreground" />
                          <div>
                            <p className="font-bold text-muted-foreground">Online Payment (Coming Soon)</p>
                            <p className="text-sm text-muted-foreground">Debit/Credit Card, JazzCash, or EasyPaisa.</p>
                          </div>
                        </label>
                      </div>
                    </RadioGroup>

                    <div className="mt-8 p-4 bg-emerald-50 rounded-lg border border-emerald-100 flex gap-3 text-emerald-800">
                      <Info className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm">
                        By clicking "Complete Order", you agree to our Terms of Service and Privacy Policy. Your order will be processed and delivered within 3-5 business days.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {step === "payment" && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 border-emerald-800 text-emerald-800 hover:bg-emerald-50"
                    onClick={() => setStep("info")}
                  >
                    Back to Shipping
                  </Button>
                )}
                <Button
                  type="submit"
                  className={`flex-[2] bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-6 ${
                    isSubmitting ? "opacity-80" : ""
                  }`}
                  disabled={
                    isSubmitting ||
                    (step === "payment" && (validation.hasBlockingIssue || validation.isValidating))
                  }
                  data-testid={step === "info" ? "button-continue-payment" : "button-complete-order"}
                >
                  {isSubmitting
                    ? "Processing..."
                    : step === "info"
                      ? "Continue to Payment"
                      : validation.hasBlockingIssue
                        ? "Resolve issues to continue"
                        : validation.isValidating
                          ? "Verifying cart..."
                          : "Complete Order"}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4">
          <OrderSummary />
        </div>
      </div>
    </div>
    </>
  );
}
