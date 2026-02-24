import { getOptimizedImageUrl } from "@/lib/cloudinary";
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
  ChevronLeft,
  AlertCircle
} from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCartStore();
  const { toast } = useToast();
  const totalPrice = getTotalPrice();
  const shippingThreshold = 5000;
  const shippingCost = totalPrice >= shippingThreshold ? 0 : 500;
  
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [showClearCartAlert, setShowClearCartAlert] = useState(false);

  const handleUpdateQuantity = (productId: string | number, newQuantity: number, maxStock: number = 10) => {
    if (newQuantity > maxStock) {
      toast({
        title: "Stock Limit Reached",
        description: `Only ${maxStock} items available in stock.`,
        variant: "destructive",
      });
      return;
    }
    updateQuantity(productId as any, newQuantity);
  };

  const confirmRemove = () => {
    if (itemToRemove !== null) {
      removeFromCart(itemToRemove as any);
      setItemToRemove(null);
      toast({
        title: "Item Removed",
        description: "The item has been removed from your cart.",
      });
    }
  };

  const confirmClearCart = () => {
    clearCart();
    setShowClearCartAlert(false);
    toast({
      title: "Cart Cleared",
      description: "All items have been removed from your cart.",
    });
  };

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
          <Button asChild size="lg" className="w-full sm:w-auto" data-testid="button-start-shopping">
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-primary" />
          Shopping Cart
        </h1>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-muted-foreground hover:text-destructive no-default-hover-elevate text-xs" 
          onClick={() => setShowClearCartAlert(true)}
          data-testid="button-clear-cart"
        >
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
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
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex gap-3 sm:gap-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                        <img
                          src={getOptimizedImageUrl((item as any).images?.[0] || "https://placehold.co/200x200?text=No+Image")}
                          alt={(item as any).name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between gap-2">
                          <div>
                            <Link href={`/products/${(item as any).slug}`}>
                              <h3 className="font-semibold text-sm sm:text-base hover:text-primary transition-colors cursor-pointer line-clamp-2">
                                {(item as any).name}
                              </h3>
                            </Link>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">{(item as any).category}</p>
                          </div>
                          <p className="font-bold text-sm sm:text-base whitespace-nowrap">
                            Rs. {(item as any).price.toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center border rounded h-7 px-1 bg-background">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 no-default-hover-elevate"
                                onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                data-testid={`button-decrease-qty-${item.productId}`}
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </Button>
                              <span className="w-8 text-center font-medium text-xs" data-testid={`text-qty-${item.productId}`}>{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 no-default-hover-elevate"
                                onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                                data-testid={`button-increase-qty-${item.productId}`}
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </Button>
                            </div>
                            {item.quantity >= 10 && (
                              <p className="text-[9px] text-destructive flex items-center gap-1">
                                <AlertCircle className="w-2.5 h-2.5" />
                                Max stock
                              </p>
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive no-default-hover-elevate"
                            onClick={() => setItemToRemove(item.productId)}
                            data-testid={`button-remove-item-${item.productId}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          <Button variant="ghost" size="sm" asChild className="mt-2 no-default-hover-elevate text-xs" data-testid="link-continue-shopping">
            <Link href="/products">
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Continue Shopping
            </Link>
          </Button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-muted/40 shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span data-testid="text-subtotal">Rs. {totalPrice.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                  <span>Shipping</span>
                  {shippingCost === 0 ? (
                    <span className="text-green-600 font-medium italic" data-testid="text-shipping-free">Free</span>
                  ) : (
                    <span data-testid="text-shipping-cost">Rs. {shippingCost.toLocaleString()}</span>
                  )}
                </div>

                {shippingCost > 0 && (
                  <div className="bg-primary/5 p-2 rounded text-[10px] text-primary/80">
                    Add Rs. {(shippingThreshold - totalPrice).toLocaleString()} more for free shipping!
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between text-base sm:text-lg font-bold pt-1">
                  <span>Total</span>
                  <span className="text-primary" data-testid="text-total">Rs. {(totalPrice + shippingCost).toLocaleString()}</span>
                </div>

                <div className="pt-4 space-y-2">
                  <Button asChild size="default" className="w-full gap-2 text-sm h-10" data-testid="button-checkout">
                    <Link href="/checkout">
                      Proceed to Checkout
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                  <p className="text-[9px] text-center text-muted-foreground">
                    Taxes calculated at checkout. Shipping available across Pakistan.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <AlertDialog open={itemToRemove !== null} onOpenChange={(open) => !open && setItemToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from cart?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this item from your shopping cart?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showClearCartAlert} onOpenChange={setShowClearCartAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear your cart?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all items from your shopping cart. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClearCart} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Clear Cart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
