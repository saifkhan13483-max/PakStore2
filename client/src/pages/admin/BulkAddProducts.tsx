import { useState, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { categoryFirestoreService } from "@/services/categoryFirestoreService";
import { productFirestoreService } from "@/services/productFirestoreService";
import { generateProductDescription } from "@/services/ai";
import { type Category } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Sparkles,
  Save,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  Copy,
  FileDown,
  Upload,
  X,
  AlertCircle,
  PackageCheck,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Eye,
  EyeOff,
  FileUp,
  Package2,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface ProductRow {
  id: string;
  name: string;
  categoryId: string;
  price: string;
  originalPrice: string;
  profit: string;
  stock: string;
  imageUrls: string;
  generatedDescription: string;
  generatedFeatures: string[];
  newFeatureInput: string;
  labels: string[];
  newLabelInput: string;
  slug: string;
  aiStatus: "idle" | "loading" | "done" | "error";
  saveStatus: "idle" | "loading" | "done" | "error";
  expanded: boolean;
}

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function emptyRow(): ProductRow {
  return {
    id: makeId(),
    name: "",
    categoryId: "",
    price: "",
    originalPrice: "",
    profit: "",
    stock: "10",
    imageUrls: "",
    generatedDescription: "",
    generatedFeatures: [],
    newFeatureInput: "",
    labels: [],
    newLabelInput: "",
    slug: "",
    aiStatus: "idle",
    saveStatus: "idle",
    expanded: true,
  };
}

const CSV_HEADERS = ["name", "category_name", "price", "original_price", "profit", "stock", "image_urls", "labels"];

function downloadCsvTemplate() {
  const example = [
    "Premium Cotton T-Shirt",
    "Clothing",
    "1499",
    "1999",
    "300",
    "50",
    "https://example.com/img1.jpg,https://example.com/img2.jpg",
    "new;bestseller",
  ];
  const csv = [CSV_HEADERS.join(","), example.join(",")].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bulk_products_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function getFirstImageUrl(imageUrls: string): string | null {
  const urls = imageUrls.split(",").map((u) => u.trim()).filter(Boolean);
  return urls[0] || null;
}

export default function BulkAddProducts() {
  const { toast } = useToast();
  const [rows, setRows] = useState<ProductRow[]>([emptyRow()]);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkTotal, setBulkTotal] = useState(0);
  const [bulkMode, setBulkMode] = useState<"ai" | "save" | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => categoryFirestoreService.getAllCategories(),
  });

  const updateRow = useCallback((id: string, updates: Partial<ProductRow>) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, ...updates };
        if (updates.name !== undefined) {
          updated.slug = toSlug(updates.name);
        }
        return updated;
      })
    );
  }, []);

  const addRow = () => setRows((prev) => [...prev, { ...emptyRow(), expanded: true }]);

  const duplicateRow = (id: string) => {
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      if (idx === -1) return prev;
      const original = prev[idx];
      const copy: ProductRow = {
        ...original,
        id: makeId(),
        saveStatus: "idle",
        aiStatus: original.aiStatus === "done" ? "done" : "idle",
        expanded: true,
      };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  };

  const removeRow = (id: string) => {
    if (rows.length === 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const moveRow = (id: string, direction: "up" | "down") => {
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      if (idx === -1) return prev;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  };

  const clearSaved = () => {
    setRows((prev) => {
      const remaining = prev.filter((r) => r.saveStatus !== "done");
      return remaining.length > 0 ? remaining : [emptyRow()];
    });
  };

  const resetRow = (id: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...emptyRow(), id: r.id, expanded: r.expanded }
          : r
      )
    );
  };

  const toggleExpand = (id: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, expanded: !r.expanded } : r))
    );
  };

  const expandAll = () => setRows((prev) => prev.map((r) => ({ ...r, expanded: true })));
  const collapseAll = () => setRows((prev) => prev.map((r) => ({ ...r, expanded: false })));

  const addFeature = (id: string, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, generatedFeatures: [...r.generatedFeatures, trimmed], newFeatureInput: "" }
          : r
      )
    );
  };

  const removeFeature = (id: string, index: number) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, generatedFeatures: r.generatedFeatures.filter((_, i) => i !== index) }
          : r
      )
    );
  };

  const addLabel = (id: string, value: string) => {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return;
    setRows((prev) =>
      prev.map((r) =>
        r.id === id && !r.labels.includes(trimmed)
          ? { ...r, labels: [...r.labels, trimmed], newLabelInput: "" }
          : r
      )
    );
  };

  const removeLabel = (id: string, label: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, labels: r.labels.filter((l) => l !== label) } : r
      )
    );
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) {
        toast({ title: "CSV is empty or invalid", variant: "destructive" });
        return;
      }
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const nameIdx = headers.indexOf("name");
      const catIdx = headers.indexOf("category_name");
      const priceIdx = headers.indexOf("price");
      const origIdx = headers.indexOf("original_price");
      const profitIdx = headers.indexOf("profit");
      const stockIdx = headers.indexOf("stock");
      const imgIdx = headers.indexOf("image_urls");
      const labelsIdx = headers.indexOf("labels");

      if (nameIdx === -1 || priceIdx === -1) {
        toast({ title: "CSV must have 'name' and 'price' columns", variant: "destructive" });
        return;
      }

      const newRows: ProductRow[] = lines.slice(1).map((line) => {
        const cols = line.split(",");
        const catName = catIdx !== -1 ? cols[catIdx]?.trim() : "";
        const cat = categories.find(
          (c) => c.name.toLowerCase() === catName?.toLowerCase()
        );
        const rawLabels = labelsIdx !== -1 ? cols[labelsIdx]?.trim() : "";
        const labels = rawLabels
          ? rawLabels.split(";").map((l) => l.trim()).filter(Boolean)
          : [];
        const name = cols[nameIdx]?.trim() || "";
        return {
          ...emptyRow(),
          name,
          slug: toSlug(name),
          categoryId: cat?.id || "",
          price: cols[priceIdx]?.trim() || "",
          originalPrice: origIdx !== -1 ? cols[origIdx]?.trim() || "" : "",
          profit: profitIdx !== -1 ? cols[profitIdx]?.trim() || "" : "",
          stock: stockIdx !== -1 ? cols[stockIdx]?.trim() || "10" : "10",
          imageUrls: imgIdx !== -1 ? cols[imgIdx]?.trim() || "" : "",
          labels,
        };
      });

      setRows((prev) => {
        const existingEmpty = prev.filter(
          (r) => !r.name && !r.price && r.saveStatus === "idle"
        );
        const base = existingEmpty.length === prev.length ? [] : prev;
        return [...base, ...newRows];
      });

      toast({
        title: `Imported ${newRows.length} product${newRows.length !== 1 ? "s" : ""} from CSV`,
        description: "Review and fill in any missing fields before saving.",
      });
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const exportCurrentCsv = () => {
    const dataRows = rows.map((r) => {
      const cat = categories.find((c) => c.id === r.categoryId);
      return [
        r.name,
        cat?.name || "",
        r.price,
        r.originalPrice,
        r.profit,
        r.stock,
        r.imageUrls,
        r.labels.join(";"),
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
    });
    const csv = [CSV_HEADERS.join(","), ...dataRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bulk_products_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported current product list as CSV" });
  };

  const generateForRow = async (row: ProductRow) => {
    if (!row.name || !row.price) {
      toast({ title: "Fill in product name and price first", variant: "destructive" });
      return;
    }
    updateRow(row.id, { aiStatus: "loading" });
    try {
      const cat = categories.find((c) => c.id === row.categoryId);
      const desc = await generateProductDescription(
        row.name,
        cat?.name || "General",
        parseFloat(row.price) || 0
      );
      const lines = desc.split("\n").filter(Boolean);
      const features = lines
        .filter((l) => l.startsWith("•") || l.startsWith("-") || l.startsWith("*"))
        .map((l) => l.replace(/^[•\-*]\s*/, "").trim())
        .filter(Boolean);
      const description = lines
        .filter((l) => !l.startsWith("•") && !l.startsWith("-") && !l.startsWith("*"))
        .join("\n")
        .trim() || desc;
      updateRow(row.id, {
        aiStatus: "done",
        generatedDescription: description,
        generatedFeatures: features,
        expanded: true,
      });
    } catch {
      updateRow(row.id, { aiStatus: "error" });
      toast({ title: `AI failed for "${row.name}"`, variant: "destructive" });
    }
  };

  const generateAll = async () => {
    const pending = rows.filter((r) => r.name && r.price && r.aiStatus !== "done");
    if (!pending.length) {
      toast({ title: "Nothing to generate", description: "Add product names and prices first." });
      return;
    }
    setIsGeneratingAll(true);
    setBulkMode("ai");
    setBulkProgress(0);
    setBulkTotal(pending.length);
    for (let i = 0; i < pending.length; i++) {
      await generateForRow(pending[i]);
      setBulkProgress(i + 1);
    }
    setIsGeneratingAll(false);
    setBulkMode(null);
    setBulkTotal(0);
    toast({ title: "AI generation complete!", description: `${pending.length} products generated.` });
  };

  const saveRow = async (row: ProductRow): Promise<boolean> => {
    if (!row.name || !row.categoryId || !row.price) return false;
    updateRow(row.id, { saveStatus: "loading" });
    try {
      const images = row.imageUrls
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean);
      await productFirestoreService.createProduct({
        name: row.name,
        slug: row.slug || toSlug(row.name),
        description: row.generatedDescription || `${row.name} — premium quality product.`,
        longDescription: "",
        price: parseFloat(row.price) || 0,
        profit: row.profit ? parseFloat(row.profit) : 0,
        originalPrice: row.originalPrice ? parseFloat(row.originalPrice) : null,
        images,
        videoUrl: "",
        categoryId: row.categoryId,
        stock: parseInt(row.stock) || 10,
        inStock: true,
        active: true,
        rating: 0,
        reviewCount: 0,
        features: row.generatedFeatures,
        specifications: {},
        variants: [],
        labels: row.labels,
      });
      updateRow(row.id, { saveStatus: "done" });
      return true;
    } catch (err: any) {
      updateRow(row.id, { saveStatus: "error" });
      toast({ title: `Save failed: ${row.name}`, description: err.message, variant: "destructive" });
      return false;
    }
  };

  const saveAll = async () => {
    const toSave = rows.filter(
      (r) => r.name && r.categoryId && r.price && r.saveStatus !== "done"
    );
    if (!toSave.length) {
      toast({ title: "Nothing to save", description: "Fill in at least name, category, and price." });
      return;
    }
    setIsSavingAll(true);
    setBulkMode("save");
    setBulkProgress(0);
    setBulkTotal(toSave.length);
    let saved = 0;
    for (let i = 0; i < toSave.length; i++) {
      const ok = await saveRow(toSave[i]);
      if (ok) saved++;
      setBulkProgress(i + 1);
    }
    setIsSavingAll(false);
    setBulkMode(null);
    setBulkTotal(0);
    if (saved > 0) {
      toast({
        title: `${saved} product${saved > 1 ? "s" : ""} saved successfully!`,
        description: "They are now live in your store.",
      });
    }
  };

  const readyCount = rows.filter((r) => r.name && r.categoryId && r.price).length;
  const savedCount = rows.filter((r) => r.saveStatus === "done").length;
  const aiDoneCount = rows.filter((r) => r.aiStatus === "done").length;
  const errorCount = rows.filter((r) => r.saveStatus === "error").length;
  const isBusy = isSavingAll || isGeneratingAll;
  const progressPercent = bulkTotal > 0 ? Math.round((bulkProgress / bulkTotal) * 100) : 0;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <SEO title="Bulk Add Products" description="" robots="noindex" />

        {/* Page Header */}
        <div className="border-b bg-card">
          <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <Button variant="ghost" size="sm" className="self-start -ml-2 h-8 px-2 text-muted-foreground hover:text-foreground" asChild>
                <Link href="/admin/products">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Link>
              </Button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-0.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Package2 className="w-4 h-4 text-primary" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                    Bulk Add Products
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground ml-10 sm:ml-10">
                  Add multiple products at once — AI generates descriptions automatically
                </p>
              </div>
              {savedCount > 0 && (
                <Button variant="outline" size="sm" asChild className="self-start sm:self-auto flex-shrink-0" data-testid="link-view-products">
                  <Link href="/admin/products">
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    View {savedCount} Saved
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-8">

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-5">
            <div className="bg-card border rounded-xl p-3 sm:p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Rows</p>
                <p className="text-lg font-bold text-foreground" data-testid="stat-total">{rows.length}</p>
              </div>
            </div>
            <div className="bg-card border rounded-xl p-3 sm:p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ready</p>
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400" data-testid="stat-ready">{readyCount}</p>
              </div>
            </div>
            <div className="bg-card border rounded-xl p-3 sm:p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">AI Done</p>
                <p className="text-lg font-bold text-primary" data-testid="stat-ai-done">{aiDoneCount}</p>
              </div>
            </div>
            <div className="bg-card border rounded-xl p-3 sm:p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Saved</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400" data-testid="stat-saved">{savedCount}</p>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="bg-card border rounded-xl p-3 sm:p-4 mb-4 sm:mb-5 space-y-3">
            {/* Progress */}
            {isBusy && bulkTotal > 0 && (
              <div className="space-y-1.5 pb-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground flex items-center gap-1.5">
                    {bulkMode === "ai" ? (
                      <><Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" /> Generating AI descriptions…</>
                    ) : (
                      <><Save className="w-3.5 h-3.5 text-primary" /> Saving products to store…</>
                    )}
                  </span>
                  <span className="text-muted-foreground tabular-nums">{bulkProgress} / {bulkTotal}</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            )}

            {/* Tools Row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Import / Export group */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleCsvImport}
                  data-testid="input-csv-file"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => csvInputRef.current?.click()}
                      disabled={isBusy}
                      data-testid="button-import-csv"
                      className="h-8 text-xs sm:text-sm"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5" />
                      <span className="hidden xs:inline">Import</span> CSV
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Upload a CSV file to add multiple products at once</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadCsvTemplate}
                      data-testid="button-download-template"
                      className="h-8 text-xs sm:text-sm"
                    >
                      <FileDown className="w-3.5 h-3.5 mr-1.5" />
                      Template
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download a CSV template to fill in</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportCurrentCsv}
                      disabled={rows.every((r) => !r.name)}
                      data-testid="button-export-csv"
                      className="h-8 text-xs sm:text-sm"
                    >
                      <FileUp className="w-3.5 h-3.5 mr-1.5" />
                      Export
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Export current products list as CSV</TooltipContent>
                </Tooltip>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-6 bg-border mx-1" />

              {/* View controls */}
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={expandAll}
                      disabled={isBusy}
                      className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                      data-testid="button-expand-all"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      <span className="hidden sm:inline">Expand</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Expand all rows</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={collapseAll}
                      disabled={isBusy}
                      className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                      data-testid="button-collapse-all"
                    >
                      <EyeOff className="w-3.5 h-3.5 mr-1" />
                      <span className="hidden sm:inline">Collapse</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Collapse all rows</TooltipContent>
                </Tooltip>
              </div>

              {savedCount > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={clearSaved}
                      className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors ml-1"
                      data-testid="button-clear-saved"
                    >
                      Clear saved
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Remove saved rows from the list</TooltipContent>
                </Tooltip>
              )}

              {/* Spacer */}
              <div className="flex-1 min-w-0" />

              {/* Primary actions */}
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateAll}
                      disabled={isBusy}
                      data-testid="button-generate-all"
                      className="h-8 border-primary/30 text-primary hover:bg-primary/5 hover:text-primary text-xs sm:text-sm"
                    >
                      {isGeneratingAll ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      <span className="hidden sm:inline">AI Generate</span>
                      <span className="sm:hidden">AI</span>
                      <span className="hidden xs:inline">&nbsp;All</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Generate AI descriptions for all products with name & price</TooltipContent>
                </Tooltip>

                <Button
                  size="sm"
                  onClick={saveAll}
                  disabled={isBusy || readyCount === 0}
                  data-testid="button-save-all"
                  className="h-8 text-xs sm:text-sm"
                >
                  {isSavingAll ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  Save All
                  {readyCount > 0 && <span className="ml-1 opacity-70">({readyCount})</span>}
                </Button>
              </div>
            </div>

            {/* Error notice */}
            {errorCount > 0 && (
              <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
                <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errorCount} product{errorCount > 1 ? "s" : ""} failed to save. Check the rows below and try again.</span>
              </div>
            )}
          </div>

          {/* Product Rows */}
          <div className="space-y-2.5 sm:space-y-3">
            {rows.map((row, index) => {
              const isReady = Boolean(row.name && row.categoryId && row.price);
              const missingFields = [
                !row.name && "name",
                !row.categoryId && "category",
                !row.price && "price",
              ].filter(Boolean) as string[];
              const firstImage = getFirstImageUrl(row.imageUrls);

              return (
                <Card
                  key={row.id}
                  className={cn(
                    "border transition-all duration-200",
                    row.saveStatus === "done" &&
                      "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20",
                    row.saveStatus === "error" && "border-destructive/50 bg-destructive/5",
                    row.saveStatus === "loading" && "opacity-80"
                  )}
                  data-testid={`card-product-${row.id}`}
                >
                  {/* Card Header — always visible */}
                  <CardHeader className="py-2.5 px-3 sm:px-4">
                    <div className="flex items-start gap-2 sm:gap-3">

                      {/* Row number + image preview */}
                      <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-1">
                        <span className="text-[11px] font-mono text-muted-foreground w-6 text-center leading-none">
                          {index + 1}
                        </span>
                        {firstImage ? (
                          <div className="w-8 h-8 rounded border overflow-hidden bg-muted flex-shrink-0">
                            <img
                              src={firstImage}
                              alt="preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded border border-dashed bg-muted/50 flex items-center justify-center">
                            <Package2 className="w-3.5 h-3.5 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>

                      {/* Primary fields */}
                      <div className="flex-1 min-w-0">
                        {/* Row 1: Name + Category */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                          <Input
                            placeholder="Product name *"
                            value={row.name}
                            onChange={(e) => updateRow(row.id, { name: e.target.value })}
                            disabled={row.saveStatus === "done"}
                            data-testid={`input-product-name-${row.id}`}
                            className={cn(
                              "h-9 text-sm",
                              !row.name && row.saveStatus === "error" && "border-destructive"
                            )}
                          />
                          <Select
                            value={row.categoryId}
                            onValueChange={(v) => updateRow(row.id, { categoryId: v })}
                            disabled={row.saveStatus === "done"}
                          >
                            <SelectTrigger
                              className={cn(
                                "h-9 text-sm",
                                !row.categoryId && row.saveStatus === "error" && "border-destructive"
                              )}
                              data-testid={`select-category-${row.id}`}
                            >
                              <SelectValue placeholder="Category *" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Row 2: Price + Original Price */}
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Price (Rs.) *"
                            type="number"
                            min="0"
                            value={row.price}
                            onChange={(e) => updateRow(row.id, { price: e.target.value })}
                            disabled={row.saveStatus === "done"}
                            data-testid={`input-price-${row.id}`}
                            className={cn(
                              "h-9 text-sm",
                              !row.price && row.saveStatus === "error" && "border-destructive"
                            )}
                          />
                          <Input
                            placeholder="Original price"
                            type="number"
                            min="0"
                            value={row.originalPrice}
                            onChange={(e) => updateRow(row.id, { originalPrice: e.target.value })}
                            disabled={row.saveStatus === "done"}
                            data-testid={`input-original-price-${row.id}`}
                            className="h-9 text-sm"
                          />
                        </div>
                      </div>

                      {/* Action buttons column */}
                      <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                        {/* Status icon */}
                        <div className="h-7 flex items-center justify-center">
                          {row.saveStatus === "done" && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          )}
                          {row.saveStatus === "error" && (
                            <XCircle className="w-4 h-4 text-destructive" />
                          )}
                          {row.saveStatus === "loading" && (
                            <Loader2 className="w-4 h-4 text-primary animate-spin" />
                          )}
                          {row.saveStatus === "idle" && !isReady && missingFields.length > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertCircle className="w-3.5 h-3.5 text-amber-500 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>Missing: {missingFields.join(", ")}</TooltipContent>
                            </Tooltip>
                          )}
                          {row.saveStatus === "idle" && isReady && row.aiStatus !== "done" && (
                            <div className="w-2 h-2 rounded-full bg-amber-400" title="Ready to save" />
                          )}
                          {row.saveStatus === "idle" && isReady && row.aiStatus === "done" && (
                            <div className="w-2 h-2 rounded-full bg-primary" title="AI done, ready to save" />
                          )}
                        </div>

                        {/* AI generate */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => generateForRow(row)}
                              disabled={row.aiStatus === "loading" || row.saveStatus === "done" || isBusy}
                              data-testid={`button-ai-generate-${row.id}`}
                            >
                              {row.aiStatus === "loading" ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                              ) : (
                                <Sparkles className={cn("w-3.5 h-3.5", row.aiStatus === "done" ? "text-primary" : "text-muted-foreground")} />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Generate AI description</TooltipContent>
                        </Tooltip>

                        {/* Duplicate */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => duplicateRow(row.id)}
                              disabled={isBusy}
                              data-testid={`button-duplicate-${row.id}`}
                            >
                              <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Duplicate row</TooltipContent>
                        </Tooltip>

                        {/* Expand/collapse */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => toggleExpand(row.id)}
                          data-testid={`button-toggle-${row.id}`}
                        >
                          {row.expanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                        </Button>

                        {/* Remove */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => removeRow(row.id)}
                              disabled={rows.length === 1 || row.saveStatus === "done" || isBusy}
                              data-testid={`button-remove-${row.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Remove row</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Expanded details */}
                  {row.expanded && (
                    <CardContent className="pt-0 pb-4 px-3 sm:px-4 border-t space-y-4">

                      {/* Move / Reset controls */}
                      <div className="flex items-center gap-2 pt-3">
                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => moveRow(row.id, "up")}
                                disabled={index === 0 || isBusy}
                                data-testid={`button-move-up-${row.id}`}
                              >
                                <ArrowUp className="w-3 h-3 text-muted-foreground" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Move up</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => moveRow(row.id, "down")}
                                disabled={index === rows.length - 1 || isBusy}
                                data-testid={`button-move-down-${row.id}`}
                              >
                                <ArrowDown className="w-3 h-3 text-muted-foreground" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Move down</TooltipContent>
                          </Tooltip>
                        </div>
                        <span className="text-xs text-muted-foreground">Row {index + 1}</span>
                        {row.saveStatus === "idle" && (row.name || row.price) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs text-muted-foreground px-2 ml-auto"
                                onClick={() => resetRow(row.id)}
                                disabled={isBusy}
                                data-testid={`button-reset-${row.id}`}
                              >
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Reset
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Clear all fields in this row</TooltipContent>
                          </Tooltip>
                        )}
                      </div>

                      {/* Secondary fields */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">
                            Profit (Rs.)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="e.g. 200"
                            value={row.profit}
                            onChange={(e) => updateRow(row.id, { profit: e.target.value })}
                            disabled={row.saveStatus === "done"}
                            className="h-8 text-sm"
                            data-testid={`input-profit-${row.id}`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">
                            Stock qty
                          </label>
                          <Input
                            type="number"
                            min="0"
                            value={row.stock}
                            onChange={(e) => updateRow(row.id, { stock: e.target.value })}
                            disabled={row.saveStatus === "done"}
                            className="h-8 text-sm"
                            data-testid={`input-stock-${row.id}`}
                          />
                        </div>
                        <div className="space-y-1 col-span-2 sm:col-span-1">
                          <label className="text-xs font-medium text-muted-foreground">
                            URL Slug
                          </label>
                          <Input
                            value={row.slug}
                            onChange={(e) => updateRow(row.id, { slug: e.target.value })}
                            disabled={row.saveStatus === "done"}
                            className="h-8 text-xs font-mono"
                            placeholder="product-slug"
                            data-testid={`input-slug-${row.id}`}
                          />
                        </div>
                      </div>

                      {/* Image URLs */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                          <span>Image URLs <span className="font-normal">(comma-separated)</span></span>
                          {row.imageUrls && (
                            <span className="text-[10px] text-muted-foreground/70">
                              {row.imageUrls.split(",").filter((u) => u.trim()).length} image(s)
                            </span>
                          )}
                        </label>
                        <Textarea
                          placeholder="https://res.cloudinary.com/..., https://..."
                          value={row.imageUrls}
                          onChange={(e) => updateRow(row.id, { imageUrls: e.target.value })}
                          disabled={row.saveStatus === "done"}
                          rows={2}
                          className="text-xs resize-none"
                          data-testid={`input-images-${row.id}`}
                        />
                        {/* Image previews */}
                        {row.imageUrls && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {row.imageUrls.split(",").map((u, i) => {
                              const url = u.trim();
                              if (!url) return null;
                              return (
                                <div key={i} className="w-10 h-10 rounded border overflow-hidden bg-muted flex-shrink-0" title={url}>
                                  <img
                                    src={url}
                                    alt={`Image ${i + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).parentElement!.style.opacity = "0.3";
                                    }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Labels */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                          Labels / Tags
                        </label>
                        <div className="flex flex-wrap gap-1.5 min-h-[30px] p-2 bg-muted/30 rounded-lg border">
                          {row.labels.map((label) => (
                            <Badge
                              key={label}
                              variant="secondary"
                              className="text-xs gap-1 pr-1 h-6"
                            >
                              {label}
                              {row.saveStatus !== "done" && (
                                <button
                                  onClick={() => removeLabel(row.id, label)}
                                  className="hover:text-destructive transition-colors ml-0.5"
                                  data-testid={`button-remove-label-${row.id}-${label}`}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </Badge>
                          ))}
                          {row.saveStatus !== "done" && (
                            <Input
                              placeholder="+ Add label (Enter)"
                              value={row.newLabelInput}
                              onChange={(e) => updateRow(row.id, { newLabelInput: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === ",") {
                                  e.preventDefault();
                                  addLabel(row.id, row.newLabelInput);
                                }
                              }}
                              onBlur={() => addLabel(row.id, row.newLabelInput)}
                              className="h-6 text-xs border-0 bg-transparent shadow-none px-1 focus-visible:ring-0 w-36 placeholder:text-muted-foreground/60"
                              data-testid={`input-label-${row.id}`}
                            />
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground/60">Separate by pressing Enter or comma</p>
                      </div>

                      {/* AI section */}
                      {row.aiStatus === "idle" && (
                        <div className="flex items-center gap-3 py-2 px-3 bg-muted/30 rounded-lg border border-dashed text-xs text-muted-foreground">
                          <Sparkles className="w-4 h-4 text-primary/60 flex-shrink-0" />
                          <span>Click <strong className="text-foreground">✦</strong> icon to auto-generate product description and key features with AI.</span>
                          {isReady && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="ml-auto h-7 text-xs text-primary hover:text-primary hover:bg-primary/10 flex-shrink-0"
                              onClick={() => generateForRow(row)}
                              disabled={isBusy}
                            >
                              <Sparkles className="w-3 h-3 mr-1" />
                              Generate
                            </Button>
                          )}
                        </div>
                      )}

                      {row.aiStatus === "loading" && (
                        <div className="flex items-center gap-3 py-3 px-3 bg-primary/5 rounded-lg border border-primary/20 text-xs text-primary">
                          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                          <span>Generating AI content for <strong>{row.name}</strong>…</span>
                        </div>
                      )}

                      {row.aiStatus === "error" && (
                        <div className="flex items-center gap-3 py-2 px-3 bg-destructive/5 rounded-lg border border-destructive/20 text-xs text-destructive">
                          <XCircle className="w-4 h-4 flex-shrink-0" />
                          <span>AI generation failed.</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="ml-auto h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                            onClick={() => generateForRow(row)}
                            disabled={isBusy}
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Retry
                          </Button>
                        </div>
                      )}

                      {/* AI Generated Content */}
                      {(row.aiStatus === "done" || row.generatedDescription) && (
                        <div className="space-y-3 rounded-xl border border-primary/25 bg-primary/5 dark:bg-primary/10 p-3 sm:p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center">
                              <Zap className="w-3 h-3 text-primary" />
                            </div>
                            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                              AI Generated Content
                            </span>
                            {row.aiStatus !== "done" && (
                              <Badge variant="outline" className="text-[10px] h-4 ml-auto border-primary/30 text-primary">
                                Manually Edited
                              </Badge>
                            )}
                            {row.aiStatus === "done" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-auto h-6 text-xs text-primary/70 hover:text-primary px-2"
                                onClick={() => generateForRow(row)}
                                disabled={isBusy}
                                data-testid={`button-regenerate-${row.id}`}
                              >
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Regenerate
                              </Button>
                            )}
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">
                              Description
                            </label>
                            <Textarea
                              value={row.generatedDescription}
                              onChange={(e) =>
                                updateRow(row.id, { generatedDescription: e.target.value })
                              }
                              disabled={row.saveStatus === "done"}
                              rows={4}
                              className="text-sm resize-none bg-card"
                              placeholder="Product description will appear here…"
                              data-testid={`textarea-description-${row.id}`}
                            />
                          </div>

                          {/* Features */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">
                              Features <span className="font-normal">({row.generatedFeatures.length})</span>
                            </label>
                            <div className="space-y-1.5">
                              {row.generatedFeatures.map((f, i) => (
                                <div key={i} className="flex items-start gap-2 group" data-testid={`badge-feature-${row.id}-${i}`}>
                                  <span className="text-primary mt-0.5 flex-shrink-0">•</span>
                                  <span className="text-sm flex-1">{f}</span>
                                  {row.saveStatus !== "done" && (
                                    <button
                                      onClick={() => removeFeature(row.id, i)}
                                      className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-muted-foreground hover:text-destructive transition-all mt-0.5"
                                      data-testid={`button-remove-feature-${row.id}-${i}`}
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                              {row.saveStatus !== "done" && (
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground/40">•</span>
                                  <Input
                                    placeholder="Add a feature and press Enter…"
                                    value={row.newFeatureInput}
                                    onChange={(e) =>
                                      updateRow(row.id, { newFeatureInput: e.target.value })
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        addFeature(row.id, row.newFeatureInput);
                                      }
                                    }}
                                    onBlur={() => addFeature(row.id, row.newFeatureInput)}
                                    className="h-7 text-xs flex-1 bg-card"
                                    data-testid={`input-feature-${row.id}`}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Per-row save / saved state */}
                      {row.saveStatus === "done" ? (
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm py-1">
                          <PackageCheck className="w-4 h-4 flex-shrink-0" />
                          <span className="font-medium">Saved to store successfully</span>
                          <Badge variant="outline" className="ml-auto text-xs border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400">
                            Live
                          </Badge>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
                          {missingFields.length > 0 && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                              Required: {missingFields.join(", ")}
                            </p>
                          )}
                          {isReady && missingFields.length === 0 && row.aiStatus === "idle" && (
                            <p className="text-xs text-muted-foreground">
                              Ready to save — AI content is optional
                            </p>
                          )}
                          <div className="flex gap-2 sm:ml-auto flex-wrap">
                            <Button
                              size="sm"
                              variant={row.saveStatus === "error" ? "destructive" : "outline"}
                              onClick={() => saveRow(row)}
                              disabled={
                                row.saveStatus === "loading" ||
                                !row.name ||
                                !row.categoryId ||
                                !row.price ||
                                isBusy
                              }
                              data-testid={`button-save-${row.id}`}
                              className="h-8 text-xs sm:text-sm flex-1 sm:flex-none"
                            >
                              {row.saveStatus === "loading" ? (
                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                              ) : row.saveStatus === "error" ? (
                                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                              ) : (
                                <Save className="w-3.5 h-3.5 mr-1.5" />
                              )}
                              {row.saveStatus === "error" ? "Retry Save" : "Save Product"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Footer — desktop */}
          <div className="hidden sm:flex mt-5 flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={addRow}
              data-testid="button-add-row"
              disabled={isBusy}
              className="h-9"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product Row
            </Button>
            <p className="text-xs text-muted-foreground">
              Tip: Press <kbd className="px-1 py-0.5 bg-muted rounded text-[10px] font-mono">Enter</kbd> in feature or label inputs to add them
            </p>
          </div>
        </div>

        {/* Mobile sticky bottom bar */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-10 px-3 py-2.5 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={addRow}
            disabled={isBusy}
            className="h-9 flex-shrink-0"
            data-testid="button-add-row-mobile"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Row
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={generateAll}
            disabled={isBusy}
            className="h-9 border-primary/30 text-primary flex-shrink-0"
            data-testid="button-generate-all-mobile"
          >
            {isGeneratingAll ? (
              <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 mr-1" />
            )}
            AI All
          </Button>
          <Button
            size="sm"
            onClick={saveAll}
            disabled={isBusy || readyCount === 0}
            className="h-9 flex-1"
            data-testid="button-save-all-mobile"
          >
            {isSavingAll ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 mr-1.5" />
            )}
            Save All {readyCount > 0 && `(${readyCount})`}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
