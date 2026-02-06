import { useCartStore } from "@/store/cartStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function OrderSummary() {
  const { items, getTotalPrice } = useCartStore();
  const subtotal = getTotalPrice();
  const shippingThreshold = 5000;
  const shippingCharges = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 250;
  const total = subtotal + shippingCharges;

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="text-xl">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
          {items.map((item: any) => (
            <div key={item.id} className="flex gap-3 text-sm">
              <div className="h-16 w-16 rounded-md bg-muted overflow-hidden flex-shrink-0">
                {item.images?.[0] ? (
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-accent text-accent-foreground">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-medium line-clamp-1">{item.name}</p>
                <div className="flex justify-between text-muted-foreground">
                  <span>Qty: {item.quantity}</span>
                  <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>Rs. {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            {shippingCharges === 0 ? (
              <span className="text-green-600 font-medium">FREE</span>
            ) : (
              <span>Rs. {shippingCharges.toLocaleString()}</span>
            )}
          </div>
          {shippingCharges > 0 && (
            <p className="text-[10px] text-muted-foreground text-right">
              Free shipping on orders over Rs. {shippingThreshold.toLocaleString()}
            </p>
          )}
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">Total</span>
          <span className="text-xl font-bold text-primary">
            Rs. {total.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
