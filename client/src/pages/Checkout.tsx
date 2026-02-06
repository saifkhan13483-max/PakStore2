import { useCartStore } from "@/store/cartStore";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Info, CreditCard, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutInfoSchema, type CheckoutInfo } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PAKISTANI_CITIES = [
  "Karachi", "Lahore", "Faisalabad", "Rawalpindi", "Gujranwala", 
  "Peshawar", "Multan", "Hyderabad", "Islamabad", "Quetta",
  "Sargodha", "Sialkot", "Bahawalpur", "Sukkur", "Jhang",
  "Sheikhupura", "Larkana", "Gujrat", "Mardan", "Kasur",
  "Rahim Yar Khan", "Sahiwal", "Okara", "Wah Cantonment", "Dera Ghazi Khan"
].sort();

export default function Checkout() {
  const { items, getTotalPrice } = useCartStore();
  const [location] = useLocation();
  const totalPrice = getTotalPrice();
  const shippingThreshold = 5000;
  const shippingCost = totalPrice >= shippingThreshold ? 0 : 500;

  const form = useForm<CheckoutInfo>({
    resolver: zodResolver(checkoutInfoSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "+92",
      address: "",
      area: "",
      city: "",
    },
  });

  const onSubmit = (data: CheckoutInfo) => {
    console.log("Checkout info submitted:", data);
  };

  const steps = [
    { id: "cart", label: "Cart", icon: ShoppingCart, href: "/cart" },
    { id: "info", label: "Information", icon: Info, active: true },
    { id: "payment", icon: CreditCard, label: "Payment" },
    { id: "confirmation", label: "Confirmation", icon: CheckCircle },
  ];

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Button asChild>
          <Link href="/products">Go to Shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Progress Indicator */}
      <div className="mb-12">
        <div className="flex items-center justify-center max-w-3xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center relative group">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    step.active 
                      ? "bg-primary border-primary text-primary-foreground" 
                      : step.href 
                        ? "bg-background border-primary text-primary cursor-pointer"
                        : "bg-background border-muted text-muted-foreground"
                  }`}
                  data-testid={`checkout-step-${step.id}`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <span 
                  className={`absolute -bottom-7 text-xs font-medium whitespace-nowrap ${
                    step.active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-[2px] mx-4 bg-muted">
                  <div className={`h-full bg-primary transition-all duration-500 ${step.href ? "w-full" : "w-0"}`} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
        {/* Left Column: Forms */}
        <div className="lg:col-span-3 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Contact Information</h2>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} data-testid="input-fullname" />
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
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter your email" {...field} data-testid="input-email" />
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
                            <FormLabel>Mobile Number (Pakistan)</FormLabel>
                            <FormControl>
                              <Input placeholder="+92XXXXXXXXXX" {...field} data-testid="input-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complete Street Address</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="House #, Street Name, Sector/Block, Landmark" 
                              className="min-h-[100px] resize-none"
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
                            <FormLabel>Area / Locality</FormLabel>
                            <FormControl>
                              <Input placeholder="Neighborhood / Phase" {...field} data-testid="input-area" />
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
                            <FormLabel>City</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-city">
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

              <div className="pt-4">
                <Button type="submit" className="w-full" data-testid="button-continue-payment">
                  Continue to Payment
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Right Column: Order Summary (Placeholder for now) */}
        <div className="lg:col-span-2">
          <Card className="sticky top-24 border-muted/40 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/30 mb-4">
                <p className="text-muted-foreground italic text-center px-4">Order Summary component will be implemented in Part 21.</p>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <div className="flex justify-between font-bold text-xl">
                  <span>Total</span>
                  <span className="text-primary">Rs. {(totalPrice + shippingCost).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
