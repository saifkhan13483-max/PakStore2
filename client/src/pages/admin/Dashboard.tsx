import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Package, Users, ShoppingCart, BarChart, Tags, Loader2, RefreshCw,
  TrendingUp, Clock, ArrowRight, RotateCcw, MessageSquare, Star,
  AlertCircle, CheckCircle2, ShieldCheck,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useRealtimeCollection } from "@/hooks/use-firestore-realtime";
import { orderSchema, type Order } from "@shared/schema";
import { adminStatsService, type AdminStats } from "@/services/adminStatsService";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { getSeededStats } from "@/lib/seed-comments";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: orders } = useRealtimeCollection<Order>(
    "orders",
    orderSchema,
    ["admin-orders-realtime"]
  );

  const { data: stats, isLoading, isRefetching } = useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: () => adminStatsService.getAdminStats(),
    refetchInterval: 10000,
  });

  const { data: seedStats, isLoading: seedStatsLoading } = useQuery({
    queryKey: ["seeded-stats"],
    queryFn: getSeededStats,
    staleTime: 60_000,
  });

  const resetOrdersMutation = useMutation({
    mutationFn: () => adminStatsService.resetOrders(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({ title: "Success", description: "Orders and revenue have been reset." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to reset orders.", variant: "destructive" });
    },
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    queryClient.invalidateQueries({ queryKey: ["seeded-stats"] });
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
      description: "Available in store",
    },
    {
      title: "Total Categories",
      value: stats?.totalCategories ?? 0,
      icon: Tags,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      description: "Product classifications",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      description: "Lifetime orders",
      canReset: true,
    },
    {
      title: "Revenue",
      value: `₨ ${stats?.totalRevenue?.toLocaleString() ?? "0"}`,
      icon: BarChart,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      description: "Total earnings",
      canReset: true,
    },
    {
      title: "Estimated Profit",
      value: `₨ ${(
        orders?.reduce(
          (acc, order) =>
            acc +
            (order.items || []).reduce(
              (itemAcc, item) => itemAcc + item.quantity * (item.product?.profit || 0),
              0
            ),
          0
        ) ?? 0
      ).toLocaleString()}`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-600/10",
      description: "Dropshipping margin",
    },
  ];

  const recentOrders = orders?.slice(0, 5) ?? [];

  // Derived seed health text
  const seedHealthText = (() => {
    if (!seedStats) return null;
    if (seedStats.productsWithNoComments > 5)
      return {
        msg: `${seedStats.productsWithNoComments} products have no reviews yet. Consider seeding them.`,
        ok: false,
      };
    if (seedStats.totalSeededComments === 0)
      return { msg: "No seeded comments yet. Run a seed operation to boost your store.", ok: false };
    return {
      msg: `${seedStats.totalSeededComments.toLocaleString()} seeded reviews across ${seedStats.productsWithSeeded} products. Avg rating: ${seedStats.averageRating.toFixed(1)} ★`,
      ok: true,
    };
  })();

  return (
    <div className="space-y-8 p-1">
      <SEO title="Admin Dashboard - PakCart" robots="noindex,follow" />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefetching}
          className="hover-elevate"
        >
          <RefreshCw className={cn("mr-2 h-4 w-4", isRefetching && "animate-spin")} />
          Refresh Stats
        </Button>
      </div>

      {/* ── Primary stat cards ──────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className="hover-elevate border-none bg-card/50 backdrop-blur-sm shadow-sm relative group"
          >
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
                    onClick={(e) => { e.stopPropagation(); handleReset(); }}
                    disabled={resetOrdersMutation.isPending}
                    data-testid={`button-reset-${stat.title.toLowerCase().replace(" ", "-")}`}
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
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Seed Comments stats row ─────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Reviews at a Glance</h3>
          <Link href="/admin/seed-comments">
            <span className="text-xs text-primary hover:underline cursor-pointer ml-1">
              Manage →
            </span>
          </Link>
        </div>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          {[
            {
              label: "Seeded Reviews",
              value: seedStatsLoading ? "…" : (seedStats?.totalSeededComments ?? 0).toLocaleString(),
              icon: MessageSquare,
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              label: "Products Seeded",
              value: seedStatsLoading ? "…" : (seedStats?.productsWithSeeded ?? 0).toLocaleString(),
              icon: Package,
              color: "text-blue-500",
              bg: "bg-blue-500/10",
            },
            {
              label: "Unseeded Products",
              value: seedStatsLoading ? "…" : (seedStats?.productsWithNoComments ?? 0).toLocaleString(),
              icon: AlertCircle,
              color:
                (seedStats?.productsWithNoComments ?? 0) > 0
                  ? "text-amber-500"
                  : "text-green-500",
              bg:
                (seedStats?.productsWithNoComments ?? 0) > 0
                  ? "bg-amber-500/10"
                  : "bg-green-500/10",
            },
            {
              label: "Avg Seeded Rating",
              value: seedStatsLoading
                ? "…"
                : (seedStats?.totalSeededComments ?? 0) > 0
                ? `${(seedStats?.averageRating ?? 0).toFixed(1)} ★`
                : "—",
              icon: Star,
              color: "text-amber-500",
              bg: "bg-amber-500/10",
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card
              key={label}
              className="hover-elevate border-none bg-card/50 backdrop-blur-sm shadow-sm"
              data-testid={`dash-seed-${label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {label}
                </CardTitle>
                <div className={`p-2 rounded-md ${bg}`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={cn("text-2xl font-bold tabular-nums", color)}>{value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Last seeded timestamp */}
        {seedStats?.lastSeeded && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-2">
            <Clock className="h-3 w-3" />
            Last seeded:{" "}
            {seedStats.lastSeeded.toLocaleString("en-PK", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>

      {/* ── Main content row ────────────────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Orders */}
        <Card className="lg:col-span-4 border-none bg-card/50 backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                You have {orders?.length ?? 0} total order{(orders?.length ?? 0) !== 1 ? "s" : ""}.
              </CardDescription>
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
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50 hover-elevate group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <ShoppingCart className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">
                            {order.customerInfo?.fullName || "Unknown Customer"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {order.items?.length || 0}{" "}
                            {(order.items?.length || 0) === 1 ? "item" : "items"} • ₨{" "}
                            {(order.total || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          variant={order.status === "delivered" ? "default" : "secondary"}
                          className="capitalize text-[10px] px-2 py-0"
                        >
                          {order.status}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {order.createdAt instanceof Date
                            ? order.createdAt.toLocaleDateString()
                            : "Just now"}
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

        {/* Quick Actions + Store Health */}
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
            <Link href="/admin/seed-comments">
              <Button className="w-full justify-between h-12 hover-elevate" variant="outline">
                <span className="flex items-center">
                  <MessageSquare className="mr-3 h-5 w-5 text-primary" />
                  Seed Comments
                  {(seedStats?.productsWithNoComments ?? 0) > 0 && (
                    <Badge
                      variant="destructive"
                      className="ml-2 text-[10px] px-1.5 py-0 h-4"
                    >
                      {seedStats!.productsWithNoComments} unseeded
                    </Badge>
                  )}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>

            {/* Dynamic Store Health */}
            <div
              className={cn(
                "mt-2 p-4 rounded-xl border",
                seedHealthText?.ok
                  ? "bg-green-500/5 border-green-500/20"
                  : "bg-amber-500/5 border-amber-500/20"
              )}
            >
              <div className="flex items-center gap-2 mb-1.5">
                {seedHealthText?.ok ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
                <span className="text-sm font-semibold">Review Health</span>
                {seedStatsLoading && (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground ml-auto" />
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {seedStatsLoading
                  ? "Checking review status…"
                  : seedHealthText?.msg ??
                    "Run a seed operation to populate your store with realistic reviews."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
