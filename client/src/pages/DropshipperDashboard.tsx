import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import SEO from "@/components/SEO";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Copy,
  CheckCircle2,
  Clock,
  Truck,
  LogIn,
  LayoutDashboard,
  Search,
  ChevronRight,
  Calculator,
  BarChart3,
  Star,
  ExternalLink,
  Info,
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

interface Product {
  id: string;
  name: string;
  price: number;
  wholesalePrice?: number;
  images: string[];
  inStock: boolean;
  description: string;
  slug: string;
  category?: string;
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

const orderSchema = z.object({
  productId: z.string().min(1, "Please select a product"),
  productName: z.string().min(1),
  wholesalePrice: z.number(),
  salePrice: z.number().min(1, "Enter the price you charged the customer"),
  quantity: z.number().min(1, "Minimum 1").max(100),
  customerName: z.string().min(2, "Enter customer name"),
  customerPhone: z.string().min(10, "Enter customer phone number"),
  customerCity: z.string().min(2, "Enter customer city"),
  customerAddress: z.string().min(10, "Enter full delivery address"),
  notes: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

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

async function fetchProducts(): Promise<Product[]> {
  const q = query(
    collection(db, "products"),
    where("active", "==", true),
    where("inStock", "==", true)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
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

type Tab = "overview" | "catalog" | "place-order" | "my-orders" | "earnings";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["dropshipper-products"],
    queryFn: fetchProducts,
    enabled: application?.status === "approved",
  });

  const { data: myOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["my-dropshipper-orders", user?.email],
    queryFn: () => fetchMyOrders(user!.email!),
    enabled: application?.status === "approved" && !!user?.email,
  });

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      productId: "",
      productName: "",
      wholesalePrice: 0,
      salePrice: 0,
      quantity: 1,
      customerName: "",
      customerPhone: "",
      customerCity: "",
      customerAddress: "",
      notes: "",
    },
  });

  const placeOrder = useMutation({
    mutationFn: async (values: OrderFormValues) => {
      const profit = (values.salePrice - values.wholesalePrice) * values.quantity;
      await addDoc(collection(db, "dropshipper_orders"), {
        ...values,
        profit,
        dropshipperEmail: user?.email,
        dropshipperName: application?.fullName || user?.displayName,
        status: "pending",
        createdAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-dropshipper-orders"] });
      form.reset();
      setSelectedProduct(null);
      setActiveTab("my-orders");
      toast({
        title: "Order placed successfully!",
        description: "We will process and ship it soon.",
      });
    },
    onError: () => {
      toast({ title: "Failed to place order", variant: "destructive" });
    },
  });

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    form.setValue("productId", product.id);
    form.setValue("productName", product.name);
    form.setValue("wholesalePrice", product.wholesalePrice ?? Math.round(product.price * 0.75));
    form.setValue("salePrice", product.price);
    setActiveTab("place-order");
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[]];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
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
    { id: "catalog", label: "Product Catalog", icon: Package },
    { id: "place-order", label: "Place Order", icon: ShoppingCart },
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

            {/* Quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setActiveTab("catalog")}
                className="flex items-center justify-between bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow text-left"
                data-testid="btn-go-catalog"
              >
                <div>
                  <p className="font-semibold text-gray-900">Browse Product Catalog</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {products.length} products available to dropship
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
              <button
                onClick={() => setActiveTab("place-order")}
                className="flex items-center justify-between bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow text-left"
                data-testid="btn-go-place-order"
              >
                <div>
                  <p className="font-semibold text-gray-900">Place a New Order</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Got a customer? Submit their order here.
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
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

        {/* ── PRODUCT CATALOG TAB ── */}
        {activeTab === "catalog" && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-catalog-search"
                />
              </div>
              {categories.length > 1 && (
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40" data-testid="select-category-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">
                        {c === "all" ? "All Categories" : c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <span className="text-sm text-muted-foreground">
                {filteredProducts.length} products
              </span>
            </div>

            {productsLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading products...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No products found.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((product) => {
                  const wholesale =
                    product.wholesalePrice ?? Math.round(product.price * 0.75);
                  const profit = product.price - wholesale;
                  const marginPct = Math.round((profit / product.price) * 100);
                  return (
                    <div
                      key={product.id}
                      className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      data-testid={`card-product-${product.id}`}
                    >
                      <div className="relative">
                        {product.images?.[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-48 object-cover"
                          />
                        )}
                        <div className="absolute top-2 right-2 flex gap-1">
                          <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {marginPct}% margin
                          </span>
                        </div>
                        {product.images?.[0] && (
                          <a
                            href={product.images[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-2 right-2 bg-white/80 hover:bg-white text-gray-700 rounded-md p-1.5 shadow-sm"
                            title="View Full Image"
                            data-testid={`btn-view-image-${product.id}`}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                      <div className="p-4 space-y-3">
                        {product.category && (
                          <span className="text-[10px] uppercase tracking-wide font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                            {product.category}
                          </span>
                        )}
                        <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                          {product.name}
                        </h3>

                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-xs text-muted-foreground">Wholesale</p>
                            <p className="font-bold text-gray-900 text-sm">
                              Rs. {wholesale.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-xs text-muted-foreground">Retail</p>
                            <p className="font-bold text-gray-900 text-sm">
                              Rs. {product.price.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-2">
                            <p className="text-xs text-green-700">Profit</p>
                            <p className="font-bold text-green-700 text-sm">
                              Rs. {profit.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs h-8"
                            onClick={() =>
                              handleCopy(
                                `${product.name}\n\nPrice: Rs. ${product.price.toLocaleString()}\n\n${product.description}`,
                                product.id
                              )
                            }
                            data-testid={`button-copy-${product.id}`}
                          >
                            {copiedId === product.id ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-green-600" />{" "}
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5 mr-1" /> Copy Details
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 text-xs h-8 bg-green-700 hover:bg-green-800 text-white"
                            onClick={() => handleSelectProduct(product)}
                            data-testid={`button-order-${product.id}`}
                          >
                            <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Order
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── PLACE ORDER TAB ── */}
        {activeTab === "place-order" && (
          <div className="max-w-xl">
            <div className="bg-white border rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                Place a Customer Order
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Fill in your customer's details. We will ship the product directly to them.
              </p>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((values) => placeOrder.mutate(values))}
                  className="space-y-4"
                  data-testid="form-place-order"
                >
                  {/* Product selector */}
                  <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-2">
                    <p className="text-xs text-green-700 font-medium mb-2">
                      Selected Product
                    </p>
                    {selectedProduct ? (
                      <div className="flex items-center gap-3">
                        {selectedProduct.images?.[0] && (
                          <img
                            src={selectedProduct.images[0]}
                            className="w-10 h-10 rounded object-cover"
                            alt={selectedProduct.name}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {selectedProduct.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Wholesale: Rs.{" "}
                            {(
                              selectedProduct.wholesalePrice ??
                              Math.round(selectedProduct.price * 0.75)
                            ).toLocaleString()}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="text-xs text-green-700 hover:underline"
                          onClick={() => setActiveTab("catalog")}
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="text-sm text-green-700 hover:underline"
                        onClick={() => setActiveTab("catalog")}
                      >
                        ← Go to Product Catalog to select a product
                      </button>
                    )}
                  </div>

                  {selectedProduct && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="salePrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Your Sale Price (Rs.) *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Price you charged customer"
                                  data-testid="input-sale-price"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="quantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  data-testid="input-quantity"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Profit preview */}
                      {form.watch("salePrice") > 0 && (
                        <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-green-700">Your estimated profit:</span>
                            <span className="font-bold text-green-800">
                              Rs.{" "}
                              {Math.max(
                                0,
                                (form.watch("salePrice") -
                                  (selectedProduct.wholesalePrice ??
                                    Math.round(selectedProduct.price * 0.75))) *
                                  form.watch("quantity")
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="border-t pt-4">
                        <p className="text-sm font-semibold text-gray-700 mb-3">
                          Customer Details
                        </p>
                        <div className="space-y-3">
                          <FormField
                            control={form.control}
                            name="customerName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Customer Full Name *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Muhammad Ali"
                                    data-testid="input-customer-name"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="customerPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Customer Phone *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="+92 3XX XXXXXXX"
                                    data-testid="input-customer-phone"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="customerCity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Customer City *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Karachi, Lahore, Islamabad..."
                                    data-testid="input-customer-city"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="customerAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Delivery Address *</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="House #, Street, Area"
                                    rows={2}
                                    className="resize-none"
                                    data-testid="input-customer-address"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Order Notes (Optional)</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Any special instructions..."
                                    data-testid="input-notes"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-800">
                        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        Once placed, we will process and ship within 1-2 business days.
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-11 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-full"
                        disabled={placeOrder.isPending}
                        data-testid="button-submit-order"
                      >
                        {placeOrder.isPending ? "Placing Order..." : "Place Order"}
                      </Button>
                    </>
                  )}
                </form>
              </Form>
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
              <Button
                size="sm"
                className="bg-green-700 hover:bg-green-800 text-white rounded-full"
                onClick={() => setActiveTab("place-order")}
                data-testid="button-new-order"
              >
                + New Order
              </Button>
            </div>

            {ordersLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading orders...
              </div>
            ) : myOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <ShoppingCart className="h-12 w-12 text-gray-300" />
                <p className="text-muted-foreground">No orders yet.</p>
                <Button
                  className="bg-green-700 hover:bg-green-800 text-white rounded-full"
                  onClick={() => setActiveTab("place-order")}
                >
                  Place Your First Order
                </Button>
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
