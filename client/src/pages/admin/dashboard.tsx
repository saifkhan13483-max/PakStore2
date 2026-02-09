import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockStorage } from "@/lib/mock-storage";
import { Package, ShoppingCart, Users, DollarSign } from "lucide-react";

export default function AdminDashboard() {
  const products = mockStorage.getProducts();
  
  const stats = [
    { title: "Total Products", value: products.length, icon: Package, color: "text-blue-500" },
    { title: "Total Orders", value: "45", icon: ShoppingCart, color: "text-green-500" },
    { title: "Customers", value: "12", icon: Users, color: "text-purple-500" },
    { title: "Revenue", value: "Rs. 125,000", icon: DollarSign, color: "text-emerald-500" },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm">
            Everything is running smoothly on the frontend!
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
