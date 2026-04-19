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
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

interface DropshipperApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
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

type Tab = "overview" | "catalog" | "place-order" | "my-orders";

export default function DropshipperDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
      toast({ title: "Order placed successfully!", description: "We will process and ship it soon." });
    },
    onError: () => {
      toast({ title: "Failed to place order", variant: "destructive" });
    },
  });

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    form.setValue("productId", product.id);
    form.setValue("productName", product.name);
    form.setValue("wholesalePrice", product.wholesalePrice ?? product.price);
    form.setValue("salePrice", product.price);
    setActiveTab("place-order");
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalProfit = myOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.profit || 0), 0);

  const totalOrders = myOrders.length;
  const pendingOrders = myOrders.filter((o) => o.status === "pending").length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <SEO title="Dropshipper Dashboard - PakCart" description="Manage your dropshipping business." url="https://pakcart.store/dropshipper/dashboard" robots="noindex" />
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
        <SEO title="Dropshipper Dashboard - PakCart" description="" url="https://pakcart.store/dropshipper/dashboard" robots="noindex" />
        <Package className="h-14 w-14 text-green-600 opacity-60" />
        <h2 className="text-2xl font-bold text-gray-900">No Application Found</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          We couldn't find a dropshipper application for <strong>{user?.email}</strong>. Please apply first.
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
        <SEO title="Dropshipper Dashboard - PakCart" description="" url="https://pakcart.store/dropshipper/dashboard" robots="noindex" />
        <Clock className="h-14 w-14 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-900">Application Under Review</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          Your application is being reviewed. We'll contact you within 24 hours on <strong>{application.phone}</strong>.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-6 py-4 text-center max-w-sm">
          <p className="text-sm text-yellow-800 font-medium">Status: Pending Review</p>
          <p className="text-xs text-yellow-700 mt-1">Submitted as: {application.fullName}</p>
        </div>
      </div>
    );
  }

  if (application.status === "rejected") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <SEO title="Dropshipper Dashboard - PakCart" description="" url="https://pakcart.store/dropshipper/dashboard" robots="noindex" />
        <div className="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-red-600 text-2xl font-bold">✕</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Application Not Approved</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          Unfortunately your application was not approved at this time. Please contact us at{" "}
          <a href="mailto:contact@pakcart.store" className="text-green-700 hover:underline">
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
            <Badge className="bg-green-500 text-white border-0 px-3 py-1 text-sm">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              Approved Dropshipper
            </Badge>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Total Orders</span>
                  <ShoppingCart className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
              </div>
              <div className="bg-white border rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Pending Orders</span>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{pendingOrders}</p>
              </div>
              <div className="bg-white border rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Total Profit Earned</span>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-700">
                  Rs. {totalProfit.toLocaleString()}
                </p>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-green-50 border border-green-100 rounded-xl p-6">
              <h3 className="font-bold text-green-900 mb-4">How to Start Earning</h3>
              <ol className="space-y-3">
                {[
                  { step: "1", text: "Go to Product Catalog and browse available products." },
                  { step: "2", text: "Copy product details (name, description, price) and post them on your store/page." },
                  { step: "3", text: "When a customer orders from you, come here and place the order." },
                  { step: "4", text: "We pack and ship directly to your customer. You keep the profit." },
                ].map((item) => (
                  <li key={item.step} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-700 text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                      {item.step}
                    </span>
                    <span className="text-sm text-green-800">{item.text}</span>
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
              <span className="text-sm text-muted-foreground">
                {filteredProducts.length} products
              </span>
            </div>

            {productsLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading products...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No products found.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((product) => {
                  const wholesale = product.wholesalePrice ?? Math.round(product.price * 0.75);
                  const profit = product.price - wholesale;
                  return (
                    <div
                      key={product.id}
                      className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      data-testid={`card-product-${product.id}`}
                    >
                      {product.images?.[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4 space-y-3">
                        <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                          {product.name}
                        </h3>

                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-xs text-muted-foreground">Wholesale</p>
                            <p className="font-bold text-gray-900 text-sm">Rs. {wholesale.toLocaleString()}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-xs text-muted-foreground">Retail</p>
                            <p className="font-bold text-gray-900 text-sm">Rs. {product.price.toLocaleString()}</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-2">
                            <p className="text-xs text-green-700">Profit</p>
                            <p className="font-bold text-green-700 text-sm">Rs. {profit.toLocaleString()}</p>
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
                              <><CheckCircle2 className="h-3.5 w-3.5 mr-1 text-green-600" /> Copied!</>
                            ) : (
                              <><Copy className="h-3.5 w-3.5 mr-1" /> Copy Details</>
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
              <h2 className="text-lg font-bold text-gray-900 mb-1">Place a Customer Order</h2>
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
                    <p className="text-xs text-green-700 font-medium mb-2">Selected Product</p>
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
                            Wholesale: Rs. {(selectedProduct.wholesalePrice ?? Math.round(selectedProduct.price * 0.75)).toLocaleString()}
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
                              Rs. {Math.max(0, (form.watch("salePrice") - (selectedProduct.wholesalePrice ?? Math.round(selectedProduct.price * 0.75))) * form.watch("quantity")).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="border-t pt-4">
                        <p className="text-sm font-semibold text-gray-700 mb-3">Customer Details</p>
                        <div className="space-y-3">
                          <FormField
                            control={form.control}
                            name="customerName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Customer Full Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Muhammad Ali" data-testid="input-customer-name" {...field} />
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
                                  <Input placeholder="+92 3XX XXXXXXX" data-testid="input-customer-phone" {...field} />
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
                                    placeholder="House #, Street, Area, City"
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
                                  <Input placeholder="Any special instructions..." data-testid="input-notes" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
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
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">My Orders</h2>
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
              <div className="text-center py-12 text-muted-foreground">Loading orders...</div>
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
              <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Sale Price</TableHead>
                      <TableHead>Your Profit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myOrders.map((order) => {
                      const statusCfg = orderStatusConfig[order.status] ?? orderStatusConfig.pending;
                      return (
                        <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                          <TableCell className="font-medium text-sm max-w-[160px] truncate">
                            {order.productName}
                          </TableCell>
                          <TableCell className="text-sm">{order.customerName}</TableCell>
                          <TableCell className="text-sm">{order.quantity}</TableCell>
                          <TableCell className="text-sm">
                            Rs. {(order.salePrice * order.quantity).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm font-semibold text-green-700">
                            Rs. {order.profit.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusCfg.color}`}>
                              {statusCfg.label}
                            </span>
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
            )}
          </div>
        )}
      </div>
    </>
  );
}
