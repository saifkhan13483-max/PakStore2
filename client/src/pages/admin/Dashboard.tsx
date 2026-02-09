import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/sidebar"; // Error in original prompt, should use UI components
import { Package, Users, ShoppingCart, BarChart } from "lucide-react";

// Re-importing proper UI components since sidebar doesn't export Card
import { Card as UICard, CardContent as UICardContent, CardHeader as UICardHeader, CardTitle as UICardTitle } from "@/components/ui/card";

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
          <UICard key={stat.title}>
            <UICardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <UICardTitle className="text-sm font-medium">
                {stat.title}
              </UICardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </UICardHeader>
            <UICardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </UICardContent>
          </UICard>
        ))}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <UICard className="col-span-4">
          <UICardHeader>
            <UICardTitle>Recent Activity</UICardTitle>
          </UICardHeader>
          <UICardContent>
            <p className="text-sm text-muted-foreground">
              Activity overview will be displayed here.
            </p>
          </UICardContent>
        </UICard>
        <UICard className="col-span-3">
          <UICardHeader>
            <UICardTitle>Quick Actions</UICardTitle>
          </UICardHeader>
          <UICardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Quick links to manage products and categories.
            </p>
          </UICardContent>
        </UICard>
      </div>
    </div>
  );
}
