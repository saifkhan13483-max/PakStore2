import { useRealtimeDocument } from "@/hooks/use-firestore-realtime";
import { orderSchema, type Order } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2, Package, MapPin, Phone, Mail, ShoppingBag, ChevronLeft, Clock } from "lucide-react";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function OrderDetail() {
  const [, params] = useRoute("/orders/:id");
  const orderId = params?.id || "";

  const { data: order, isLoading, error } = useRealtimeDocument<Order>(
    "orders",
    orderId,
    orderSchema,
    ["order", orderId]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4 text-emerald-900">Order Not Found</h2>
        <p className="text-muted-foreground mb-8">The order you are looking for does not exist or you don't have access to it.</p>
        <Button asChild className="bg-emerald-800 hover:bg-emerald-900">
          <Link href="/orders">Return to My Orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Button variant="ghost" className="mb-6 group hover:bg-transparent p-0" asChild>
        <Link href="/orders">
          <ChevronLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to My Orders
        </Link>
      </Button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900">Order Details</h1>
          <p className="text-muted-foreground font-mono">#{order.id.toUpperCase()}</p>
        </div>
        <Badge className={`text-sm px-4 py-1 capitalize ${
          order.status === 'delivered' ? 'bg-emerald-500 hover:bg-emerald-600' :
          order.status === 'shipped' ? 'bg-blue-500 hover:bg-blue-600' :
          order.status === 'pending' ? 'bg-amber-500 hover:bg-amber-600' :
          'bg-slate-500 hover:bg-slate-600'
        }`}>
          {order.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-emerald-100 shadow-sm">
            <CardHeader className="bg-emerald-50/30 border-b border-emerald-100 py-4">
              <CardTitle className="flex items-center gap-2 text-emerald-900 text-lg">
                <ShoppingBag className="h-5 w-5" />
                Items ordered
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-emerald-50">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 hover:bg-emerald-50/10 transition-colors">
                    <div className="h-20 w-20 bg-emerald-50 rounded-lg overflow-hidden flex-shrink-0 border border-emerald-100">
                      {item.product?.images?.[0] ? (
                        <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-emerald-200" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex justify-between">
                      <div className="space-y-1">
                        <p className="font-bold text-emerald-900 text-lg">{item.product?.name || "Unknown Product"}</p>
                        {item.selectedVariant && typeof item.selectedVariant === 'object' && Object.entries(item.selectedVariant).length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {Object.entries(item.selectedVariant).map(([key, value]) => (
                              <Badge key={key} variant="outline" className="text-[11px] h-5 px-2 bg-emerald-50/50 text-emerald-700 border-emerald-200">
                                {key}: {String(value)}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground mt-2 font-medium">
                          {item.quantity} × Rs. {item.product?.price?.toLocaleString() ?? "0"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-900 text-lg">Rs. {(item.quantity * (item.product?.price ?? 0)).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-emerald-900 text-white shadow-lg overflow-hidden border-none">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest">Grand Total</p>
                  <p className="text-3xl font-bold">Rs. {order.total?.toLocaleString() ?? "0"}</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-2">Payment Mode</p>
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/20 px-4">
                    Cash on Delivery
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-emerald-100 shadow-sm">
            <CardHeader className="bg-emerald-50/30 border-b border-emerald-100 py-3">
              <CardTitle className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                <Package className="w-4 h-4" /> Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-50 rounded-full text-emerald-600">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">Email Address</p>
                  <p className="text-sm font-semibold text-emerald-950 break-all">{order.customerInfo?.email || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-50 rounded-full text-emerald-600">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">Mobile Number</p>
                  <p className="text-sm font-semibold text-emerald-950">{order.customerInfo?.mobileNumber || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 shadow-sm">
            <CardHeader className="bg-emerald-50/30 border-b border-emerald-100 py-3">
              <CardTitle className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-1">
                <p className="font-bold text-emerald-950">{order.customerInfo?.fullName || "N/A"}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {order.shippingAddress?.street || "N/A"}<br />
                  {order.shippingAddress?.area || "N/A"}<br />
                  {order.shippingAddress?.city || "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 shadow-sm">
            <CardHeader className="bg-emerald-50/30 border-b border-emerald-100 py-3">
              <CardTitle className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="relative pl-6 border-l-2 border-emerald-100 space-y-6 py-2">
                <div className="relative">
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow-sm" />
                  <div>
                    <p className="font-bold text-emerald-900 text-sm">Order Placed</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {(() => {
                        const date = order.createdAt as any;
                        if (date?.toDate) return format(date.toDate(), "PPP p");
                        if (date instanceof Date) return format(date, "PPP p");
                        if (date?.seconds) return format(new Date(date.seconds * 1000), "PPP p");
                        return "N/A";
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
