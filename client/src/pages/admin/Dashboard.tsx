import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, ShoppingCart, BarChart, Tags, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

interface AdminStats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    refetchInterval: 5000, // Real-time updates every 5 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { 
      title: "Total Products", 
      value: stats?.totalProducts ?? 0, 
      icon: Package, 
      color: "text-blue-500" 
    },
    { 
      title: "Total Users", 
      value: stats?.totalUsers?.toLocaleString() ?? "0", 
      icon: Users, 
      color: "text-green-500" 
    },
    { 
      title: "Total Orders", 
      value: stats?.totalOrders ?? 0, 
      icon: ShoppingCart, 
      color: "text-purple-500" 
    },
    { 
      title: "Revenue", 
      value: `₨ ${stats?.totalRevenue?.toLocaleString() ?? "0"}`, 
      icon: BarChart, 
      color: "text-yellow-500" 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Activity overview will be displayed here.
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/products/new">
              <Button className="w-full justify-start" variant="outline">
                <Package className="mr-2 h-4 w-4" /> Add New Product
              </Button>
            </Link>
            <Link href="/admin/categories">
              <Button className="w-full justify-start" variant="outline">
                <Tags className="mr-2 h-4 w-4" /> Manage Categories
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
