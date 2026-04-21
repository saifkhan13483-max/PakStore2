import SEO from "@/components/SEO";
import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  MessageSquare, RefreshCw, Loader2, Star, CheckCircle, ShieldCheck,
  ThumbsUp, Store, Trash2, Play, Eye, XCircle, AlertTriangle,
  Package, BarChart3, Clock, Users, Download, Upload, Zap,
  TrendingUp, ShieldAlert, Bell, Wrench,
} from "lucide-react";
import {
  getSeededStats, getSeedLogs, generateCommentPreview, countSeededAll,
  countSeededByCategory, countSeededOlderThan,
  seedAllProducts, seedEmptyProducts, seedByCategory, seedSingleProduct,
  clearAllSeeded, clearSeededByCategory, clearSeededOlderThan,
  DEFAULT_SEED_OPTIONS,
  type SeedOptions, type SeedProgress, type SeedLog, type PreviewComment,
} from "@/lib/seed-comments";
import { type ProductCategory } from "@/lib/seed-data/review-templates";
import { fetchAnalyticsData } from "@/lib/seed-data/analytics";
import { detectStaleProducts, detectNewUnseededProducts } from "@/lib/seed-data/auto-refresh";
import { SeedAnalytics } from "@/components/admin/SeedAnalytics";
import { SeedHealthScore } from "@/components/admin/SeedHealthScore";
import { ProductBreakdownTable } from "@/components/admin/ProductBreakdownTable";
import { CommentAudit } from "@/components/admin/CommentAudit";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "bags", label: "Women's Bags" },
  { value: "watches", label: "Men's Watches" },
  { value: "slippers", label: "Slippers" },
  { value: "shoes", label: "Shoes" },
  { value: "clothing", label: "Clothing" },
  { value: "general", label: "General / Other" },
];

const RATING_BIAS_LABELS: Record<SeedOptions["ratingBias"], string> = {
  realistic: "Realistic Mix (45% 5★ → 2% 1★)",
  positive: "Mostly Positive (60% 5★, no 1★)",
  very_positive: "Very Positive (80% 5★, min 3★)",
};

const SCOPE_LABELS = {
  all: "All Products",
  empty_only: "Empty Products Only",
  category: "Specific Category",
  single_product: "Single Product",
} as const;

type SeedScope = keyof typeof SCOPE_LABELS;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn("h-3 w-3", s <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")}
        />
      ))}
    </span>
  );
}

