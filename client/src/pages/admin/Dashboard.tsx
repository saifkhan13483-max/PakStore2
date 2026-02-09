import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, ShoppingCart, BarChart } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { title: "Total Products", value: "124", icon: Package, color: "text-blue-500" },
    { title: "Total Users", value: "1,240", icon: Users, color: "text-green-500" },
    { title: "Total Orders", value: "456", icon: ShoppingCart, color: "text-purple-500" },
    { title: "Revenue", value: "₨ 125,000", icon: BarChart, color: "text-yellow-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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
            <p className="text-sm text-muted-foreground">
              Quick links to manage products and categories.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
