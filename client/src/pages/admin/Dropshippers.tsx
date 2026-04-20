import { useState, useRef } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  orderBy,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Search,
  Download,
  MapPin,
  MessageCircle,
  CheckSquare,
  Banknote,
  ImageIcon,
  ExternalLink,
  Upload,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { uploadImage } from "@/lib/uploadImage";

interface DropshipperApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city?: string;
  storeUrl?: string;
  platform: string;
  monthlyOrders?: string;
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
  customerCity?: string;
  customerAddress: string;
  quantity: number;
  salePrice: number;
  wholesalePrice: number;
  profit: number;
  notes?: string;
  trackingNumber?: string;
  status: string;
  createdAt: any;
}

interface PaymentRecord {
  id: string;
  dropshipperEmail: string;
  dropshipperName: string;
  amount: number;
  period: string;
  proofUrl: string;
  notes: string;
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
  const q = query(
    collection(db, "dropshipper_applications"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as DropshipperApplication));
}

async function fetchDropshipperOrders(): Promise<DropshipperOrder[]> {
  const q = query(
    collection(db, "dropshipper_orders"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as DropshipperOrder));
}

async function fetchPayments(): Promise<PaymentRecord[]> {
  const q = query(
    collection(db, "dropshipper_payments"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PaymentRecord));
}

