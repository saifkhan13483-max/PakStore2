import { useQuery } from "@tanstack/react-query";
import { useRealtimeCollection } from "@/hooks/use-firestore-realtime";
import { orderSchema, type Order } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2, Package, MapPin, Phone, Mail, ShoppingBag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { orderBy } from "firebase/firestore";

export default function AdminOrders() {
  const { data: orders, isLoading, error } = useRealtimeCollection<Order>(
    "orders",
    orderSchema,
    ["/api/orders"],
    [orderBy("createdAt", "desc")]
  );

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Error loading orders: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-emerald-900">Manage Orders</h1>
      </div>

      <Card className="border-emerald-100 shadow-sm">
        <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
          <CardTitle className="flex items-center gap-2 text-emerald-900">
            <Package className="h-5 w-5" />
            Order List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-emerald-100">
                <TableHead className="text-emerald-900 font-bold w-[120px]">Order ID</TableHead>
                <TableHead className="text-emerald-900 font-bold">Customer</TableHead>
                <TableHead className="text-emerald-900 font-bold">Contact</TableHead>
                <TableHead className="text-emerald-900 font-bold">City</TableHead>
                <TableHead className="text-emerald-900 font-bold text-right">Total</TableHead>
                <TableHead className="text-emerald-900 font-bold">Status</TableHead>
                <TableHead className="text-emerald-900 font-bold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders?.map((order) => (
                  <TableRow key={order.id} className="hover:bg-emerald-50/30 border-emerald-100">
                    <TableCell className="font-mono text-xs text-emerald-800">#{order.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-emerald-900">{order.customerInfo?.fullName || "N/A"}</span>
                        <span className="text-xs text-muted-foreground">{order.userId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs text-emerald-800">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {order.customerInfo?.email || "N/A"}</span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {order.customerInfo?.mobileNumber || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-emerald-800">{order.shippingAddress?.city || "N/A"}</TableCell>
                    <TableCell className="text-right font-bold text-emerald-900">
                      Rs. {order.total?.toLocaleString() ?? "0"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-emerald-900">Order Details - #{order.id.slice(0, 8)}</DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-2 gap-6 mt-4">
                            <div className="space-y-4">
                              <div>
                                <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2 mb-2">
                                  <Package className="w-4 h-4" /> Customer Information
                                </h3>
                                <div className="text-sm space-y-1">
                                  <p className="font-medium">{order.customerInfo?.fullName || order.shippingAddress?.fullName || "N/A"}</p>
                                  <p className="flex items-center gap-1 text-muted-foreground"><Mail className="w-3 h-3" /> {order.customerInfo?.email || order.shippingAddress?.email || "N/A"}</p>
                                  <p className="flex items-center gap-1 text-muted-foreground"><Phone className="w-3 h-3" /> {order.customerInfo?.mobileNumber || order.shippingAddress?.mobileNumber || order.shippingAddress?.phone || "N/A"}</p>
                                </div>
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2 mb-2">
                                  <MapPin className="w-4 h-4" /> Shipping Address
                                </h3>
                                <div className="text-sm space-y-1">
                                  <p className="font-medium">{order.shippingAddress?.street || "N/A"}</p>
                                  <p className="text-muted-foreground">{order.shippingAddress?.area || "N/A"}</p>
                                  <p className="text-muted-foreground">{order.shippingAddress?.city || "N/A"}</p>
                                </div>
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-emerald-800 mb-2">Order Summary</h3>
                                <div className="text-sm space-y-1">
                                  <p>Status: <Badge variant="outline" className="ml-1 capitalize">{order.status}</Badge></p>
                                  <p>Date: {(() => {
                                    const date = order.createdAt as any;
                                    if (date?.toDate) return format(date.toDate(), "PPP p");
                                    if (date instanceof Date) return format(date, "PPP p");
                                    return "N/A";
                                  })()}</p>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2 mb-2">
                                <ShoppingBag className="w-4 h-4" /> Items
                              </h3>
                              <div className="space-y-3 max-h-[300px] overflow-auto pr-2">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-start border-b border-emerald-50 pb-2">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-emerald-900">{item.product?.name || "Unknown Product"}</p>
                                      <p className="text-xs text-muted-foreground">Qty: {item.quantity} × Rs. {item.product?.price?.toLocaleString() ?? "0"}</p>
                                    </div>
                                    <p className="text-sm font-bold">Rs. {(item.quantity * (item.product?.price ?? 0)).toLocaleString()}</p>
                                  </div>
                                ))}
                              </div>
                              <div className="pt-2 border-t border-emerald-200 space-y-1">
                                <div className="flex justify-between items-center font-bold text-emerald-900 pt-1">
                                  <span>Total Amount</span>
                                  <span>Rs. {order.total?.toLocaleString() ?? "0"}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
