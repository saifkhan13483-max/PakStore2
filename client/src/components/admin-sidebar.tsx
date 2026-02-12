import { LayoutDashboard, ShoppingBag, Tags, Home, ShoppingCart } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useRealtimeCollection } from "@/hooks/use-firestore-realtime";
import { orderSchema, type Order } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { where } from "firebase/firestore";

const adminItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Products", url: "/admin/products", icon: ShoppingBag },
  { title: "Categories", url: "/admin/categories", icon: Tags },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
  { title: "Back to Shop", url: "/", icon: Home },
];

export function AdminSidebar() {
  const [location] = useLocation();
  const { data: pendingOrders } = useRealtimeCollection<Order>(
    "orders",
    orderSchema,
    ["/api/admin/orders/pending"],
    [where("status", "==", "pending")]
  );

  const pendingCount = pendingOrders?.length || 0;

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url} className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </div>
                      {item.title === "Orders" && pendingCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full"
                        >
                          {pendingCount}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
