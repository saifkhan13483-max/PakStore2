import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, Users, ShoppingCart, BarChart, Tags, Loader2, RefreshCw, TrendingUp, TrendingDown, Clock, ArrowRight, RotateCcw } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useRealtimeCollection } from "@/hooks/use-firestore-realtime";
import { orderSchema, type Order } from "@shared/schema";
import { adminStatsService, type AdminStats } from "@/services/adminStatsService";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Use real-time orders for dashboard stats if possible, or stick to query with shorter refetch
  const { data: orders } = useRealtimeCollection<Order>(
    "orders",
    orderSchema,
    ["admin-orders-realtime"]
  );

  const { data: stats, isLoading, isRefetching } = useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: () => adminStatsService.getAdminStats(),
    refetchInterval: 10000, // Faster refresh for dashboard
  });

  const resetOrdersMutation = useMutation({
    mutationFn: () => adminStatsService.resetOrders(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({
        title: "Success",
        description: "Orders and revenue have been reset.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset orders.",
        variant: "destructive",
      });
    },
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all orders and revenue? This action cannot be undone.")) {
      resetOrdersMutation.mutate();
    }
  };

  const statCards = [
    { 
      title: "Total Products", 
      value: stats?.totalProducts ?? 0, 
      icon: Package, 
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      description: "Available in store"
    },
    { 
      title: "Total Categories", 
      value: stats?.totalCategories ?? 0, 
      icon: Tags, 
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      description: "Product classifications"
    },
    { 
      title: "Total Orders", 
      value: stats?.totalOrders ?? 0, 
      icon: ShoppingCart, 
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      description: "Lifetime orders",
      canReset: true
    },
    { 
      title: "Revenue", 
      value: `₨ ${stats?.totalRevenue?.toLocaleString() ?? "0"}`, 
      icon: BarChart, 
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      description: "Total earnings",
      canReset: true
    },
    { 
      title: "Estimated Profit", 
      value: `₨ ${orders?.reduce((acc, order) => {
        return acc + (order.items || []).reduce((itemAcc, item) => {
          const itemProfit = item.product?.profit || 0;
          return itemAcc + (item.quantity * itemProfit);
        }, 0);
      }, 0).toLocaleString() ?? "0"}`, 
      icon: TrendingUp, 
      color: "text-emerald-600",
      bg: "bg-emerald-600/10",
      description: "Dropshipping margin",
    },
  ];

  const recentOrders = orders?.slice(0, 5) ?? [];

  return (
    <div className="space-y-8 p-1">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your store today.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefetching}
          className="hover-elevate"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh Stats
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover-elevate border-none bg-card/50 backdrop-blur-sm shadow-sm relative group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                {stat.canReset && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset();
                    }}
                    disabled={resetOrdersMutation.isPending}
                    data-testid={`button-reset-${stat.title.toLowerCase().replace(' ', '-')}`}
                  >
                    <RotateCcw className="h-3 w-3 text-muted-foreground" />
                  </Button>
                )}
                <div className={`p-2 rounded-md ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none bg-card/50 backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>You have {orders?.length ?? 0} total orders.</CardDescription>
            </div>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="hover-elevate">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50 hover-elevate group">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <ShoppingCart className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">{order.customerInfo?.fullName || 'Unknown Customer'}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {order.items?.length || 0} {(order.items?.length || 0) === 1 ? 'item' : 'items'} • ₨ {(order.total || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'} className="capitalize text-[10px] px-2 py-0">
                          {order.status}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {order.createdAt instanceof Date ? order.createdAt.toLocaleDateString() : 'Just now'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <ShoppingCart className="h-10 w-10 text-muted-foreground/20 mb-2" />
                    <p className="text-sm text-muted-foreground">No orders yet.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none bg-card/50 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/admin/products/new">
              <Button className="w-full justify-between h-12 hover-elevate" variant="outline">
                <span className="flex items-center">
                  <Package className="mr-3 h-5 w-5 text-blue-500" /> 
                  Add New Product
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>
            <Link href="/admin/categories">
              <Button className="w-full justify-between h-12 hover-elevate" variant="outline">
                <span className="flex items-center">
                  <Tags className="mr-3 h-5 w-5 text-orange-500" /> 
                  Manage Categories
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button className="w-full justify-between h-12 hover-elevate" variant="outline">
                <span className="flex items-center">
                  <ShoppingCart className="mr-3 h-5 w-5 text-purple-500" /> 
                  Manage Orders
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>
            <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Store Health</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your store revenue is up 12% compared to last week. Keep up the great work!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
