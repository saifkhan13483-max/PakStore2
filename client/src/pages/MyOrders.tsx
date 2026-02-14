import { Suspense, lazy, useEffect, useState, useMemo } from "react";
import { useRealtimeCollection } from "@/hooks/use-firestore-realtime";
import { orderSchema, type Order } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2, Package, ShoppingBag, Clock, ExternalLink, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { orderBy, where } from "firebase/firestore";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function MyOrders() {
  const { user } = useAuthStore();

  const { data: orders, isLoading, error } = useRealtimeCollection<Order>(
    "orders",
    orderSchema,
    ["my-orders", user?.uid],
    [
      where("userId", "==", user?.uid || ""),
      // Remove orderBy to avoid composite index requirement
      // orderBy("createdAt", "desc")
    ]
  );

  // Client-side sorting as a temporary fix for missing Firestore index
  const sortedOrders = useMemo(() => {
    if (!orders) return [];
    return [...orders].sort((a, b) => {
      const dateA = (a.createdAt as any)?.seconds || (a.createdAt as any)?.getTime() / 1000 || 0;
      const dateB = (b.createdAt as any)?.seconds || (b.createdAt as any)?.getTime() / 1000 || 0;
      return dateB - dateA;
    });
  }, [orders]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-destructive">
        <p>Error loading your orders: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
        <p className="text-muted-foreground">Track and manage your recent purchases</p>
      </div>

      {!sortedOrders || sortedOrders.length === 0 ? (
        <Card className="border-dashed flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="mb-2">No orders found</CardTitle>
          <CardDescription className="mb-6">You haven't placed any orders yet.</CardDescription>
          <Link href="/products">
            <Button className="hover-elevate">Start Shopping</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden hover-elevate transition-all border-none bg-card/50 backdrop-blur-sm shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 py-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order ID</span>
                  <span className="font-mono text-sm">#{order.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</span>
                  <span className="text-sm">
                    {(() => {
                      const date = order.createdAt as any;
                      if (date?.toDate) return format(date.toDate(), "MMM d, yyyy");
                      if (date instanceof Date) return format(date, "MMM d, yyyy");
                      if (date?.seconds) return format(new Date(date.seconds * 1000), "MMM d, yyyy");
                      return "N/A";
                    })()}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      {order.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 border">
                            {item.product?.images?.[0] ? (
                              <img 
                                src={item.product.images[0]} 
                                alt={item.product.name} 
                                className="h-full w-full object-cover" 
                              />
                            ) : (
                              <Package className="h-6 w-6 text-muted-foreground/30" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.product?.name || "Product"}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-xs text-muted-foreground pl-16">
                          + {order.items.length - 2} more items
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-3 min-w-[120px]">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Total Amount</p>
                        <p className="text-lg font-bold">Rs. {order.total?.toLocaleString()}</p>
                      </div>
                      <Badge className={`capitalize px-3 ${
                        order.status === 'delivered' ? 'bg-emerald-500 hover:bg-emerald-600' :
                        order.status === 'shipped' ? 'bg-blue-500 hover:bg-blue-600' :
                        order.status === 'pending' ? 'bg-amber-500 hover:bg-amber-600' :
                        'bg-slate-500 hover:bg-slate-600'
                      }`}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
