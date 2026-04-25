import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { useCartStore } from "@/store/cartStore";
import { useCartValidation, type ValidatedCartItem, type CartIssue } from "@/hooks/use-cart-validation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  ShoppingBag,
  ChevronLeft,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  PackageX,
  RefreshCw,
  Loader2,
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
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { CartConversionBooster } from "@/components/ai/CartConversionBooster";
import { cn } from "@/lib/utils";

const SHIPPING_THRESHOLD = 10000;
const SHIPPING_COST = 250;

type IssueIconProps = { code: CartIssue["code"] };

const IssueIcon = ({ code }: IssueIconProps) => {
  switch (code) {
    case "price-increased":
      return <TrendingUp className="w-3 h-3" />;
    case "price-decreased":
      return <TrendingDown className="w-3 h-3" />;
    case "out-of-stock":
    case "inactive":
    case "unavailable":
      return <PackageX className="w-3 h-3" />;
    default:
      return <AlertCircle className="w-3 h-3" />;
  }
};

const issueToneClass = (severity: CartIssue["severity"]) => {
  switch (severity) {
    case "critical":
      return "text-destructive bg-destructive/5 border-destructive/30";
    case "warning":
      return "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900/40";
    default:
      return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/40";
  }
};

export default function Cart() {
  const { removeFromCart, clearCart } = useCartStore();
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const { toast } = useToast();

  const validation = useCartValidation();
  const { items: validatedItems, hasBlockingIssue, subtotal, isValidating, refresh } = validation;

  const shippingCost = subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
  const total = useMemo(() => subtotal + shippingCost, [subtotal, shippingCost]);

  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [showClearCartAlert, setShowClearCartAlert] = useState(false);

  // Surface a one-time toast when the cart has been silently corrected.
  const aggregateBanner = useMemo(() => {
    const counts = validatedItems.reduce(
      (acc, v) => {
        for (const issue of v.issues) {
          if (issue.code === "price-increased" || issue.code === "price-decreased") acc.priceChanges++;
          if (issue.code === "out-of-stock" || issue.code === "inactive" || issue.code === "unavailable") acc.unavailable++;
          if (issue.code === "low-stock" && issue.severity === "warning") acc.clamped++;
        }
        return acc;
      },
      { priceChanges: 0, unavailable: 0, clamped: 0 }
    );
    return counts;
  }, [validatedItems]);

  useEffect(() => {
    if (aggregateBanner.priceChanges > 0 || aggregateBanner.clamped > 0) {
      toast({
        title: "Cart updated",
        description: "We refreshed prices and quantities to match current availability.",
      });
    }
    // We intentionally only fire when the counts transition from 0.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aggregateBanner.priceChanges > 0, aggregateBanner.clamped > 0]);

  const handleUpdateQuantity = (
    productId: string,
    nextQuantity: number,
    liveStock: number | null
  ) => {
    if (nextQuantity < 1) return;
    const cap = liveStock ?? Number.POSITIVE_INFINITY;
    if (nextQuantity > cap) {
      toast({
        title: "Stock limit reached",
        description: `Only ${liveStock} item${liveStock === 1 ? "" : "s"} available in stock.`,
        variant: "destructive",
      });
      return;
    }
    updateQuantity(productId, nextQuantity);
  };

  const confirmRemove = () => {
    if (itemToRemove !== null) {
      removeFromCart(itemToRemove);
      setItemToRemove(null);
      toast({
        title: "Item removed",
        description: "The item has been removed from your cart.",
      });
    }
  };

  const confirmClearCart = () => {
    clearCart();
    setShowClearCartAlert(false);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    });
  };

  if (validatedItems.length === 0) {
    return (
      <>
        <SEO
          title="Shopping Cart"
          description="Review and manage your shopping cart"
          robots="noindex,follow"
        />
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
      </>
    );
  }

  return (
    <>
      <SEO
        title="Shopping Cart"
        description="Review and manage your shopping cart"
        robots="noindex,follow"
      />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            Shopping Cart
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary no-default-hover-elevate text-xs"
              onClick={() => {
                void refresh();
              }}
              disabled={isValidating}
              data-testid="button-refresh-cart"
            >
              {isValidating ? (
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
              )}
              Refresh prices
            </Button>
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
        </div>

        {(aggregateBanner.priceChanges > 0 || aggregateBanner.unavailable > 0 || aggregateBanner.clamped > 0) && (
          <Alert
            variant={aggregateBanner.unavailable > 0 ? "destructive" : "default"}
            className="mb-4"
            data-testid="alert-cart-validation"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {aggregateBanner.unavailable > 0
                ? "Some items in your cart need attention"
                : "We refreshed your cart"}
            </AlertTitle>
            <AlertDescription className="text-xs">
              {[
                aggregateBanner.priceChanges > 0 &&
                  `${aggregateBanner.priceChanges} price update${aggregateBanner.priceChanges === 1 ? "" : "s"}`,
                aggregateBanner.clamped > 0 &&
                  `${aggregateBanner.clamped} quantity adjustment${aggregateBanner.clamped === 1 ? "" : "s"}`,
                aggregateBanner.unavailable > 0 &&
                  `${aggregateBanner.unavailable} unavailable item${aggregateBanner.unavailable === 1 ? "" : "s"}`,
              ]
                .filter(Boolean)
                .join(" • ")}
              . Totals shown reflect the latest prices from our store.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence mode="popLayout">
              {validatedItems.map((item) => (
                <CartLineItem
                  key={item.productId}
                  item={item}
                  onRemove={() => setItemToRemove(item.productId)}
                  onUpdateQuantity={handleUpdateQuantity}
                />
              ))}
            </AnimatePresence>

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="mt-2 no-default-hover-elevate text-xs"
              data-testid="link-continue-shopping"
            >
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
                    <span data-testid="text-subtotal">Rs. {subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                    <span>Shipping</span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600 font-medium italic" data-testid="text-shipping-free">
                        Free
                      </span>
                    ) : (
                      <span data-testid="text-shipping-cost">
                        Rs. {shippingCost.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {shippingCost > 0 && (
                    <div className="bg-primary/5 p-2 rounded text-[10px] text-primary/80">
                      Add Rs. {(SHIPPING_THRESHOLD - subtotal).toLocaleString()} more for free shipping!
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between text-base sm:text-lg font-bold pt-1">
                    <span>Total</span>
                    <span className="text-primary" data-testid="text-total">
                      Rs. {total.toLocaleString()}
                    </span>
                  </div>

                  <CartConversionBooster
                    items={validatedItems
                      .filter((i) => !i.isBlocked)
                      .map((i) => ({
                        name: i.name,
                        price: i.livePrice,
                        quantity: i.quantity,
                      }))}
                    total={total}
                  />

                  <div className="pt-4 space-y-2">
                    <Button
                      asChild={!hasBlockingIssue}
                      size="default"
                      className="w-full gap-2 text-sm h-10"
                      disabled={hasBlockingIssue}
                      data-testid="button-checkout"
                    >
                      {hasBlockingIssue ? (
                        <span>
                          Resolve issues to continue
                          <ArrowRight className="w-3.5 h-3.5 ml-2 inline" />
                        </span>
                      ) : (
                        <Link href="/checkout">
                          Proceed to Checkout
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
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
        <AlertDialog
          open={itemToRemove !== null}
          onOpenChange={(open) => !open && setItemToRemove(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove from cart?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove this item from your shopping cart?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmRemove}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
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
              <AlertDialogAction
                onClick={confirmClearCart}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Clear Cart
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}

interface CartLineItemProps {
  item: ValidatedCartItem;
  onRemove: () => void;
  onUpdateQuantity: (productId: string, nextQuantity: number, liveStock: number | null) => void;
}

function CartLineItem({ item, onRemove, onUpdateQuantity }: CartLineItemProps) {
  const priceChanged = item.livePrice !== item.price;
  const lineTotal = item.livePrice * item.quantity;
  const stockCap = item.liveStock ?? Number.POSITIVE_INFINITY;
  const atStockCap = item.liveStock !== null && item.quantity >= item.liveStock;

  return (
    <motion.div
      key={item.productId}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "overflow-hidden border-muted/40 hover:border-primary/20 transition-colors",
          item.isBlocked && "border-destructive/40 bg-destructive/5"
        )}
        data-testid={`card-cart-item-${item.productId}`}
      >
        <CardContent className="p-3 sm:p-4">
          <div className="flex gap-3 sm:gap-4">
            <div
              className={cn(
                "w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden flex-shrink-0 bg-muted",
                item.isBlocked && "opacity-60"
              )}
            >
              <img
                src={getOptimizedImageUrl(item.images?.[0] ?? "https://placehold.co/200x200?text=No+Image")}
                alt={item.name}
                className="w-full h-full object-cover"
                width={80}
                height={80}
                loading="lazy"
              />
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div className="flex justify-between gap-2">
                <div>
                  <Link href={`/products/${item.slug}`}>
                    <h3 className="font-semibold text-sm sm:text-base hover:text-primary transition-colors cursor-pointer line-clamp-2">
                      {item.name}
                    </h3>
                  </Link>
                  {item.category && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{item.category}</p>
                  )}
                </div>
                <div className="text-right whitespace-nowrap">
                  <p
                    className="font-bold text-sm sm:text-base"
                    data-testid={`text-line-price-${item.productId}`}
                  >
                    Rs. {item.livePrice.toLocaleString()}
                  </p>
                  {priceChanged && (
                    <p className="text-[10px] text-muted-foreground line-through">
                      Rs. {item.price.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center border rounded h-7 px-1 bg-background">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 no-default-hover-elevate"
                      onClick={() => onUpdateQuantity(item.productId, item.quantity - 1, item.liveStock)}
                      disabled={item.quantity <= 1 || item.isBlocked}
                      data-testid={`button-decrease-qty-${item.productId}`}
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </Button>
                    <span
                      className="w-8 text-center font-medium text-xs"
                      data-testid={`text-qty-${item.productId}`}
                    >
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 no-default-hover-elevate"
                      onClick={() => onUpdateQuantity(item.productId, item.quantity + 1, item.liveStock)}
                      disabled={item.isBlocked || item.quantity >= stockCap}
                      data-testid={`button-increase-qty-${item.productId}`}
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </Button>
                  </div>
                  {atStockCap && !item.isBlocked && (
                    <p className="text-[9px] text-amber-700 dark:text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-2.5 h-2.5" />
                      Max stock
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <p
                    className="text-xs text-muted-foreground hidden sm:block"
                    data-testid={`text-line-total-${item.productId}`}
                  >
                    Rs. {lineTotal.toLocaleString()}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive no-default-hover-elevate"
                    onClick={onRemove}
                    data-testid={`button-remove-item-${item.productId}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {item.issues.length > 0 && (
                <div className="mt-2 space-y-1">
                  {item.issues.map((issue) => (
                    <div
                      key={`${issue.code}-${issue.productId}`}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] sm:text-[11px]",
                        issueToneClass(issue.severity)
                      )}
                      data-testid={`alert-${issue.code}-${item.productId}`}
                    >
                      <IssueIcon code={issue.code} />
                      <span>{issue.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
