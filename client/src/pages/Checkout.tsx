import { useCartStore } from "@/store/cartStore";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, ShoppingCart, Info, CreditCard, CheckCircle } from "lucide-react";

export default function Checkout() {
  const { items, getTotalPrice } = useCartStore();
  const [location] = useLocation();
  const totalPrice = getTotalPrice();
  const shippingThreshold = 5000;
  const shippingCost = totalPrice >= shippingThreshold ? 0 : 500;

  const steps = [
    { id: "cart", label: "Cart", icon: ShoppingCart, href: "/cart" },
    { id: "info", label: "Information", icon: Info, active: true },
    { id: "payment", label: "Payment", icon: CreditCard },
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
        {/* Left Column: Forms (Placeholder for now) */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Contact Information</h2>
              <div className="h-48 flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/30">
                <p className="text-muted-foreground italic">Form sections (Contact, Shipping) will be implemented in subsequent parts.</p>
              </div>
            </CardContent>
          </Card>
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
