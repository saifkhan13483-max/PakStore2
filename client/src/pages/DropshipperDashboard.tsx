import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import SEO from "@/components/SEO";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  CheckCircle2,
  Clock,
  Truck,
  LogIn,
  LayoutDashboard,
  Calculator,
  BarChart3,
  Star,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

interface DropshipperApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city?: string;
  platform: string;
  status: "pending" | "approved" | "rejected";
}

interface DropshipperOrder {
  id: string;
  productName: string;
  customerName: string;
  customerPhone: string;
  quantity: number;
  salePrice: number;
  wholesalePrice: number;
  profit: number;
  status: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: any;
}

async function fetchApplication(email: string): Promise<DropshipperApplication | null> {
  const q = query(
    collection(db, "dropshipper_applications"),
    where("email", "==", email),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as DropshipperApplication;
}

async function fetchMyOrders(email: string): Promise<DropshipperOrder[]> {
  const q = query(
    collection(db, "dropshipper_orders"),
    where("dropshipperEmail", "==", email),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as DropshipperOrder));
}

const orderStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-700" },
  shipped: { label: "Shipped", color: "bg-purple-100 text-purple-700" },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700" },
};

type Tab = "overview" | "my-orders" | "earnings";

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(key: string) {
  const [year, month] = key.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleDateString("en-PK", {
    month: "long",
    year: "numeric",
  });
}