function exportCSV(orders: DropshipperOrder[]) {
  const headers = [
    "Date",
    "Dropshipper",
    "Dropshipper Email",
    "Product",
    "Customer",
    "Customer Phone",
    "Customer City",
    "Address",
    "Qty",
    "Sale Price",
    "Wholesale",
    "Profit",
    "Status",
    "Tracking",
    "Notes",
  ];
  const rows = orders.map((o) => [
    o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString("en-PK") : "",
    o.dropshipperName,
    o.dropshipperEmail,
    o.productName,
    o.customerName,
    o.customerPhone,
    o.customerCity || "",
    `"${(o.customerAddress || "").replace(/"/g, '""')}"`,
    o.quantity,
    o.salePrice * o.quantity,
    o.wholesalePrice * o.quantity,
    o.profit,
    o.status,
    o.trackingNumber || "",
    `"${(o.notes || "").replace(/"/g, '""')}"`,
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dropshipper-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

type ActiveTab = "applications" | "orders" | "payments";

export default function AdminDropshippers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<ActiveTab>("applications");
  const [appSearch, setAppSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  const getCurrentPeriod = () =>
    new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

  const [paymentForm, setPaymentForm] = useState({
    dropshipperEmail: "",
    dropshipperName: "",
    amount: "",
    period: getCurrentPeriod(),
    notes: "",
  });
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string>("");
  const [isUploadingPayment, setIsUploadingPayment] = useState(false);
  const paymentProofInputRef = useRef<HTMLInputElement>(null);

  const { data: applications = [], isLoading: appsLoading } = useQuery<
    DropshipperApplication[]
  >({
    queryKey: ["/admin/dropshippers"],
    queryFn: fetchApplications,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<DropshipperOrder[]>({
    queryKey: ["/admin/dropshipper-orders"],
    queryFn: fetchDropshipperOrders,
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery<PaymentRecord[]>({
    queryKey: ["/admin/dropshipper-payments"],
    queryFn: fetchPayments,
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

  const updateTracking = useMutation({
    mutationFn: async ({ id, trackingNumber }: { id: string; trackingNumber: string }) => {
      await updateDoc(doc(db, "dropshipper_orders", id), { trackingNumber });
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["/admin/dropshipper-orders"] });
      setTrackingInputs((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      toast({ title: "Tracking number saved" });
    },
    onError: () => {
      toast({ title: "Failed to save tracking number", variant: "destructive" });
    },
  });

  async function bulkUpdateStatus(status: string) {
    if (selectedApps.size === 0) return;
    const ids = Array.from(selectedApps);
    await Promise.all(
      ids.map((id) =>
        updateDoc(doc(db, "dropshipper_applications", id), { status })
      )
    );
    queryClient.invalidateQueries({ queryKey: ["/admin/dropshippers"] });
    setSelectedApps(new Set());
    toast({
      title: `${ids.length} application${ids.length > 1 ? "s" : ""} ${status}`,
    });
  }

  const toggleSelectApp = (id: string) => {
    setSelectedApps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (ids: string[]) => {
    if (ids.every((id) => selectedApps.has(id))) {
      setSelectedApps(new Set());
    } else {
      setSelectedApps(new Set(ids));
    }
  };

  const filteredApplications = applications
    .filter((a) => filterStatus === "all" || a.status === filterStatus)
    .filter(
      (a) =>
        appSearch === "" ||
        a.fullName.toLowerCase().includes(appSearch.toLowerCase()) ||
        a.email.toLowerCase().includes(appSearch.toLowerCase()) ||
        a.phone.includes(appSearch) ||
        (a.city || "").toLowerCase().includes(appSearch.toLowerCase())
    );

  const filteredOrders = orders
    .filter((o) => orderStatusFilter === "all" || o.status === orderStatusFilter)
    .filter(
      (o) =>
        orderSearch === "" ||
        o.dropshipperName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.dropshipperEmail.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.productName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerName.toLowerCase().includes(orderSearch.toLowerCase())
    );

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

  async function handleSubmitPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentForm.dropshipperEmail || !paymentForm.amount || !paymentProofFile) {
      toast({ title: "Please fill all required fields and upload proof screenshot", variant: "destructive" });
      return;
    }
    setIsUploadingPayment(true);
    try {
      const uploaded = await uploadImage(paymentProofFile);
      await addDoc(collection(db, "dropshipper_payments"), {
        dropshipperEmail: paymentForm.dropshipperEmail,
        dropshipperName: paymentForm.dropshipperName,
        amount: Number(paymentForm.amount),
        period: paymentForm.period,
        proofUrl: uploaded.url,
        notes: paymentForm.notes,
        createdAt: serverTimestamp(),
      });
      queryClient.invalidateQueries({ queryKey: ["/admin/dropshipper-payments"] });
      setPaymentForm({ dropshipperEmail: "", dropshipperName: "", amount: "", period: getCurrentPeriod(), notes: "" });
      setPaymentProofFile(null);
      setPaymentProofPreview("");
      if (paymentProofInputRef.current) paymentProofInputRef.current.value = "";
      toast({ title: "Payment record saved successfully" });
    } catch {
      toast({ title: "Failed to save payment", variant: "destructive" });
    } finally {
      setIsUploadingPayment(false);
    }
  }

  const tabs = [
    { id: "applications" as ActiveTab, label: "Applications", badge: counts.pending },
    { id: "orders" as ActiveTab, label: "Dropshipper Orders", badge: orderCounts.pending },
    { id: "payments" as ActiveTab, label: "Payments", badge: 0 },
  ];

  const allFilteredIds = filteredApplications.map((a) => a.id);
  const allSelected =
    allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedApps.has(id));

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
          {
            label: "Total Dropshippers",
            value: counts.approved,
            color: "bg-green-50 text-green-700 border-green-100",
            icon: Users,
          },
          {
            label: "Pending Applications",
            value: counts.pending,
            color: "bg-yellow-50 text-yellow-700 border-yellow-100",
            icon: Clock,
          },
          {
            label: "Total Orders",
            value: orderCounts.total,
            color: "bg-blue-50 text-blue-700 border-blue-100",
            icon: ShoppingCart,
          },
          {
            label: "Total Profit Paid",
            value: `Rs. ${orderCounts.totalProfit.toLocaleString()}`,
            color: "bg-purple-50 text-purple-700 border-purple-100",
            icon: TrendingUp,
          },
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
                <Badge
                  variant="destructive"
                  className="h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full"
                >
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
          {/* Filters row */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search name, email, city..."
                className="pl-9 h-9"
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                data-testid="input-app-search"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 h-9" data-testid="select-filter-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ({counts.all})</SelectItem>
                <SelectItem value="pending">Pending ({counts.pending})</SelectItem>
                <SelectItem value="approved">Approved ({counts.approved})</SelectItem>
                <SelectItem value="rejected">Rejected ({counts.rejected})</SelectItem>
              </SelectContent>
            </Select>

            {selectedApps.size > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-muted-foreground">
                  {selectedApps.size} selected
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs text-green-700 border-green-300 hover:bg-green-50"
                  onClick={() => bulkUpdateStatus("approved")}
                  data-testid="button-bulk-approve"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Approve All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => bulkUpdateStatus("rejected")}
                  data-testid="button-bulk-reject"
                >
                  <XCircle className="h-3.5 w-3.5 mr-1.5" /> Reject All
                </Button>
              </div>
            )}
          </div>

          <div className="bg-card border rounded-xl overflow-hidden">
            {appsLoading ? (
              <div className="flex items-center justify-center py-20 text-muted-foreground">
                Loading applications...
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                <Users className="h-10 w-10 opacity-30" />
                <p className="text-sm">No applications found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={() => toggleSelectAll(allFilteredIds)}
                        className="rounded border-gray-300 h-4 w-4 cursor-pointer"
                        data-testid="checkbox-select-all"
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Exp. Orders</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => {
                    const cfg = statusConfig[app.status] ?? statusConfig.pending;
                    const isSelected = selectedApps.has(app.id);
                    return (
                      <TableRow
                        key={app.id}
                        className={isSelected ? "bg-green-50/50" : ""}
                        data-testid={`row-dropshipper-${app.id}`}
                      >
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectApp(app.id)}
                            className="rounded border-gray-300 h-4 w-4 cursor-pointer"
                            data-testid={`checkbox-app-${app.id}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{app.fullName}</TableCell>
                        <TableCell>
                          <div className="text-sm">{app.email}</div>
                          <div className="text-xs text-muted-foreground">{app.phone}</div>
                          <a
                            href={`https://wa.me/${app.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-green-700 hover:underline mt-0.5"
                            data-testid={`btn-whatsapp-${app.id}`}
                          >
                            <SiWhatsapp className="h-3 w-3" /> WhatsApp
                          </a>
                        </TableCell>
                        <TableCell>
                          {app.city ? (
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              {app.city}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{app.platform}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {app.monthlyOrders || "—"}
                        </TableCell>
                        <TableCell>
                          {app.storeUrl ? (
                            <a
                              href={app.storeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline truncate max-w-[100px] block"
                            >
                              {app.storeUrl}
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[140px] truncate">
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
                                onClick={() =>
                                  updateStatus.mutate({ id: app.id, status: "approved" })
                                }
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
                                onClick={() =>
                                  updateStatus.mutate({ id: app.id, status: "rejected" })
                                }
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
                                onClick={() =>
                                  updateStatus.mutate({ id: app.id, status: "pending" })
                                }
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
          {/* Filters row */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search dropshipper, product..."
                className="pl-9 h-9"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                data-testid="input-order-search"
              />
            </div>
            <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
              <SelectTrigger className="w-40 h-9" data-testid="select-order-status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {orderStatusOptions.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              className="h-9 gap-2 ml-auto"
              onClick={() => exportCSV(filteredOrders)}
              data-testid="button-export-csv"
            >
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>

          <div className="bg-card border rounded-xl overflow-hidden">
            {ordersLoading ? (
              <div className="flex items-center justify-center py-20 text-muted-foreground">
                Loading orders...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                <Package className="h-10 w-10 opacity-30" />
                <p className="text-sm">No orders found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dropshipper</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Wholesale</TableHead>
                    <TableHead>Their Profit</TableHead>
                    <TableHead>Tracking #</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const colorClass =
                      orderStatusColors[order.status] ?? orderStatusColors.pending;
                    const trackingVal =
                      trackingInputs[order.id] !== undefined
                        ? trackingInputs[order.id]
                        : order.trackingNumber || "";
                    const isDirty =
                      trackingInputs[order.id] !== undefined &&
                      trackingInputs[order.id] !== (order.trackingNumber || "");
                    return (
                      <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {order.dropshipperName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {order.dropshipperEmail}
                          </div>
                          <a
                            href={`https://wa.me/${order.customerPhone?.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-green-700 hover:underline mt-0.5"
                          >
                            <SiWhatsapp className="h-3 w-3" /> Customer
                          </a>
                        </TableCell>
                        <TableCell className="text-sm max-w-[120px] truncate font-medium">
                          {order.productName}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{order.customerName}</div>
                          <div className="text-xs text-muted-foreground">
                            {order.customerPhone}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {order.customerCity || "—"}
                        </TableCell>
                        <TableCell className="text-sm">{order.quantity}</TableCell>
                        <TableCell className="text-sm">
                          Rs.{" "}
                          {(order.wholesalePrice * order.quantity).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-green-700">
                          Rs. {order.profit.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Input
                              className="h-7 text-xs w-28 font-mono"
                              placeholder="Enter tracking"
                              value={trackingVal}
                              onChange={(e) =>
                                setTrackingInputs((prev) => ({
                                  ...prev,
                                  [order.id]: e.target.value,
                                }))
                              }
                              data-testid={`input-tracking-${order.id}`}
                            />
                            {isDirty && (
                              <Button
                                size="sm"
                                className="h-7 px-2 text-xs bg-green-700 hover:bg-green-800 text-white"
                                onClick={() =>
                                  updateTracking.mutate({
                                    id: order.id,
                                    trackingNumber: trackingInputs[order.id],
                                  })
                                }
                                disabled={updateTracking.isPending}
                                data-testid={`button-save-tracking-${order.id}`}
                              >
                                Save
                              </Button>
                            )}
                          </div>
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

          {filteredOrders.length > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
              <span>{filteredOrders.length} orders shown</span>
              <span className="font-medium text-green-700">
                Total Profit:{" "}
                Rs.{" "}
                {filteredOrders
                  .filter((o) => o.status !== "cancelled")
                  .reduce((sum, o) => sum + (o.profit || 0), 0)
                  .toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}
      {/* ── PAYMENTS TAB ── */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          {/* Send Payment Form */}
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Banknote className="h-5 w-5 text-green-700" />
              <h3 className="font-bold text-gray-900">Send Payment to Dropshipper</h3>
            </div>
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Dropshipper Email <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={paymentForm.dropshipperEmail}
                    onValueChange={(val) => {
                      const app = applications.find((a) => a.email === val);
                      setPaymentForm((p) => ({
                        ...p,
                        dropshipperEmail: val,
                        dropshipperName: app?.fullName ?? "",
                      }));
                    }}
                  >
                    <SelectTrigger data-testid="select-payment-dropshipper">
                      <SelectValue placeholder="Select dropshipper..." />
                    </SelectTrigger>
                    <SelectContent>
                      {applications
                        .filter((a) => a.status === "approved")
                        .map((a) => (
                          <SelectItem key={a.id} value={a.email}>
                            {a.fullName} — {a.email}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Payment Period (e.g. April 2026)
                  </label>
                  <Input
                    placeholder="e.g. April 2026"
                    value={paymentForm.period}
                    onChange={(e) => setPaymentForm((p) => ({ ...p, period: e.target.value }))}
                    data-testid="input-payment-period"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Amount Paid (Rs.) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="e.g. 5000"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))}
                    data-testid="input-payment-amount"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Notes</label>
                  <Input
                    placeholder="Optional note to dropshipper"
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm((p) => ({ ...p, notes: e.target.value }))}
                    data-testid="input-payment-notes"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Proof Screenshot <span className="text-red-500">*</span>
                </label>
                <div
                  className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-green-400 transition-colors"
                  onClick={() => paymentProofInputRef.current?.click()}
                >
                  {paymentProofPreview ? (
                    <img
                      src={paymentProofPreview}
                      alt="Proof preview"
                      className="max-h-40 rounded-lg object-contain"
                    />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-300" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload payment proof screenshot
                      </p>
                    </>
                  )}
                </div>
                <input
                  ref={paymentProofInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPaymentProofFile(file);
                      setPaymentProofPreview(URL.createObjectURL(file));
                    }
                  }}
                  data-testid="input-payment-proof"
                />
              </div>

              <Button
                type="submit"
                className="bg-green-700 hover:bg-green-800 text-white"
                disabled={isUploadingPayment}
                data-testid="button-submit-payment"
              >
                {isUploadingPayment ? "Uploading & Saving..." : "Send Payment"}
              </Button>
            </form>
          </div>

          {/* Payment Records Table */}
          <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Payment History</h3>
              <span className="text-xs text-muted-foreground">{payments.length} records</span>
            </div>
            {paymentsLoading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                Loading payments...
              </div>
            ) : payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                <Banknote className="h-10 w-10 opacity-30" />
                <p className="text-sm">No payments sent yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dropshipper</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Proof</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id} data-testid={`row-payment-${p.id}`}>
                      <TableCell>
                        <div className="text-sm font-medium">{p.dropshipperName}</div>
                        <div className="text-xs text-muted-foreground">{p.dropshipperEmail}</div>
                      </TableCell>
                      <TableCell className="font-bold text-green-700">
                        Rs. {p.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm">{p.period || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">
                        {p.notes || "—"}
                      </TableCell>
                      <TableCell>
                        {p.proofUrl ? (
                          <a
                            href={p.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            data-testid={`link-proof-${p.id}`}
                          >
                            <ImageIcon className="h-3.5 w-3.5" /> View
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {p.createdAt?.toDate
                          ? p.createdAt.toDate().toLocaleDateString("en-PK")
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
