import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  ArrowRight, 
  ShoppingBag,
  ChevronLeft
} from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCartStore();
  const totalPrice = getTotalPrice();
  const shippingThreshold = 5000;
  const shippingCost = totalPrice >= shippingThreshold ? 0 : 500;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="flex flex-col items-center justify-center space-y-6 max-w-md mx-auto">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold">Your cart is empty</h1>
          <p className="text-muted-foreground">
            Looks like you haven't added anything to your cart yet. Explore our collection of authentic Pakistani artisanal products.
          </p>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-primary" />
          Shopping Cart
        </h1>
        <Button variant="ghost" className="text-muted-foreground hover:text-destructive no-default-hover-elevate" onClick={clearCart}>
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.productId}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="overflow-hidden border-muted/40 hover:border-primary/20 transition-colors">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex gap-4 sm:gap-6">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                        <img
                          src={(item as any).images?.[0] || "https://placehold.co/200x200?text=No+Image"}
                          alt={(item as any).name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between gap-2">
                          <div>
                            <Link href={`/products/${(item as any).slug}`}>
                              <h3 className="font-semibold text-lg hover:text-primary transition-colors cursor-pointer">
                                {(item as any).name}
                              </h3>
                            </Link>
                            <p className="text-sm text-muted-foreground">{(item as any).category}</p>
                          </div>
                          <p className="font-bold text-lg whitespace-nowrap">
                            Rs. {(item as any).price.toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center border rounded-md h-9 px-1 bg-background">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 no-default-hover-elevate"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 no-default-hover-elevate"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive no-default-hover-elevate"
                            onClick={() => removeFromCart(item.productId)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          <Button variant="ghost" asChild className="mt-4 no-default-hover-elevate">
            <Link href="/products">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-muted/40 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>Rs. {totalPrice.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  {shippingCost === 0 ? (
                    <span className="text-green-600 font-medium italic">Free</span>
                  ) : (
                    <span>Rs. {shippingCost.toLocaleString()}</span>
                  )}
                </div>

                {shippingCost > 0 && (
                  <div className="bg-primary/5 p-3 rounded-md text-xs text-primary/80">
                    Add Rs. {(shippingThreshold - totalPrice).toLocaleString()} more for free shipping!
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between text-xl font-bold pt-2">
                  <span>Total</span>
                  <span className="text-primary">Rs. {(totalPrice + shippingCost).toLocaleString()}</span>
                </div>

                <div className="pt-6 space-y-3">
                  <Button asChild size="lg" className="w-full gap-2">
                    <Link href="/checkout">
                      Proceed to Checkout
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <p className="text-[10px] text-center text-muted-foreground">
                    Taxes calculated at checkout. Shipping available across Pakistan.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
