import { useCartStore } from "@/store/cartStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getOptimizedImageUrl } from "@/lib/cloudinary";

export function OrderSummary() {
  const { items, getTotalPrice } = useCartStore();
  const subtotal = getTotalPrice();
  const shippingThreshold = 5000;
  const shippingCharges = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 250;
  const total = subtotal + shippingCharges;

  return (
    <Card className="sticky top-4">
      <CardHeader className="py-4">
        <CardTitle className="text-lg">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
          {items.map((item: any) => (
            <div key={item.id} className="flex gap-2 text-xs">
              <div className="h-14 w-14 rounded bg-muted overflow-hidden flex-shrink-0">
                {item.images?.[0] ? (
                  <img
                    src={getOptimizedImageUrl(item.images[0])}
                    alt={item.name}
                    className="h-full w-full object-cover"
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
                    {Object.entries(item.selectedVariant).map(([key, value]: [string, any]) => (
                      <span key={key} className="text-[9px] px-1 py-0 rounded-full bg-secondary text-secondary-foreground">
                        {key}: {String(value)}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground text-[11px]">
                  <span>Qty: {item.quantity}</span>
                  <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Subtotal</span>
            <span>Rs. {subtotal.toLocaleString()}</span>
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
              Free over Rs. {shippingThreshold.toLocaleString()}
            </p>
          )}
        </div>

        <Separator />

        <div className="flex justify-between items-center pt-1">
          <span className="text-base font-bold">Total</span>
          <span className="text-lg font-bold text-primary">
            Rs. {total.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
