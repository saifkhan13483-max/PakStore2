import { useRealtimeCollection } from "@/hooks/use-firestore-realtime";
import { orderSchema, type Order } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2, Package, MapPin, Phone, Mail, ShoppingBag, Search, ExternalLink, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminOrders() {
  const { toast } = useToast();
  const { data: orders, isLoading, error } = useRealtimeCollection<Order>(
    "orders",
    orderSchema,
    ["/api/orders"],
    [orderBy("createdAt", "desc")]
  );

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter(order => {
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo?.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      setIsUpdating(true);
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { 
        status: newStatus,
        updatedAt: new Date()
      });
      toast({
        title: "Status Updated",
        description: `Order status has been changed to ${newStatus}`,
      });
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      return;
    }

    try {
      setIsUpdating(true);
      const orderRef = doc(db, "orders", orderId);
      await deleteDoc(orderRef);
      toast({
        title: "Order Deleted",
        description: "The order has been successfully removed.",
      });
    } catch (err: any) {
      toast({
        title: "Delete Failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

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

  const orderStats = {
    total: orders?.length || 0,
    pending: orders?.filter(o => o.status === 'pending').length || 0,
    processing: orders?.filter(o => o.status === 'processing').length || 0,
    shipped: orders?.filter(o => o.status === 'shipped').length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900">Manage Orders</h1>
          <p className="text-muted-foreground">Monitor and manage customer orders</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="px-3 py-1 bg-emerald-50 text-emerald-700 border-emerald-200">
            {orderStats.pending} Pending
          </Badge>
          <Badge variant="outline" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
            {orderStats.processing} Processing
          </Badge>
          <Badge variant="outline" className="px-3 py-1 bg-purple-50 text-purple-700 border-purple-200">
            {orderStats.shipped} Shipped
          </Badge>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by Order ID, Name or Email..." 
            className="pl-9 border-emerald-100 focus-visible:ring-emerald-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
          <TabsList className="bg-emerald-50/50 border border-emerald-100">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card className="border-emerald-100 shadow-sm overflow-hidden">
        <CardHeader className="bg-emerald-50/30 border-b border-emerald-100 py-4">
          <CardTitle className="flex items-center gap-2 text-emerald-900 text-lg">
            <Package className="h-5 w-5" />
            Orders ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-emerald-100 bg-emerald-50/10">
                  <TableHead className="text-emerald-900 font-bold w-[120px]">Order ID</TableHead>
                  <TableHead className="text-emerald-900 font-bold">Customer</TableHead>
                  <TableHead className="text-emerald-900 font-bold">Date</TableHead>
                  <TableHead className="text-emerald-900 font-bold text-right">Total</TableHead>
                  <TableHead className="text-emerald-900 font-bold">Status</TableHead>
                  <TableHead className="text-emerald-900 font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <ShoppingBag className="h-8 w-8 opacity-20" />
                        <p>No orders matching your filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-emerald-50/30 border-emerald-100 transition-colors">
                      <TableCell className="font-mono text-xs text-emerald-800 font-semibold">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-emerald-900">{order.customerInfo?.fullName || "N/A"}</span>
                          <span className="text-xs text-muted-foreground">{order.customerInfo?.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-emerald-800">
                        {(() => {
                          const date = order.createdAt as any;
                          if (date?.toDate) return format(date.toDate(), "MMM d, yyyy");
                          if (date instanceof Date) return format(date, "MMM d, yyyy");
                          if (date?.seconds) return format(new Date(date.seconds * 1000), "MMM d, yyyy");
                          return "N/A";
                        })()}
                      </TableCell>
                      <TableCell className="text-right font-bold text-emerald-900">
                        Rs. {order.total?.toLocaleString() ?? "0"}
                      </TableCell>
                      <TableCell>
                        <Select
                          disabled={isUpdating}
                          defaultValue={order.status}
                          onValueChange={(val) => updateOrderStatus(order.id, val as Order['status'])}
                        >
                          <SelectTrigger className={`h-8 w-[130px] text-xs font-semibold ${
                            order.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            order.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            order.status === 'shipped' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="hover:bg-emerald-100 text-emerald-700">
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Details
                              </Button>
                            </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader className="border-b pb-4">
                              <DialogTitle className="text-emerald-900 flex items-center justify-between pr-8">
                                <span>Order Details</span>
                                <span className="font-mono text-emerald-600">#{order.id.toUpperCase()}</span>
                              </DialogTitle>
                            </DialogHeader>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                              <div className="md:col-span-2 space-y-6">
                                <section>
                                  <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2 mb-3 bg-emerald-50 p-2 rounded">
                                    <ShoppingBag className="w-4 h-4" /> Ordered Items
                                  </h3>
                                  <div className="space-y-4">
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="flex gap-4 p-3 rounded-lg border border-emerald-50 bg-white shadow-sm">
                                        <div className="h-16 w-16 bg-emerald-50 rounded overflow-hidden flex-shrink-0">
                                          {item.product?.images?.[0] ? (
                                            <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                                          ) : (
                                            <div className="h-full w-full flex items-center justify-center">
                                              <Package className="h-6 w-6 text-emerald-200" />
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-1 flex justify-between">
                                          <div>
                                            <p className="font-semibold text-emerald-900">{item.product?.name || "Unknown Product"}</p>
                                            {item.selectedVariant && Object.entries(item.selectedVariant).length > 0 && (
                                              <div className="flex flex-wrap gap-1 mt-1">
                                                {Object.entries(item.selectedVariant).map(([key, value]) => (
                                                  <Badge key={key} variant="outline" className="text-[10px] h-4 py-0 bg-emerald-50/50 text-emerald-600">
                                                    {key}: {value}
                                                  </Badge>
                                                ))}
                                              </div>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-2">
                                              {item.quantity} × Rs. {item.product?.price?.toLocaleString() ?? "0"}
                                            </p>
                                          </div>
                                          <div className="text-right">
                                            <p className="font-bold text-emerald-900">Rs. {(item.quantity * (item.product?.price ?? 0)).toLocaleString()}</p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </section>

                                <div className="p-4 rounded-lg bg-emerald-900 text-white flex justify-between items-center shadow-lg">
                                  <div>
                                    <p className="text-emerald-200 text-xs font-medium uppercase tracking-wider">Total Paid</p>
                                    <p className="text-2xl font-bold">Rs. {order.total?.toLocaleString() ?? "0"}</p>
                                  </div>
                                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/20 capitalize">
                                    {order.status}
                                  </Badge>
                                </div>
                              </div>

                              <div className="space-y-6">
                                <section className="space-y-4">
                                  <div className="p-4 rounded-lg border border-emerald-100 bg-emerald-50/30">
                                    <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2 mb-3">
                                      <Package className="w-4 h-4" /> Customer
                                    </h3>
                                    <div className="text-sm space-y-2">
                                      <p className="font-bold text-emerald-950">{order.customerInfo?.fullName || "N/A"}</p>
                                      <p className="flex items-center gap-2 text-muted-foreground break-all"><Mail className="w-3 h-3 flex-shrink-0" /> {order.customerInfo?.email || "N/A"}</p>
                                      <p className="flex items-center gap-2 text-muted-foreground"><Phone className="w-3 h-3 flex-shrink-0" /> {order.customerInfo?.mobileNumber || "N/A"}</p>
                                    </div>
                                  </div>

                                  <div className="p-4 rounded-lg border border-emerald-100 bg-emerald-50/30">
                                    <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2 mb-3">
                                      <MapPin className="w-4 h-4" /> Shipping
                                    </h3>
                                    <div className="text-sm space-y-1 text-muted-foreground">
                                      <p className="font-medium text-emerald-950">{order.shippingAddress?.street || "N/A"}</p>
                                      <p>{order.shippingAddress?.area || "N/A"}</p>
                                      <p>{order.shippingAddress?.city || "N/A"}</p>
                                    </div>
                                  </div>

                                  <div className="p-4 rounded-lg border border-emerald-100 bg-emerald-50/30">
                                    <h3 className="text-sm font-bold text-emerald-800 mb-3">Timeline</h3>
                                    <div className="text-xs space-y-3">
                                      <div className="flex gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1" />
                                        <div>
                                          <p className="font-bold text-emerald-900">Order Placed</p>
                                          <p className="text-muted-foreground">
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
                                  </div>
                                </section>
                              </div>
                            </div>
                          </DialogContent>
                          </Dialog>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deleteOrder(order.id)}
                            disabled={isUpdating}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