export default function DropshipperDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  // Profit calculator state
  const [calcWholesale, setCalcWholesale] = useState(500);
  const [calcSalePrice, setCalcSalePrice] = useState(800);
  const [calcQty, setCalcQty] = useState(10);

  const { data: application, isLoading: appLoading } = useQuery({
    queryKey: ["dropshipper-application", user?.email],
    queryFn: () => fetchApplication(user!.email!),
    enabled: !!user?.email,
  });

  const { data: myOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["my-dropshipper-orders", user?.email],
    queryFn: () => fetchMyOrders(user!.email!),
    enabled: application?.status === "approved" && !!user?.email,
  });

  const filteredOrders =
    orderStatusFilter === "all"
      ? myOrders
      : myOrders.filter((o) => o.status === orderStatusFilter);

  const totalProfit = myOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.profit || 0), 0);

  const deliveredOrders = myOrders.filter((o) => o.status === "delivered").length;
  const totalOrders = myOrders.length;
  const pendingOrders = myOrders.filter((o) => o.status === "pending").length;

  const thisMonthKey = getMonthKey(new Date());
  const thisMonthProfit = myOrders
    .filter((o) => {
      if (!o.createdAt?.toDate) return false;
      return getMonthKey(o.createdAt.toDate()) === thisMonthKey && o.status !== "cancelled";
    })
    .reduce((sum, o) => sum + (o.profit || 0), 0);

  // Monthly earnings breakdown
  const earningsByMonth = myOrders
    .filter((o) => o.status !== "cancelled" && o.createdAt?.toDate)
    .reduce<Record<string, { orders: number; profit: number }>>((acc, o) => {
      const key = getMonthKey(o.createdAt.toDate());
      if (!acc[key]) acc[key] = { orders: 0, profit: 0 };
      acc[key].orders += 1;
      acc[key].profit += o.profit || 0;
      return acc;
    }, {});

  const earningsMonths = Object.keys(earningsByMonth).sort().reverse();

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <SEO
          title="Dropshipper Dashboard - PakCart"
          description="Manage your dropshipping business."
          url="https://pakcart.store/dropshipper/dashboard"
          robots="noindex"
        />
        <LogIn className="h-14 w-14 text-green-600 opacity-60" />
        <h2 className="text-2xl font-bold text-gray-900">Login Required</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          Please log in to access your dropshipper dashboard.
        </p>
        <Link href="/auth/login">
          <Button className="bg-green-700 hover:bg-green-800 text-white rounded-full px-8">
            Log In
          </Button>
        </Link>
      </div>
    );
  }

  if (appLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-muted-foreground">Loading your account...</div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <SEO
          title="Dropshipper Dashboard - PakCart"
          description=""
          url="https://pakcart.store/dropshipper/dashboard"
          robots="noindex"
        />
        <Package className="h-14 w-14 text-green-600 opacity-60" />
        <h2 className="text-2xl font-bold text-gray-900">No Application Found</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          We couldn't find a dropshipper application for{" "}
          <strong>{user?.email}</strong>. Please apply first.
        </p>
        <Link href="/dropshipper">
          <Button className="bg-green-700 hover:bg-green-800 text-white rounded-full px-8">
            Apply Now
          </Button>
        </Link>
      </div>
    );
  }

  if (application.status === "pending") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <SEO
          title="Dropshipper Dashboard - PakCart"
          description=""
          url="https://pakcart.store/dropshipper/dashboard"
          robots="noindex"
        />
        <Clock className="h-14 w-14 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-900">Application Under Review</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          Your application is being reviewed. We'll contact you within 24 hours on{" "}
          <strong>{application.phone}</strong>.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-6 py-4 text-center max-w-sm">
          <p className="text-sm text-yellow-800 font-medium">Status: Pending Review</p>
          <p className="text-xs text-yellow-700 mt-1">
            Submitted as: {application.fullName}
          </p>
        </div>
        <a
          href="https://wa.me/923188055850"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            variant="outline"
            className="border-green-300 text-green-700 hover:bg-green-50 rounded-full"
          >
            <SiWhatsapp className="h-4 w-4 mr-2" /> WhatsApp Support
          </Button>
        </a>
      </div>
    );
  }

  if (application.status === "rejected") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <SEO
          title="Dropshipper Dashboard - PakCart"
          description=""
          url="https://pakcart.store/dropshipper/dashboard"
          robots="noindex"
        />
        <div className="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-red-600 text-2xl font-bold">✕</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Application Not Approved</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          Unfortunately your application was not approved at this time. Please contact us at{" "}
          <a
            href="mailto:contact@pakcart.store"
            className="text-green-700 hover:underline"
          >
            contact@pakcart.store
          </a>{" "}
          for more information.
        </p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "my-orders", label: "My Orders", icon: Truck },
    { id: "earnings", label: "Earnings", icon: BarChart3 },
  ];

  return (
    <>
      <SEO
        title="Dropshipper Dashboard - PakCart"
        description="Manage your dropshipping business."
        url="https://pakcart.store/dropshipper/dashboard"
        robots="noindex"
      />

      {/* Header */}
      <div className="bg-green-700 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-green-200 text-sm">Welcome back,</p>
              <h1 className="text-2xl font-bold">{application.fullName}</h1>
              <p className="text-green-200 text-xs mt-0.5">{user?.email}</p>
            </div>
            <div className="flex items-center gap-3">
              {application.city && (
                <span className="text-green-200 text-xs">{application.city}</span>
              )}
              <Badge className="bg-green-500 text-white border-0 px-3 py-1 text-sm">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                Approved Dropshipper
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b bg-white sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-green-600 text-green-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                data-testid={`tab-${tab.id}`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.id === "my-orders" && pendingOrders > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {pendingOrders}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div className="space-y-6 max-w-4xl">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white border rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Total Orders</span>
                  <ShoppingCart className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
              </div>
              <div className="bg-white border rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{pendingOrders}</p>
              </div>
              <div className="bg-white border rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Delivered</span>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{deliveredOrders}</p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-green-700">This Month</span>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-700">
                  Rs. {thisMonthProfit.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Total profit banner */}
            <div className="bg-green-700 rounded-xl p-5 text-white flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-green-200 text-sm">Total Profit Earned (All Time)</p>
                <p className="text-3xl font-bold mt-1">Rs. {totalProfit.toLocaleString()}</p>
              </div>
              <Button
                className="bg-white text-green-800 hover:bg-green-50 rounded-full px-6"
                onClick={() => setActiveTab("earnings")}
              >
                <BarChart3 className="h-4 w-4 mr-2" /> View Earnings
              </Button>
            </div>

            {/* Profit Calculator */}
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Calculator className="h-5 w-5 text-green-700" />
                <h3 className="font-bold text-gray-900">Profit Calculator</h3>
                <span className="text-xs text-muted-foreground ml-1">Estimate your earnings</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Wholesale Price (Rs.)
                  </label>
                  <Input
                    type="number"
                    value={calcWholesale}
                    onChange={(e) => setCalcWholesale(Number(e.target.value))}
                    className="h-9"
                    data-testid="calc-wholesale"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Your Sale Price (Rs.)
                  </label>
                  <Input
                    type="number"
                    value={calcSalePrice}
                    onChange={(e) => setCalcSalePrice(Number(e.target.value))}
                    className="h-9"
                    data-testid="calc-sale-price"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Orders per Month
                  </label>
                  <Input
                    type="number"
                    value={calcQty}
                    onChange={(e) => setCalcQty(Number(e.target.value))}
                    className="h-9"
                    data-testid="calc-qty"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Profit / Order</p>
                  <p className="font-bold text-gray-900">
                    Rs. {Math.max(0, calcSalePrice - calcWholesale).toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-700 mb-1">Monthly Profit</p>
                  <p className="font-bold text-green-700">
                    Rs. {Math.max(0, (calcSalePrice - calcWholesale) * calcQty).toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-700 mb-1">Annual Profit</p>
                  <p className="font-bold text-green-700">
                    Rs. {Math.max(0, (calcSalePrice - calcWholesale) * calcQty * 12).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-green-50 border border-green-100 rounded-xl p-6">
              <h3 className="font-bold text-green-900 mb-4">How to Start Earning</h3>
              <ol className="space-y-3">
                {[
                  "Go to Product Catalog and browse available products.",
                  "Copy product details (name, description, price) and post them on your store/page.",
                  "When a customer orders from you, come here and place the order.",
                  "We pack and ship directly to your customer. You keep the profit.",
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-700 text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-green-800">{text}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Contact */}
            <div className="bg-white border rounded-xl p-5 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                <SiWhatsapp className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Need Help?</p>
                <p className="text-sm text-muted-foreground mt-1">
                  WhatsApp us at{" "}
                  <a
                    href="https://wa.me/923188055850"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 font-medium hover:underline"
                  >
                    +92 318 8055850
                  </a>{" "}
                  for any order queries, returns, or product questions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── MY ORDERS TAB ── */}
        {activeTab === "my-orders" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-lg font-bold text-gray-900">My Orders</h2>
                <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                  <SelectTrigger className="w-36 h-8 text-xs" data-testid="select-order-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {ordersLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading orders...
              </div>
            ) : myOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <ShoppingCart className="h-12 w-12 text-gray-300" />
                <p className="text-muted-foreground">No orders yet.</p>
              </div>
            ) : (
              <>
                {/* Summary bar */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white border rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Showing</p>
                    <p className="font-bold text-gray-900">{filteredOrders.length}</p>
                  </div>
                  <div className="bg-white border rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Delivered</p>
                    <p className="font-bold text-green-700">{deliveredOrders}</p>
                  </div>
                  <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
                    <p className="text-xs text-green-700">Total Profit</p>
                    <p className="font-bold text-green-700">Rs. {totalProfit.toLocaleString()}</p>
                  </div>
                </div>

                <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Your Profit</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tracking</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => {
                        const statusCfg =
                          orderStatusConfig[order.status] ?? orderStatusConfig.pending;
                        return (
                          <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                            <TableCell className="font-medium text-sm max-w-[140px] truncate">
                              {order.productName}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{order.customerName}</div>
                              <div className="text-xs text-muted-foreground">
                                {order.customerPhone}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {(order as any).customerCity || "—"}
                            </TableCell>
                            <TableCell className="text-sm">{order.quantity}</TableCell>
                            <TableCell className="text-sm font-semibold text-green-700">
                              Rs. {order.profit.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`text-xs font-medium px-2 py-1 rounded-full ${statusCfg.color}`}
                              >
                                {statusCfg.label}
                              </span>
                            </TableCell>
                            <TableCell>
                              {order.trackingNumber ? (
                                <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-800">
                                  {order.trackingNumber}
                                </span>
                              ) : order.status === "shipped" ? (
                                <span className="text-xs text-yellow-600">Pending</span>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
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
                </div>
              </>
            )}
          </div>
        )}

        {/* ── EARNINGS TAB ── */}
        {activeTab === "earnings" && (
          <div className="space-y-6 max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-green-700 text-white rounded-xl p-5 shadow-sm">
                <p className="text-green-200 text-sm">All-Time Profit</p>
                <p className="text-3xl font-bold mt-1">
                  Rs. {totalProfit.toLocaleString()}
                </p>
              </div>
              <div className="bg-white border rounded-xl p-5 shadow-sm">
                <p className="text-muted-foreground text-sm">This Month</p>
                <p className="text-3xl font-bold text-green-700 mt-1">
                  Rs. {thisMonthProfit.toLocaleString()}
                </p>
              </div>
              <div className="bg-white border rounded-xl p-5 shadow-sm">
                <p className="text-muted-foreground text-sm">Delivered Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{deliveredOrders}</p>
              </div>
            </div>

            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b">
                <h3 className="font-bold text-gray-900">Monthly Earnings Breakdown</h3>
              </div>
              {earningsMonths.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                  <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No earnings data yet. Place your first order!</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Profit Earned</TableHead>
                      <TableHead>Avg per Order</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {earningsMonths.map((month) => {
                      const data = earningsByMonth[month];
                      const isCurrentMonth = month === thisMonthKey;
                      return (
                        <TableRow
                          key={month}
                          className={isCurrentMonth ? "bg-green-50" : ""}
                          data-testid={`row-earnings-${month}`}
                        >
                          <TableCell className="font-medium">
                            {getMonthLabel(month)}
                            {isCurrentMonth && (
                              <Badge className="ml-2 bg-green-100 text-green-700 border-0 text-[10px]">
                                Current
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{data.orders}</TableCell>
                          <TableCell className="font-semibold text-green-700">
                            Rs. {data.profit.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            Rs.{" "}
                            {Math.round(data.profit / data.orders).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Tip */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <Star className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <strong>Pro Tip:</strong> Post products in WhatsApp groups and Facebook
                communities in your city for faster sales. Consistent daily posts lead to
                5–10x more orders each month.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
