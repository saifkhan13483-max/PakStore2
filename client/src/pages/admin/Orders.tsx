import { useQuery } from "@tanstack/react-query";
import { type Order } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2, Package } from "lucide-react";

export default function AdminOrders() {
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

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
                <TableHead className="text-emerald-900 font-bold text-right">Date</TableHead>
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
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {format(new Date(order.createdAt), "MMM d, h:mm a")}
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
