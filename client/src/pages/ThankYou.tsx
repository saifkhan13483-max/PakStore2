import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Helmet } from "react-helmet-async";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useState } from "react";

export default function ThankYou() {
  const clearCart = useCartStore((state) => state.clearCart);
  const [orderNumber] = useState(() => Math.floor(100000 + Math.random() * 900000));

  useEffect(() => {
    // Clear the cart when the thank you page is reached
    clearCart();
  }, [clearCart]);

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <Helmet>
        <title>Order Confirmed - Thank You | PakCart</title>
        <meta name="description" content="Thank you for your order! Your request has been received and is being processed." />
      </Helmet>

      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex justify-center">
          <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
            <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-4">Shukriya! Order Confirmed</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Thank you for shopping with PakCart. Your order has been successfully placed and is being processed for delivery.
        </p>

        <Card className="mb-8 border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row justify-around gap-6 text-left">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Order Number</p>
                <p className="text-lg font-mono font-bold">#NB-{orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Payment Method</p>
                <p className="text-lg font-semibold">Cash on Delivery</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Estimated Delivery</p>
                <p className="text-lg font-semibold">3-5 Business Days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-accent/50 rounded-lg p-6 mb-8 text-left">
          <h2 className="text-lg font-semibold mb-3">What's Next?</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="mt-1 bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0">1</div>
              <p>You will receive an order confirmation SMS/Email shortly.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0">2</div>
              <p>Our team will verify your address and prepare your items for shipping.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0">3</div>
              <p>When your order ships, we'll send you a tracking number to follow your package.</p>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/products">
              <ShoppingBag className="w-4 h-4" />
              Continue Shopping
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/">
              Go to Homepage
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
