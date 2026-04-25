import { useMemo } from "react";
import { useCartValidation } from "@/hooks/use-cart-validation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { AlertCircle, TrendingUp, TrendingDown, PackageX } from "lucide-react";
import { cn } from "@/lib/utils";

const SHIPPING_THRESHOLD = 10000;
const SHIPPING_COST = 250;

const issueIcon = (code: string) => {
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

const toneClass = (severity: string) => {
  switch (severity) {
    case "critical":
      return "text-destructive bg-destructive/5 border-destructive/30";
    case "warning":
      return "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900/40";
    default:
      return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/40";
  }
};

export function OrderSummary() {
  const { items, subtotal, hasBlockingIssue } = useCartValidation();

  const shippingCharges = useMemo(
    () => (subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST),
    [subtotal]
  );
  const total = useMemo(() => subtotal + shippingCharges, [subtotal, shippingCharges]);

  return (
    <Card className="sticky top-24" data-testid="card-order-summary">
      <CardHeader className="py-4">
        <CardTitle className="text-lg">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {hasBlockingIssue && (
          <Alert variant="destructive" data-testid="alert-summary-blocking">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              One or more items are unavailable. Please return to your cart to resolve them.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
          {items.map((item) => {
            const priceChanged = item.livePrice !== item.price;
            return (
              <div
                key={item.productId}
                className={cn("flex gap-2 text-xs", item.isBlocked && "opacity-60")}
                data-testid={`row-summary-${item.productId}`}
              >
                <div className="h-14 w-14 rounded bg-muted overflow-hidden flex-shrink-0">
                  {item.images?.[0] ? (
                    <img
                      src={getOptimizedImageUrl(item.images[0])}
                      alt={item.name}
                      className="h-full w-full object-cover"
                      width={56}
                      height={56}
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-accent text-accent-foreground text-[10px]">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="font-medium line-clamp-2 leading-tight">{item.name}</p>
                  {item.selectedVariant && Object.keys(item.selectedVariant).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(item.selectedVariant).map(([key, value]) => (
                        <span
                          key={key}
                          className="text-[9px] px-1 py-0 rounded-full bg-secondary text-secondary-foreground"
                        >
                          {key}: {String(value)}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground text-[11px]">
                    <span>Qty: {item.quantity}</span>
                    <span>
                      {priceChanged && (
                        <span className="line-through mr-1 opacity-70">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </span>
                      )}
                      Rs. {(item.livePrice * item.quantity).toLocaleString()}
                    </span>
                  </div>
                  {item.issues.length > 0 && (
                    <div className="space-y-0.5">
                      {item.issues.map((issue) => (
                        <div
                          key={`${issue.code}-${issue.productId}`}
                          className={cn(
                            "flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px]",
                            toneClass(issue.severity)
                          )}
                        >
                          {issueIcon(issue.code)}
                          <span className="truncate">{issue.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Subtotal</span>
            <span data-testid="text-summary-subtotal">Rs. {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Shipping</span>
            {shippingCharges === 0 ? (
              <span className="text-green-600 font-medium">FREE</span>
            ) : (
              <span>Rs. {shippingCharges.toLocaleString()}</span>
            )}
          </div>
          {shippingCharges > 0 && (
            <p className="text-[9px] text-muted-foreground text-right">
              Free over Rs. {SHIPPING_THRESHOLD.toLocaleString()}
            </p>
          )}
        </div>

        <Separator />

        <div className="flex justify-between items-center pt-1">
          <span className="text-base font-bold">Total</span>
          <span className="text-lg font-bold text-primary" data-testid="text-summary-total">
            Rs. {total.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
