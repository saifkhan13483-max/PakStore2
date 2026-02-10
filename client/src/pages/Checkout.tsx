import { useCartStore } from "@/store/cartStore";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Info, CreditCard, CheckCircle, Wallet } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutInfoSchema, type CheckoutInfo } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const PAKISTANI_CITIES = [
  "Karachi", "Lahore", "Faisalabad", "Rawalpindi", "Gujranwala", 
  "Peshawar", "Multan", "Hyderabad", "Islamabad", "Quetta",
  "Sargodha", "Sialkot", "Bahawalpur", "Sukkur", "Jhang",
  "Sheikhupura", "Larkana", "Gujrat", "Mardan", "Kasur",
  "Rahim Yar Khan", "Sahiwal", "Okara", "Wah Cantonment", "Dera Ghazi Khan"
].sort();

export default function Checkout() {
  const { items, clearCart } = useCartStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"info" | "payment">("info");

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

    setIsSubmitting(true);
    try {
      // 1. Prepare order data
      const orderData = {
        ...data,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          name: (item as any).name,
          price: (item as any).price
        })),
        total: items.reduce((sum, item) => sum + ((item as any).price * item.quantity), 0),
        status: "pending",
        createdAt: new Date().toISOString(),
        orderId: "PC" + Math.floor(Math.random() * 100000)
      };
      
      // 2. Send order to backend API instead of direct Firestore call
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Failed to place order");
      }

      console.log("Order placed:", orderData);
      
      toast({
        title: "Order Placed Successfully!",
        description: `Thank you for shopping with PakCart. Your order ID is #${orderData.orderId}`,
      });

      clearCart();
      setLocation("/thank-you");
    } catch (error) {
      console.error("Order error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
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
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4 text-emerald-900">Your cart is empty</h1>
        <Button asChild className="bg-emerald-800 hover:bg-emerald-900">
          <Link href="/products">Go to Shop</Link>
        </Button>
      </div>
    );
  }

  return (
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
                                <FormLabel className="text-emerald-900 font-medium">Area / Locality</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Neighborhood / Phase" 
                                    className="focus-visible:ring-emerald-800"
                                    {...field} 
                                    data-testid="input-area" 
                                  />
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger 
                                      className="focus:ring-emerald-800"
                                      data-testid="select-city"
                                    >
                                      <SelectValue placeholder="Select your city" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {PAKISTANI_CITIES.map((city) => (
                                      <SelectItem key={city} value={city}>{city}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
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
                  disabled={isSubmitting}
                  data-testid={step === "info" ? "button-continue-payment" : "button-complete-order"}
                >
                  {isSubmitting ? (
                    "Processing..."
                  ) : step === "info" ? (
                    "Continue to Payment"
                  ) : (
                    "Complete Order"
                  )}
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
  );
}