function ProgressBar({ progress }: { progress: SeedProgress }) {
  const pct = progress.total === 0 ? 0 : Math.round((progress.current / progress.total) * 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          {progress.done
            ? "Seeding complete"
            : `Seeding: ${progress.currentProductName || "…"}`}
        </span>
        <span>{progress.current} / {progress.total}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          {progress.commentsCreated} comments created
        </span>
        {progress.errors.length > 0 && (
          <span className="flex items-center gap-1 text-destructive">
            <AlertTriangle className="h-3 w-3" />
            {progress.errors.length} error{progress.errors.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}

function PreviewCard({ comment }: { comment: PreviewComment }) {
  return (
    <div className="border rounded-lg p-4 space-y-2 bg-card">
      <div className="flex items-start gap-3">
        <img
          src={comment.userPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userName}`}
          alt={comment.userName}
          className="w-9 h-9 rounded-full border bg-muted shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-sm">{comment.userName}</span>
            {comment.isVerifiedPurchase && (
              <Badge variant="outline" className="text-xs text-green-600 border-green-300 bg-green-50 dark:bg-green-950/20 gap-1">
                <CheckCircle className="h-3 w-3" />
                Verified Purchase
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <StarRow rating={comment.rating} />
            <span className="text-xs text-muted-foreground">
              {comment.createdAt.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>
      <p className="text-sm text-foreground/90 leading-relaxed">{comment.content}</p>
      {comment.helpfulCount > 0 && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <ThumbsUp className="h-3 w-3" />
          {comment.helpfulCount} people found this helpful
        </p>
      )}
      {comment.sellerReply && (
        <div className="ml-4 border-l-2 border-primary/30 pl-3 mt-2 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
            <Store className="h-3 w-3" />
            PakCart Store
          </div>
          <p className="text-xs text-foreground/80">{comment.sellerReply}</p>
        </div>
      )}
    </div>
  );
}

function SeedHistoryRow({ log }: { log: SeedLog }) {
  const date = log.timestamp?.seconds
    ? new Date(log.timestamp.seconds * 1000).toLocaleString("en-PK", {
        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : "—";

  return (
    <TableRow>
      <TableCell>
        <Badge variant={log.action === "seed" ? "default" : "destructive"} className="capitalize text-xs">
          {log.action}
        </Badge>
      </TableCell>
      <TableCell className="text-sm">{date}</TableCell>
      <TableCell className="text-sm text-muted-foreground capitalize">
        {SCOPE_LABELS[log.scope] ?? log.scope}
        {log.scopeDetail && (
          <span className="ml-1 text-xs">({log.scopeDetail})</span>
        )}
      </TableCell>
      <TableCell className="text-sm text-center">
        {log.commentsCreated > 0 ? (
          <span className="text-green-600 font-medium">+{log.commentsCreated}</span>
        ) : "—"}
      </TableCell>
      <TableCell className="text-sm text-center">
        {log.commentsDeleted > 0 ? (
          <span className="text-destructive font-medium">-{log.commentsDeleted}</span>
        ) : "—"}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">
        {log.adminEmail}
      </TableCell>
    </TableRow>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function AdminSeedComments() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const importInputRef = useRef<HTMLInputElement>(null);

  // ── Settings ──────────────────────────────────────────────────────────────
  const [settings, setSettings] = useState<SeedOptions>({ ...DEFAULT_SEED_OPTIONS });
  const [commentsPerProductInput, setCommentsPerProductInput] = useState<string>("random");
  const [scope, setScope] = useState<SeedScope>("all");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>("bags");
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  // ── Seeding state ─────────────────────────────────────────────────────────
  const [isSeeding, setIsSeeding] = useState(false);
  const [progress, setProgress] = useState<SeedProgress | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [seedResult, setSeedResult] = useState<{ created: number; errors: string[] } | null>(null);

  // ── Preview state ─────────────────────────────────────────────────────────
  const [preview, setPreview] = useState<PreviewComment[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  // ── Delete dialog ─────────────────────────────────────────────────────────
  const [deleteDialog, setDeleteDialog] = useState<{
    type: "all" | "category" | "older_than";
    label: string;
    count: number;
    categoryId?: ProductCategory;
    olderThanDate?: Date;
  } | null>(null);
  const [deleteTyped, setDeleteTyped] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Cleanup form state ────────────────────────────────────────────────────
  const [cleanupCategory, setCleanupCategory] = useState<ProductCategory>("bags");
  const [cleanupOlderThanDays, setCleanupOlderThanDays] = useState<string>("60");

  // ── Phase 5: stale refresh state ─────────────────────────────────────────
  const [isRefreshingStale, setIsRefreshingStale] = useState(false);
  const [isSeedingNew, setIsSeedingNew] = useState(false);

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["seeded-stats"],
    queryFn: getSeededStats,
    staleTime: 30_000,
  });

  const { data: seedLogs, isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ["seed-logs"],
    queryFn: getSeedLogs,
    staleTime: 30_000,
  });

  const { data: allProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["all-products-seed-page"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "products"));
      return snap.docs.map((d) => ({ id: d.id, name: String(d.data().name ?? "Untitled") }));
    },
    staleTime: 60_000,
  });

  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
  } = useQuery({
    queryKey: ["analytics-data"],
    queryFn: fetchAnalyticsData,
    staleTime: 60_000,
  });

  // ── Derived helpers ────────────────────────────────────────────────────────
  const adminUser = { uid: user?.uid ?? "", email: user?.email ?? null };

  const staleProducts = analyticsData
    ? detectStaleProducts(analyticsData.perProduct)
    : [];
  const newUnseeded = analyticsData
    ? detectNewUnseededProducts(analyticsData.perProduct)
    : [];

  const updateSetting = <K extends keyof SeedOptions>(key: K, val: SeedOptions[K]) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  const handleCommentsPerProductChange = (val: string) => {
    setCommentsPerProductInput(val);
    if (val === "random") {
      updateSetting("commentsPerProduct", "random");
    } else {
      const n = parseInt(val, 10);
      if (!isNaN(n) && n >= 1 && n <= 10) updateSetting("commentsPerProduct", n);
    }
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["seeded-stats"] });
    queryClient.invalidateQueries({ queryKey: ["seed-logs"] });
    queryClient.invalidateQueries({ queryKey: ["analytics-data"] });
  };

  // ── Preview ────────────────────────────────────────────────────────────────
  const handlePreview = () => {
    setPreviewLoading(true);
    setTimeout(() => {
      setPreview(generateCommentPreview(settings, 4));
      setPreviewLoading(false);
    }, 200);
  };

  // ── Seeding ────────────────────────────────────────────────────────────────
  const handleSeed = async () => {
    if (isSeeding) return;
    const ac = new AbortController();
    abortControllerRef.current = ac;
    setIsSeeding(true);
    setProgress({ current: 0, total: 0, currentProductName: "Loading products…", commentsCreated: 0, errors: [], done: false });
    setSeedResult(null);

    try {
      let result: { created: number; errors: string[] };
      const onProgress = (p: SeedProgress) => setProgress(p);

      if (scope === "all") {
        result = await seedAllProducts(settings, adminUser, onProgress, ac.signal);
      } else if (scope === "empty_only") {
        result = await seedEmptyProducts(settings, adminUser, onProgress, ac.signal);
      } else if (scope === "category") {
        result = await seedByCategory(selectedCategory, settings, adminUser, onProgress, ac.signal);
      } else {
        if (!selectedProductId) {
          toast({ variant: "destructive", title: "No product selected", description: "Please select a product to seed." });
          setIsSeeding(false);
          return;
        }
        result = await seedSingleProduct(selectedProductId, settings, adminUser, onProgress, ac.signal);
      }

      setSeedResult(result);
      invalidateAll();
      toast({
        title: "Seeding complete!",
        description: `${result.created} comments created${result.errors.length > 0 ? `, ${result.errors.length} error(s)` : ""}.`,
      });
    } catch (e: any) {
      if (e.name === "AbortError") {
        toast({ title: "Seeding cancelled", description: "Operation was stopped." });
      } else {
        toast({ variant: "destructive", title: "Seeding failed", description: e.message });
      }
    } finally {
      setIsSeeding(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
  };

  // ── Phase 5: Refresh stale products ───────────────────────────────────────
  const handleRefreshStale = async () => {
    if (!staleProducts.length) return;
    setIsRefreshingStale(true);
    const ac = new AbortController();
    let totalCreated = 0;
    try {
      for (const sp of staleProducts) {
        const result = await seedSingleProduct(sp.productId, settings, adminUser, () => {}, ac.signal);
        totalCreated += result.created;
      }
      invalidateAll();
      toast({
        title: "Stale products refreshed!",
        description: `${staleProducts.length} products re-seeded, ${totalCreated} new comments created.`,
      });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Refresh failed", description: e.message });
    } finally {
      setIsRefreshingStale(false);
    }
  };

  // ── Phase 5: Seed new unseeded products ────────────────────────────────────
  const handleSeedNew = async () => {
    if (!newUnseeded.length) return;
    setIsSeedingNew(true);
    const ac = new AbortController();
    let totalCreated = 0;
    try {
      for (const p of newUnseeded) {
        const result = await seedSingleProduct(p.productId, settings, adminUser, () => {}, ac.signal);
        totalCreated += result.created;
      }
      invalidateAll();
      toast({
        title: "New products seeded!",
        description: `${newUnseeded.length} products seeded, ${totalCreated} new comments created.`,
      });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Seeding failed", description: e.message });
    } finally {
      setIsSeedingNew(false);
    }
  };

  // ── Delete confirmation ────────────────────────────────────────────────────
  const openDeleteDialog = async (type: "all" | "category" | "older_than") => {
    let count = 0;
    let label = "";
    let categoryId: ProductCategory | undefined;
    let olderThanDate: Date | undefined;

    if (type === "all") {
      count = await countSeededAll();
      label = "all seeded comments";
    } else if (type === "category") {
      count = await countSeededByCategory(cleanupCategory);
      label = `seeded comments in "${CATEGORIES.find((c) => c.value === cleanupCategory)?.label}"`;
      categoryId = cleanupCategory;
    } else {
      const days = parseInt(cleanupOlderThanDays, 10) || 60;
      const date = new Date(Date.now() - days * 86_400_000);
      count = await countSeededOlderThan(date);
      label = `seeded comments older than ${days} days`;
      olderThanDate = date;
    }

    setDeleteDialog({ type, label, count, categoryId, olderThanDate });
    setDeleteTyped("");
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    setIsDeleting(true);
    try {
      let deleted = 0;
      if (deleteDialog.type === "all") {
        deleted = await clearAllSeeded(adminUser);
      } else if (deleteDialog.type === "category" && deleteDialog.categoryId) {
        deleted = await clearSeededByCategory(deleteDialog.categoryId, adminUser);
      } else if (deleteDialog.type === "older_than" && deleteDialog.olderThanDate) {
        deleted = await clearSeededOlderThan(deleteDialog.olderThanDate, adminUser);
      }
      toast({ title: "Deleted!", description: `${deleted} seeded comments removed.` });
      invalidateAll();
      setDeleteDialog(null);
      setDeleteTyped("");
    } catch (e: any) {
      toast({ variant: "destructive", title: "Delete failed", description: e.message });
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Phase 5: Export / Import ───────────────────────────────────────────────
  const handleExport = () => {
    const exportData = {
      version: "phase5",
      exportedAt: new Date().toISOString(),
      settings,
      seedLogs: seedLogs ?? [],
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pakstore-seed-config-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Exported!", description: "Seed config downloaded as JSON." });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.settings) {
          setSettings({ ...DEFAULT_SEED_OPTIONS, ...data.settings });
          if (data.settings.commentsPerProduct === "random") {
            setCommentsPerProductInput("random");
          } else if (typeof data.settings.commentsPerProduct === "number") {
            setCommentsPerProductInput(String(data.settings.commentsPerProduct));
          }
          toast({ title: "Config imported!", description: "Settings restored from config file." });
        } else {
          toast({ variant: "destructive", title: "Invalid config", description: "No settings found in the uploaded file." });
        }
      } catch {
        toast({ variant: "destructive", title: "Import failed", description: "The file is not valid JSON." });
      }
    };
    reader.readAsText(file);
    if (importInputRef.current) importInputRef.current.value = "";
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <SEO
        title="Seed Comments | Admin — PakCart"
        description="Manage seeded product reviews for PakCart admin panel."
      />

      <div className="p-6 space-y-8 max-w-6xl mx-auto">

        {/* Page Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              Seed Comments
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Generate and manage realistic seeded product reviews
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              data-testid="button-export-config"
              title="Export seed config"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Config
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => importInputRef.current?.click()}
              data-testid="button-import-config"
              title="Import seed config"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <input
              ref={importInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportFile}
              data-testid="input-import-file"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => { refetchStats(); refetchLogs(); refetchAnalytics(); }}
              data-testid="button-refresh-stats"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* ── Phase 5: Auto-refresh notifications ─────────────────────────── */}
        {(staleProducts.length > 0 || newUnseeded.length > 0) && (
          <div className="space-y-3">
            {staleProducts.length > 0 && (
              <div className="flex items-start gap-3 rounded-lg border border-amber-300/50 bg-amber-50/50 dark:bg-amber-950/10 p-4">
                <Bell className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    {staleProducts.length} product{staleProducts.length !== 1 ? "s" : ""} with stale reviews (60+ days old)
                  </p>
                  <p className="text-xs text-amber-700/80 dark:text-amber-400/80">
                    {staleProducts.slice(0, 3).map((p) => p.productName).join(", ")}
                    {staleProducts.length > 3 && ` and ${staleProducts.length - 3} more`}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 border-amber-400 text-amber-700 hover:bg-amber-100 dark:text-amber-400"
                  onClick={handleRefreshStale}
                  disabled={isRefreshingStale}
                  data-testid="button-refresh-stale"
                >
                  {isRefreshingStale ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Zap className="h-4 w-4 mr-1" />
                  )}
                  Refresh Stale
                </Button>
              </div>
            )}

            {newUnseeded.length > 0 && (
              <div className="flex items-start gap-3 rounded-lg border border-blue-300/50 bg-blue-50/50 dark:bg-blue-950/10 p-4">
                <Bell className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    {newUnseeded.length} product{newUnseeded.length !== 1 ? "s have" : " has"} no reviews. Seed them?
                  </p>
                  <p className="text-xs text-blue-700/80 dark:text-blue-400/80">
                    {newUnseeded.slice(0, 3).map((p) => p.productName).join(", ")}
                    {newUnseeded.length > 3 && ` and ${newUnseeded.length - 3} more`}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 border-blue-400 text-blue-700 hover:bg-blue-100 dark:text-blue-400"
                  onClick={handleSeedNew}
                  disabled={isSeedingNew}
                  data-testid="button-seed-new"
                >
                  {isSeedingNew ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Zap className="h-4 w-4 mr-1" />
                  )}
                  Seed Now
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ── Section A: Overview Panel ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              icon: MessageSquare,
              label: "Seeded Comments",
              value: statsLoading ? "…" : (stats?.totalSeededComments ?? 0).toLocaleString(),
              color: "text-primary",
            },
            {
              icon: Package,
              label: "Products Seeded",
              value: statsLoading ? "…" : (stats?.productsWithSeeded ?? 0).toLocaleString(),
              color: "text-blue-600 dark:text-blue-400",
            },
            {
              icon: Users,
              label: "Products Without Reviews",
              value: statsLoading ? "…" : (stats?.productsWithNoComments ?? 0).toLocaleString(),
              color: "text-amber-600 dark:text-amber-400",
            },
            {
              icon: BarChart3,
              label: "Average Rating",
              value: statsLoading ? "…" : (stats?.averageRating ?? 0).toFixed(1) + " ★",
              color: "text-green-600 dark:text-green-400",
            },
          ].map(({ icon: Icon, label, value, color }) => (
            <Card key={label} data-testid={`stat-card-${label.toLowerCase().replace(/\s+/g, "-")}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{label}</p>
                    <p className={cn("text-2xl font-bold mt-1", color)}>{value}</p>
                  </div>
                  <Icon className={cn("h-5 w-5 mt-0.5 opacity-70", color)} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {stats?.lastSeeded && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 -mt-4">
            <Clock className="h-3 w-3" />
            Last seeded:{" "}
            {stats.lastSeeded.toLocaleString("en-PK", {
              day: "numeric", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Section B: Seeding Controls ───────────────────────────────── */}
          <Card data-testid="card-seeding-controls">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Play className="h-4 w-4 text-primary" />
                Seeding Controls
              </CardTitle>
              <CardDescription>Configure and run a seed operation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Scope */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Scope</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(SCOPE_LABELS) as [SeedScope, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setScope(key)}
                      data-testid={`scope-${key}`}
                      className={cn(
                        "text-left text-xs px-3 py-2 rounded-md border transition-all",
                        scope === key
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-transparent text-muted-foreground border-border hover:border-primary/50"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category picker */}
              {scope === "category" && (
                <div className="space-y-2">
                  <Label className="text-sm">Category</Label>
                  <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as ProductCategory)}>
                    <SelectTrigger data-testid="select-seed-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Product picker */}
              {scope === "single_product" && (
                <div className="space-y-2">
                  <Label className="text-sm">Product</Label>
                  {productsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading products…
                    </div>
                  ) : (
                    <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                      <SelectTrigger data-testid="select-seed-product">
                        <SelectValue placeholder="Select a product…" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {allProducts?.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              <Separator />

              {/* Comments per product */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Comments per product</Label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleCommentsPerProductChange("random")}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-md border transition-all",
                      commentsPerProductInput === "random"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    )}
                    data-testid="button-random-count"
                  >
                    Random (2–7)
                  </button>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={commentsPerProductInput === "random" ? "" : commentsPerProductInput}
                    placeholder="1–10"
                    className="w-24 h-8 text-sm"
                    onChange={(e) => handleCommentsPerProductChange(e.target.value)}
                    data-testid="input-comments-count"
                  />
                </div>
              </div>

              {/* Rating bias */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Rating tendency</Label>
                <Select
                  value={settings.ratingBias}
                  onValueChange={(v) => updateSetting("ratingBias", v as SeedOptions["ratingBias"])}
                >
                  <SelectTrigger data-testid="select-rating-bias">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(RATING_BIAS_LABELS) as [SeedOptions["ratingBias"], string][]).map(
                      ([val, label]) => (
                        <SelectItem key={val} value={val}>{label}</SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Date range */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Comment date range (days back)</Label>
                <div className="flex items-center gap-3">
                  {[30, 60, 90, 180].map((d) => (
                    <button
                      key={d}
                      onClick={() => updateSetting("dateRangeDays", d)}
                      data-testid={`button-days-${d}`}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-md border transition-all",
                        settings.dateRangeDays === d
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="include-replies"
                    checked={settings.includeReplies}
                    onCheckedChange={(v) => updateSetting("includeReplies", !!v)}
                    data-testid="checkbox-include-replies"
                  />
                  <Label htmlFor="include-replies" className="text-sm cursor-pointer">
                    Include seller replies (~20%)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="include-verified"
                    checked={settings.includeVerified}
                    onCheckedChange={(v) => updateSetting("includeVerified", !!v)}
                    data-testid="checkbox-include-verified"
                  />
                  <Label htmlFor="include-verified" className="text-sm cursor-pointer">
                    Include verified purchase badges (~70%)
                  </Label>
                </div>
              </div>

              <Separator />

              {/* Action buttons */}
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  onClick={handleSeed}
                  disabled={isSeeding}
                  data-testid="button-run-seed"
                >
                  {isSeeding ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Seeding…</>
                  ) : (
                    <><Play className="h-4 w-4 mr-2" /> Seed {SCOPE_LABELS[scope]}</>
                  )}
                </Button>
                {isSeeding && (
                  <Button variant="outline" onClick={handleCancel} data-testid="button-cancel-seed">
                    <XCircle className="h-4 w-4 mr-2" /> Cancel
                  </Button>
                )}
              </div>

              {/* Live progress */}
              {(isSeeding || progress?.done) && progress && (
                <ProgressBar progress={progress} />
              )}

              {/* Seed result summary */}
              {seedResult && !isSeeding && (
                <div className={cn(
                  "rounded-md p-3 text-sm",
                  seedResult.errors.length > 0 ? "bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300" : "bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300"
                )}>
                  <p className="font-medium flex items-center gap-1.5">
                    {seedResult.errors.length > 0 ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    {seedResult.created} comments created
                    {seedResult.errors.length > 0 && `, ${seedResult.errors.length} error(s)`}
                  </p>
                  {seedResult.errors.length > 0 && (
                    <ul className="mt-1 text-xs space-y-0.5 list-disc list-inside">
                      {seedResult.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                      {seedResult.errors.length > 5 && <li>…and {seedResult.errors.length - 5} more</li>}
                    </ul>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Preview Panel ────────────────────────────────────────────── */}
          <Card data-testid="card-preview">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    Comment Preview
                  </CardTitle>
                  <CardDescription>See sample comments before seeding</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreview}
                  disabled={previewLoading}
                  data-testid="button-preview"
                >
                  {previewLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <><RefreshCw className="h-4 w-4 mr-1" /> Generate</>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {preview.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-2">
                  <Eye className="h-10 w-10 opacity-20" />
                  <p className="text-sm">Click "Generate" to preview sample comments based on your current settings</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                  {preview.map((comment, i) => (
                    <PreviewCard key={i} comment={comment} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Phase 5: Analytics Dashboard ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2" data-testid="card-analytics">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Analytics Dashboard
              </CardTitle>
              <CardDescription>
                Live overview of comment distribution, ratings, and activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Loading analytics…</span>
                </div>
              ) : analyticsData ? (
                <SeedAnalytics data={analyticsData} />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No data available. Run a seed operation first.
                </p>
              )}
            </CardContent>
          </Card>

          {/* ── Health Score ─────────────────────────────────────────────── */}
          <Card data-testid="card-health-score">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Comment Realism Score
              </CardTitle>
              <CardDescription>Quality rating of seeded comments (0–100)</CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : analyticsData ? (
                <SeedHealthScore score={analyticsData.healthScore} />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No data yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Phase 5: Per-Product Breakdown ────────────────────────────────── */}
        <Card data-testid="card-product-breakdown">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Per-Product Breakdown
            </CardTitle>
            <CardDescription>
              Sortable table of all products with real/seeded counts. Click a row to inspect comments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading…</span>
              </div>
            ) : analyticsData ? (
              <ProductBreakdownTable
                perProduct={analyticsData.perProduct}
                onRefreshNeeded={refetchAnalytics}
              />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── Phase 5: Comment Quality Audit ────────────────────────────────── */}
        <Card data-testid="card-audit">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-primary" />
              Comment Quality Audit
            </CardTitle>
            <CardDescription>
              Scan all seeded comments for quality issues — duplicates, overused names, future timestamps, and more.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CommentAudit />
          </CardContent>
        </Card>

        {/* ── Section C: Cleanup Controls ───────────────────────────────────── */}
        <Card data-testid="card-cleanup">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-destructive" />
              Cleanup Controls
            </CardTitle>
            <CardDescription>Delete seeded comments. All counts shown are live before you confirm.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Delete All */}
              <div className="border rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm font-medium">Delete All Seeded Comments</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Removes every comment with userId "system-seed"
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => openDeleteDialog("all")}
                  data-testid="button-delete-all"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete All
                </Button>
              </div>

              {/* Delete by Category */}
              <div className="border rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm font-medium">Delete by Category</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Removes seeded comments for products in a category
                  </p>
                </div>
                <Select value={cleanupCategory} onValueChange={(v) => setCleanupCategory(v as ProductCategory)}>
                  <SelectTrigger className="h-8 text-xs" data-testid="select-cleanup-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => openDeleteDialog("category")}
                  data-testid="button-delete-category"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Category
                </Button>
              </div>

              {/* Delete Older Than */}
              <div className="border rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm font-medium">Delete Older Than</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Removes seeded comments older than N days
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={cleanupOlderThanDays}
                    onChange={(e) => setCleanupOlderThanDays(e.target.value)}
                    className="h-8 text-sm"
                    data-testid="input-older-than-days"
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">days ago</span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => openDeleteDialog("older_than")}
                  data-testid="button-delete-older-than"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Old
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Seed History ──────────────────────────────────────────────────── */}
        <Card data-testid="card-seed-history">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Seed History
            </CardTitle>
            <CardDescription>Last 20 seed and delete actions by admins</CardDescription>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading logs…
              </div>
            ) : !seedLogs || seedLogs.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center text-muted-foreground gap-2">
                <Clock className="h-8 w-8 opacity-20" />
                <p className="text-sm">No seed operations recorded yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Scope</TableHead>
                      <TableHead className="text-center">Created</TableHead>
                      <TableHead className="text-center">Deleted</TableHead>
                      <TableHead>Admin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seedLogs.map((log) => (
                      <SeedHistoryRow key={log.id} log={log} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Delete Confirmation Dialog ─────────────────────────────────────── */}
      <Dialog open={!!deleteDialog} onOpenChange={(open) => { if (!open) { setDeleteDialog(null); setDeleteTyped(""); } }}>
        <DialogContent data-testid="dialog-delete-confirm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 pt-2">
                <p className="text-sm">
                  You are about to delete{" "}
                  <span className="font-semibold text-foreground">
                    {deleteDialog?.count.toLocaleString()} {deleteDialog?.label}
                  </span>
                  . This action cannot be undone.
                </p>
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 text-sm text-destructive">
                  Type <span className="font-mono font-bold">DELETE ALL</span> to confirm
                </div>
                <Input
                  placeholder="Type DELETE ALL"
                  value={deleteTyped}
                  onChange={(e) => setDeleteTyped(e.target.value)}
                  className="font-mono"
                  data-testid="input-delete-confirm"
                />
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() => { setDeleteDialog(null); setDeleteTyped(""); }}
              data-testid="button-cancel-delete"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteTyped !== "DELETE ALL" || isDeleting}
              onClick={handleDelete}
              data-testid="button-confirm-delete"
            >
              {isDeleting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting…</>
              ) : (
                <><Trash2 className="h-4 w-4 mr-2" /> Delete {deleteDialog?.count.toLocaleString()} comments</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
