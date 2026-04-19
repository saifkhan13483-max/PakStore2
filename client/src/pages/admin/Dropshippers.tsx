import { useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  ShoppingCart,
  TrendingUp,
  Package,
} from "lucide-react";

interface DropshipperApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  storeUrl?: string;
  platform: string;
  message?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: any;
}

interface DropshipperOrder {
  id: string;
  dropshipperName: string;
  dropshipperEmail: string;
  productName: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  quantity: number;
  salePrice: number;
  wholesalePrice: number;
  profit: number;
  notes?: string;
  status: string;
  createdAt: any;
}

const statusConfig = {
  pending: { label: "Pending", variant: "secondary" as const, icon: Clock },
  approved: { label: "Approved", variant: "default" as const, icon: CheckCircle2 },
  rejected: { label: "Rejected", variant: "destructive" as const, icon: XCircle },
};

const orderStatusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"];
const orderStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

async function fetchApplications(): Promise<DropshipperApplication[]> {
  const q = query(collection(db, "dropshipper_applications"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as DropshipperApplication));
}

async function fetchDropshipperOrders(): Promise<DropshipperOrder[]> {
  const q = query(collection(db, "dropshipper_orders"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as DropshipperOrder));
}

type ActiveTab = "applications" | "orders";

export default function AdminDropshippers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<ActiveTab>("applications");

  const { data: applications = [], isLoading: appsLoading } = useQuery<DropshipperApplication[]>({
    queryKey: ["/admin/dropshippers"],
    queryFn: fetchApplications,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<DropshipperOrder[]>({
    queryKey: ["/admin/dropshipper-orders"],
    queryFn: fetchDropshipperOrders,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await updateDoc(doc(db, "dropshipper_applications", id), { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/dropshippers"] });
      toast({ title: "Status updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await updateDoc(doc(db, "dropshipper_orders", id), { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/dropshipper-orders"] });
      toast({ title: "Order status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update order", variant: "destructive" });
    },
  });

  const filtered =
    filterStatus === "all"
      ? applications
      : applications.filter((a) => a.status === filterStatus);

  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const orderCounts = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    totalProfit: orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + (o.profit || 0), 0),
  };

  const tabs = [
    { id: "applications" as ActiveTab, label: "Applications", badge: counts.pending },
    { id: "orders" as ActiveTab, label: "Dropshipper Orders", badge: orderCounts.pending },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dropshipper Program</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage dropshipper applications and their customer orders.
        </p>
      </div>

      {/* Top-level Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Dropshippers", value: counts.approved, color: "bg-green-50 text-green-700 border-green-100", icon: Users },
          { label: "Pending Applications", value: counts.pending, color: "bg-yellow-50 text-yellow-700 border-yellow-100", icon: Clock },
          { label: "Total Orders", value: orderCounts.total, color: "bg-blue-50 text-blue-700 border-blue-100", icon: ShoppingCart },
          { label: "Total Profit Sent", value: `Rs. ${orderCounts.totalProfit.toLocaleString()}`, color: "bg-purple-50 text-purple-700 border-purple-100", icon: TrendingUp },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">{s.label}</span>
              <s.icon className="h-4 w-4 opacity-70" />
            </div>
            <p className="text-xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`tab-${tab.id}`}
            >
              {tab.label}
              {tab.badge > 0 && (
                <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full">
                  {tab.badge}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── APPLICATIONS TAB ── */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Filter by status:</span>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40" data-testid="select-filter-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ({counts.all})</SelectItem>
                <SelectItem value="pending">Pending ({counts.pending})</SelectItem>
                <SelectItem value="approved">Approved ({counts.approved})</SelectItem>
                <SelectItem value="rejected">Rejected ({counts.rejected})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-card border rounded-xl overflow-hidden">
            {appsLoading ? (
              <div className="flex items-center justify-center py-20 text-muted-foreground">
                Loading applications...
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                <Users className="h-10 w-10 opacity-30" />
                <p className="text-sm">No applications found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Store Link</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((app) => {
                    const cfg = statusConfig[app.status] ?? statusConfig.pending;
                    return (
                      <TableRow key={app.id} data-testid={`row-dropshipper-${app.id}`}>
                        <TableCell className="font-medium">{app.fullName}</TableCell>
                        <TableCell>
                          <div className="text-sm">{app.email}</div>
                          <div className="text-xs text-muted-foreground">{app.phone}</div>
                        </TableCell>
                        <TableCell className="text-sm">{app.platform}</TableCell>
                        <TableCell>
                          {app.storeUrl ? (
                            <a
                              href={app.storeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline truncate max-w-[120px] block"
                            >
                              {app.storeUrl}
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">
                          {app.message || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={cfg.variant} className="capitalize">
                            {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {app.createdAt?.toDate
                            ? app.createdAt.toDate().toLocaleDateString("en-PK")
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {app.status !== "approved" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs text-green-700 border-green-300 hover:bg-green-50"
                                onClick={() => updateStatus.mutate({ id: app.id, status: "approved" })}
                                disabled={updateStatus.isPending}
                                data-testid={`button-approve-${app.id}`}
                              >
                                Approve
                              </Button>
                            )}
                            {app.status !== "rejected" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => updateStatus.mutate({ id: app.id, status: "rejected" })}
                                disabled={updateStatus.isPending}
                                data-testid={`button-reject-${app.id}`}
                              >
                                Reject
                              </Button>
                            )}
                            {app.status !== "pending" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs text-muted-foreground"
                                onClick={() => updateStatus.mutate({ id: app.id, status: "pending" })}
                                disabled={updateStatus.isPending}
                                data-testid={`button-reset-${app.id}`}
                              >
                                Reset
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      )}

      {/* ── ORDERS TAB ── */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <div className="bg-card border rounded-xl overflow-hidden">
            {ordersLoading ? (
              <div className="flex items-center justify-center py-20 text-muted-foreground">
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                <Package className="h-10 w-10 opacity-30" />
                <p className="text-sm">No dropshipper orders yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dropshipper</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Wholesale</TableHead>
                    <TableHead>Their Profit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const colorClass = orderStatusColors[order.status] ?? orderStatusColors.pending;
                    return (
                      <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                        <TableCell>
                          <div className="text-sm font-medium">{order.dropshipperName}</div>
                          <div className="text-xs text-muted-foreground">{order.dropshipperEmail}</div>
                        </TableCell>
                        <TableCell className="text-sm max-w-[140px] truncate font-medium">
                          {order.productName}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{order.customerName}</div>
                          <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                          {order.customerAddress}
                        </TableCell>
                        <TableCell className="text-sm">{order.quantity}</TableCell>
                        <TableCell className="text-sm">
                          Rs. {(order.wholesalePrice * order.quantity).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-green-700">
                          Rs. {order.profit.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(val) =>
                              updateOrderStatus.mutate({ id: order.id, status: val })
                            }
                          >
                            <SelectTrigger
                              className={`h-7 text-xs w-28 border-0 ${colorClass}`}
                              data-testid={`select-order-status-${order.id}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {orderStatusOptions.map((s) => (
                                <SelectItem key={s} value={s} className="text-xs capitalize">
                                  {s.charAt(0).toUpperCase() + s.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {order.createdAt?.toDate
                            ? order.createdAt.toDate().toLocaleDateString("en-PK")
                            : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
