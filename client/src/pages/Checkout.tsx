import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useCartValidation } from "@/hooks/use-cart-validation";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShoppingCart, Info, CreditCard, CheckCircle, Wallet, AlertCircle, MapPin, ArrowLeft, ShieldCheck, MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { sendOrderEmailNotification } from "@/lib/notifications";

const checkoutInfoSchema = z.object({
  fullName: z.string().min(2, "Poora naam zaroori hai"),
  phone: z
    .string()
    .regex(
      /^\+923\d{9}$/,
      "Sahi Pakistani mobile number darj karein, jaise +923001234567"
    ),
  address: z.string().min(10, "Mukammal pata zaroori hai"),
  area: z.string().min(2, "Qareeb ka mashhoor maqaam zaroori hai"),
  city: z.string().min(2, "Shehar ka naam zaroori hai"),
  notes: z.string().optional(),
});

type CheckoutInfo = z.infer<typeof checkoutInfoSchema>;

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
      description="Apna order aram aur mehfooz tareeqe se mukammal karein — Cash on Delivery"
      robots="noindex,follow"
    />
  );

  const form = useForm<CheckoutInfo>({
    resolver: zodResolver(checkoutInfoSchema),
    defaultValues: {
      fullName: "",
      phone: "",
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
        title: "Cart pe dhyan dein",
        description:
          "Cart ki ek ya zyada items stock mein nahi hain ya available nahi hain. Cart update karke dobara koshish karein.",
        variant: "destructive",
      });
      setLocation("/cart");
      return;
    }
    if (validation.isValidating) {
      toast({
        title: "Cart verify ho raha hai",
        description: "Thora intezar karein — hum latest qeematein aur stock confirm kar rahe hain.",
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
        title: "Order Kamyab Ho Gaya!",
        description: `Shukriya hum se shopping karne ka. Aap ka order ID hai #${result}`,
      });

      const notificationData = {
        orderId: result,
        customerName: data.fullName,
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
        title: "Masla Aaya",
        description: error.message || "Kuch ghalat ho gaya. Meherbani kar ke dobara koshish karein.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: "cart", label: "Cart", icon: ShoppingCart, href: "/cart" },
    { id: "info", label: "Maloomat", icon: Info, active: step === "info", completed: step === "payment" },
    { id: "payment", label: "Payment", icon: CreditCard, active: step === "payment" },
    { id: "confirmation", label: "Tasdeeq", icon: CheckCircle },
  ];

  if (items.length === 0) {
    return (
      <>
        {seoElement}
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4 text-emerald-900">Aap ka cart khaali hai</h1>
          <Button asChild className="bg-emerald-800 hover:bg-emerald-900">
            <Link href="/products">Shopping Shuru Karein</Link>
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
          <AlertTitle>Kuch items abhi order nahi ho saktay</AlertTitle>
          <AlertDescription className="text-xs">
            Order mukammal karne se pehle Cart mein wapas jaen aur jo items available nahi hain unhein nikal dein ya badal dein.
            <Link href="/cart" className="ml-2 underline font-medium" data-testid="link-back-to-cart">
              Cart pe wapas jaen
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {step === "info" && (
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-sm text-emerald-800 hover:text-emerald-900 hover:underline mb-4"
          data-testid="link-back-to-cart-top"
        >
          <ArrowLeft className="w-4 h-4" />
          Cart pe wapas jaen
        </Link>
      )}

      {step === "info" && (
        <Alert className="mb-6 border-emerald-200 bg-emerald-50 text-emerald-900" data-testid="alert-cod-reassurance">
          <ShieldCheck className="h-4 w-4 !text-emerald-700" />
          <AlertTitle className="text-emerald-900 font-semibold">Cash on Delivery — sirf order milne pe paisay dein</AlertTitle>
          <AlertDescription className="text-emerald-800 text-xs">
            Abhi koi payment nahi karni. Sirf neeche apni details bhar dein — 3 se 5 din mein order aap ke ghar pohonch jaye ga.
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
                        <h2 className="text-xl font-bold">Raabta Maloomat</h2>
                      </div>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-emerald-900 font-medium">
                                Poora Naam <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Misal: Ahmed Khan" 
                                  className="focus-visible:ring-emerald-800"
                                  {...field} 
                                  data-testid="input-fullname" 
                                />
                              </FormControl>
                              <FormDescription className="text-xs">
                                Yehi naam courier delivery ke waqt poochhe ga.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => {
                            const digits = (field.value || "").replace(/^\+92/, "");
                            return (
                              <FormItem>
                                <FormLabel className="text-emerald-900 font-medium">
                                  Mobile Number (Pakistan) <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground select-none">
                                      +92
                                    </span>
                                    <Input
                                      type="tel"
                                      inputMode="numeric"
                                      placeholder="3001234567"
                                      maxLength={10}
                                      className="rounded-l-none focus-visible:ring-emerald-800"
                                      value={digits}
                                      onChange={(e) => {
                                        const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 10);
                                        field.onChange(onlyDigits ? `+92${onlyDigits}` : "");
                                      }}
                                      onBlur={field.onBlur}
                                      name={field.name}
                                      ref={field.ref}
                                      data-testid="input-phone"
                                    />
                                  </div>
                                </FormControl>
                                <FormDescription className="text-xs">
                                  10 digits ka mobile number jo 3 se shuru hota hai (jaise 3001234567). Shuru mein zero (0) na lagaen.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-emerald-100 shadow-sm overflow-hidden">
                    <div className="h-1 bg-emerald-800" />
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-6 text-emerald-900">
                        <ShoppingCart className="w-5 h-5" />
                        <h2 className="text-xl font-bold">Delivery ka Pata</h2>
                      </div>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-emerald-900 font-medium">
                                Mukammal Pata <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Ghar #, Street ka naam, Sector/Block, Landmark" 
                                  className="min-h-[100px] resize-none focus-visible:ring-emerald-800"
                                  {...field} 
                                  data-testid="textarea-address"
                                />
                              </FormControl>
                              <FormDescription className="text-xs">
                                Jitni detail dein gay, delivery utni jaldi hogi. Ghar/flat ka number, street, aur sector ya block zaroor likhain.
                              </FormDescription>
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
                                  Qareeb ka Mashhoor Maqaam <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-700 pointer-events-none" />
                                    <Input
                                      placeholder="Misal: Jamia Masjid / XYZ School ke paas"
                                      className="pl-9 focus-visible:ring-emerald-800"
                                      {...field}
                                      data-testid="input-area"
                                    />
                                  </div>
                                </FormControl>
                                <FormDescription className="text-xs">
                                  Aap ke ghar ke qareeb koi mashhoor jagah — courier ko aap ka ghar dhundhne mein madad milti hai.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-emerald-900 font-medium">
                                  Shehar <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Misal: Lahore, Karachi, Islamabad"
                                    className="focus-visible:ring-emerald-800"
                                    data-testid="input-city"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription className="text-xs">
                                  Hum poore Pakistan mein har shehar tak delivery karte hain.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-emerald-900 font-medium flex items-center gap-1.5">
                                <MessageSquare className="w-4 h-4" />
                                Khaas Hidayat <span className="text-muted-foreground font-normal text-xs">(Optional)</span>
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Misal: Delivery se pehle call karein, 5 baje ke baad lain, gift wrap kar dein…"
                                  className="min-h-[70px] resize-none focus-visible:ring-emerald-800"
                                  {...field}
                                  data-testid="textarea-notes"
                                />
                              </FormControl>
                              <FormDescription className="text-xs">
                                Rider ke liye koi bhi hidayat ya delivery ke baray mein note.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
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
                      <h2 className="text-xl font-bold">Payment ka Tareeqa</h2>
                    </div>
                    
                    <RadioGroup defaultValue="cod" className="space-y-4">
                      <div className="flex items-center space-x-4 border rounded-lg p-4 cursor-pointer hover:bg-emerald-50 transition-colors border-emerald-100">
                        <RadioGroupItem value="cod" id="cod" className="text-emerald-800 border-emerald-800" />
                        <label htmlFor="cod" className="flex flex-1 items-center gap-3 cursor-pointer">
                          <Wallet className="w-6 h-6 text-emerald-800" />
                          <div>
                            <p className="font-bold text-emerald-900">Cash on Delivery (COD)</p>
                            <p className="text-sm text-muted-foreground">Apne darwazay pe order milne pe cash dein.</p>
                          </div>
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-4 border rounded-lg p-4 cursor-pointer opacity-60 bg-muted/20">
                        <RadioGroupItem value="card" id="card" disabled className="text-muted border-muted" />
                        <label htmlFor="card" className="flex flex-1 items-center gap-3 cursor-not-allowed">
                          <CreditCard className="w-6 h-6 text-muted-foreground" />
                          <div>
                            <p className="font-bold text-muted-foreground">Online Payment (Jald Aane Wala)</p>
                            <p className="text-sm text-muted-foreground">Debit/Credit Card, JazzCash, ya EasyPaisa.</p>
                          </div>
                        </label>
                      </div>
                    </RadioGroup>

                    <div className="mt-8 p-4 bg-emerald-50 rounded-lg border border-emerald-100 flex gap-3 text-emerald-800">
                      <Info className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm">
                        "Order Confirm Karein" pe click karne ka matlab hai aap hamari Terms of Service aur Privacy Policy se ittefaaq karte hain. Aap ka order 3 se 5 din mein deliver ho jaye ga.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3 pt-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {step === "payment" && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1 border-emerald-800 text-emerald-800 hover:bg-emerald-50"
                      onClick={() => setStep("info")}
                      data-testid="button-back-to-shipping"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Maloomat pe wapas jaen
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
                      ? "Process ho raha hai..."
                      : step === "info"
                        ? "Aagey Barhain — Payment"
                        : validation.hasBlockingIssue
                          ? "Pehle masail hal karein"
                          : validation.isValidating
                            ? "Cart verify ho raha hai..."
                            : "Order Confirm Karein (Cash on Delivery)"}
                  </Button>
                </div>
                <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  {step === "info"
                    ? "Order place karne se pehle aap aglay step pe ek dafa review kar sakte hain. Abhi koi payment nahi karni."
                    : "Aap ka order foran confirm ho jaye ga. Paisay tab dein jab order aap ke darwazay pe pohonche."}
                </p>
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
