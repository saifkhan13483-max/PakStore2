import { useQuery } from "@tanstack/react-query";
import { type Order } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2, Package, MapPin, Phone, Mail, ShoppingBag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function AdminOrders() {
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
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
                <TableHead className="text-emerald-900 font-bold">City</TableHead>
                <TableHead className="text-emerald-900 font-bold text-right">Total</TableHead>
                <TableHead className="text-emerald-900 font-bold">Status</TableHead>
                <TableHead className="text-emerald-900 font-bold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders?.map((order) => (
                  <TableRow key={order.id} className="hover:bg-emerald-50/30 border-emerald-100">
                    <TableCell className="font-mono text-xs text-emerald-800">#{order.orderId}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-emerald-900">{order.fullName}</span>
                        <span className="text-xs text-muted-foreground">{order.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-emerald-800">{order.city}</TableCell>
                    <TableCell className="text-right font-bold text-emerald-900">
                      Rs. {order.total.toLocaleString()}
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
                            <DialogTitle className="text-emerald-900">Order Details - #{order.orderId}</DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-2 gap-6 mt-4">
                            <div className="space-y-4">
                              <div>
                                <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2 mb-2">
                                  <Package className="w-4 h-4" /> Shipping Info
                                </h3>
                                <div className="text-sm space-y-1">
                                  <p className="font-medium">{order.fullName}</p>
                                  <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> {order.phone}</p>
                                  <p className="flex items-center gap-1"><Mail className="w-3 h-3" /> {order.email}</p>
                                  <p className="flex items-center gap-1 mt-2 font-medium"><MapPin className="w-3 h-3" /> {order.address}</p>
                                  <p className="ml-4">{order.area}, {order.city}</p>
                                </div>
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-emerald-800 mb-2">Order Summary</h3>
                                <div className="text-sm space-y-1">
                                  <p>Status: <Badge variant="outline" className="ml-1 capitalize">{order.status}</Badge></p>
                                  <p>Payment: <Badge variant="outline" className="ml-1">{order.paymentMethod}</Badge></p>
                                  <p>Date: {format(new Date(order.createdAt), "PPP p")}</p>
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
                                      <p className="text-sm font-medium text-emerald-900">{item.name}</p>
                                      <p className="text-xs text-muted-foreground">Qty: {item.quantity} × Rs. {item.price.toLocaleString()}</p>
                                    </div>
                                    <p className="text-sm font-bold">Rs. {(item.quantity * item.price).toLocaleString()}</p>
                                  </div>
                                ))}
                              </div>
                              <div className="pt-2 border-t border-emerald-200">
                                <div className="flex justify-between items-center font-bold text-emerald-900">
                                  <span>Total Amount</span>
                                  <span>Rs. {order.total.toLocaleString()}</span>
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
