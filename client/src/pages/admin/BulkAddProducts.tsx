import { useState, useRef } from "react";
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
  ChevronsUpDown,
  X,
  AlertCircle,
  PackageCheck,
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
    "new,bestseller",
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

export default function BulkAddProducts() {
  const { toast } = useToast();
  const [rows, setRows] = useState<ProductRow[]>([emptyRow()]);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkTotal, setBulkTotal] = useState(0);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => categoryFirestoreService.getAllCategories(),
  });

  const updateRow = (id: string, updates: Partial<ProductRow>) => {
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
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

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

  const clearSaved = () => {
    setRows((prev) => {
      const remaining = prev.filter((r) => r.saveStatus !== "done");
      return remaining.length > 0 ? remaining : [emptyRow()];
    });
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
      });
    };
    reader.readAsText(file);
    e.target.value = "";
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
    setBulkProgress(0);
    setBulkTotal(pending.length);
    for (let i = 0; i < pending.length; i++) {
      await generateForRow(pending[i]);
      setBulkProgress(i + 1);
    }
    setIsGeneratingAll(false);
    setBulkTotal(0);
    toast({ title: "AI generation complete!" });
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
    setBulkProgress(0);
    setBulkTotal(toSave.length);
    let saved = 0;
    for (let i = 0; i < toSave.length; i++) {
      const ok = await saveRow(toSave[i]);
      if (ok) saved++;
      setBulkProgress(i + 1);
    }
    setIsSavingAll(false);
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
  const isBusy = isSavingAll || isGeneratingAll;
  const progressPercent = bulkTotal > 0 ? Math.round((bulkProgress / bulkTotal) * 100) : 0;

  return (
    <TooltipProvider>
      <div className="p-3 sm:p-6 max-w-5xl mx-auto">
        <SEO title="Bulk Add Products" description="" robots="noindex" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-5">
          <Button variant="ghost" size="sm" className="self-start p-0 h-auto" asChild>
            <Link href="/admin/products">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Products
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold">Bulk Add Products</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Add multiple products at once — AI generates descriptions automatically
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 mb-5 p-3 sm:p-4 bg-muted/40 rounded-xl border">
          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{rows.length}</span> rows
            </span>
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{readyCount}</span> ready
            </span>
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-primary">{aiDoneCount}</span> AI&nbsp;done
            </span>
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-emerald-600">{savedCount}</span> saved
            </span>
            {savedCount > 0 && (
              <button
                onClick={clearSaved}
                className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors ml-auto"
                data-testid="button-clear-saved"
              >
                Clear saved rows
              </button>
            )}
          </div>

          {/* Progress bar */}
          {isBusy && bulkTotal > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{isGeneratingAll ? "Generating AI descriptions…" : "Saving products…"}</span>
                <span>{bulkProgress} / {bulkTotal}</span>
              </div>
              <Progress value={progressPercent} className="h-1.5" />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {/* CSV Import */}
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
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Import CSV
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
                >
                  <FileDown className="w-3.5 h-3.5 mr-1.5" />
                  Template
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download a CSV template to fill in</TooltipContent>
            </Tooltip>

            <div className="flex gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={expandAll}
                    disabled={isBusy}
                    className="px-2"
                    data-testid="button-expand-all"
                  >
                    <ChevronsUpDown className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline ml-1">All</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Expand / collapse all</TooltipContent>
              </Tooltip>
            </div>

            <div className="flex-1" />

            <Button
              variant="outline"
              size="sm"
              onClick={generateAll}
              disabled={isBusy}
              data-testid="button-generate-all"
            >
              {isGeneratingAll ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" />
              )}
              <span className="hidden xs:inline">AI Generate All</span>
              <span className="xs:hidden">AI All</span>
            </Button>

            <Button
              size="sm"
              onClick={saveAll}
              disabled={isBusy || readyCount === 0}
              data-testid="button-save-all"
            >
              {isSavingAll ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5 mr-1.5" />
              )}
              Save All
            </Button>
          </div>
        </div>

        {/* Product rows */}
        <div className="space-y-3">
          {rows.map((row, index) => {
            const isReady = Boolean(row.name && row.categoryId && row.price);
            const missingFields = [
              !row.name && "name",
              !row.categoryId && "category",
              !row.price && "price",
            ].filter(Boolean) as string[];

            return (
              <Card
                key={row.id}
                className={cn(
                  "border transition-all",
                  row.saveStatus === "done" &&
                    "border-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/10",
                  row.saveStatus === "error" && "border-destructive/40"
                )}
                data-testid={`card-product-${row.id}`}
              >
                {/* Card header — always visible */}
                <CardHeader className="py-2.5 px-3 sm:px-4">
                  <div className="flex items-start gap-2">
                    {/* Row number */}
                    <span className="text-xs font-mono text-muted-foreground w-5 pt-2 text-center flex-shrink-0">
                      {index + 1}
                    </span>

                    {/* Primary fields grid */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      <div>
                        <Input
                          placeholder="Product name *"
                          value={row.name}
                          onChange={(e) => updateRow(row.id, { name: e.target.value })}
                          disabled={row.saveStatus === "done"}
                          data-testid={`input-product-name-${row.id}`}
                          className={cn(
                            "text-sm h-9",
                            !row.name && row.saveStatus === "error" && "border-destructive"
                          )}
                        />
                      </div>
                      <div>
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
                      <div>
                        <Input
                          placeholder="Price (Rs.) *"
                          type="number"
                          min="0"
                          value={row.price}
                          onChange={(e) => updateRow(row.id, { price: e.target.value })}
                          disabled={row.saveStatus === "done"}
                          data-testid={`input-price-${row.id}`}
                          className={cn(
                            "text-sm h-9",
                            !row.price && row.saveStatus === "error" && "border-destructive"
                          )}
                        />
                      </div>
                      <div>
                        <Input
                          placeholder="Original price (optional)"
                          type="number"
                          min="0"
                          value={row.originalPrice}
                          onChange={(e) => updateRow(row.id, { originalPrice: e.target.value })}
                          disabled={row.saveStatus === "done"}
                          data-testid={`input-original-price-${row.id}`}
                          className="text-sm h-9"
                        />
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-0.5 flex-shrink-0 pt-0.5">
                      {/* Status badges */}
                      {row.saveStatus === "done" && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-0.5" />
                      )}
                      {row.saveStatus === "error" && (
                        <XCircle className="w-4 h-4 text-destructive mr-0.5" />
                      )}
                      {!isReady && missingFields.length > 0 && row.saveStatus === "idle" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500 mr-0.5 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Missing: {missingFields.join(", ")}
                          </TooltipContent>
                        </Tooltip>
                      )}

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => generateForRow(row)}
                            disabled={row.aiStatus === "loading" || row.saveStatus === "done"}
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

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => toggleExpand(row.id)}
                        data-testid={`button-toggle-${row.id}`}
                      >
                        {row.expanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </Button>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => removeRow(row.id)}
                            disabled={rows.length === 1 || row.saveStatus === "done"}
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
                  <CardContent className="pt-0 pb-4 px-3 sm:px-4 space-y-4 border-t">
                    {/* Secondary fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
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
                          className="text-sm h-8"
                          data-testid={`input-profit-${row.id}`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          Stock quantity
                        </label>
                        <Input
                          type="number"
                          min="0"
                          value={row.stock}
                          onChange={(e) => updateRow(row.id, { stock: e.target.value })}
                          disabled={row.saveStatus === "done"}
                          className="text-sm h-8"
                          data-testid={`input-stock-${row.id}`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          Slug (auto-generated)
                        </label>
                        <Input
                          value={row.slug}
                          onChange={(e) => updateRow(row.id, { slug: e.target.value })}
                          disabled={row.saveStatus === "done"}
                          className="text-xs h-8 font-mono"
                          placeholder="product-slug"
                          data-testid={`input-slug-${row.id}`}
                        />
                      </div>
                    </div>

                    {/* Image URLs */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        Image URLs <span className="font-normal">(comma-separated)</span>
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
                    </div>

                    {/* Labels */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">
                        Labels / Tags
                      </label>
                      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                        {row.labels.map((label) => (
                          <Badge
                            key={label}
                            variant="secondary"
                            className="text-xs gap-1 pr-1"
                          >
                            {label}
                            {row.saveStatus !== "done" && (
                              <button
                                onClick={() => removeLabel(row.id, label)}
                                className="hover:text-destructive transition-colors"
                                data-testid={`button-remove-label-${row.id}-${label}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </Badge>
                        ))}
                        {row.saveStatus !== "done" && (
                          <Input
                            placeholder="Add label…"
                            value={row.newLabelInput}
                            onChange={(e) => updateRow(row.id, { newLabelInput: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === ",") {
                                e.preventDefault();
                                addLabel(row.id, row.newLabelInput);
                              }
                            }}
                            onBlur={() => addLabel(row.id, row.newLabelInput)}
                            className="h-6 text-xs w-28 px-2"
                            data-testid={`input-label-${row.id}`}
                          />
                        )}
                      </div>
                    </div>

                    {/* AI status: idle hint */}
                    {row.aiStatus === "idle" && (
                      <p className="text-xs text-muted-foreground italic">
                        Click <Sparkles className="inline w-3 h-3 text-primary" /> to auto-generate description and features with AI
                      </p>
                    )}

                    {/* AI Generated Content */}
                    {(row.aiStatus === "done" || row.generatedDescription) && (
                      <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                        <div className="flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                            AI Generated Content
                          </span>
                          {row.aiStatus !== "done" && (
                            <Badge variant="outline" className="text-[10px] h-4 ml-auto">
                              Edited
                            </Badge>
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
                            className="text-sm resize-none"
                            data-testid={`textarea-description-${row.id}`}
                          />
                        </div>

                        {/* Features editor */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">
                            Features ({row.generatedFeatures.length})
                          </label>
                          <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                            {row.generatedFeatures.map((f, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="text-xs font-normal gap-1 pr-1 max-w-[200px]"
                                data-testid={`badge-feature-${row.id}-${i}`}
                              >
                                <span className="truncate">{f}</span>
                                {row.saveStatus !== "done" && (
                                  <button
                                    onClick={() => removeFeature(row.id, i)}
                                    className="flex-shrink-0 hover:text-destructive transition-colors"
                                    data-testid={`button-remove-feature-${row.id}-${i}`}
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </Badge>
                            ))}
                            {row.saveStatus !== "done" && (
                              <Input
                                placeholder="Add feature…"
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
                                className="h-6 text-xs w-32 px-2"
                                data-testid={`input-feature-${row.id}`}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Per-row save / saved state */}
                    {row.saveStatus === "done" ? (
                      <div className="flex items-center gap-2 text-emerald-600 text-sm pt-1">
                        <PackageCheck className="w-4 h-4" />
                        <span className="font-medium">Saved to store successfully</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                        {missingFields.length > 0 && (
                          <p className="text-xs text-amber-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Missing: {missingFields.join(", ")}
                          </p>
                        )}
                        <div className="ml-auto">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => saveRow(row)}
                            disabled={
                              row.saveStatus === "loading" ||
                              !row.name ||
                              !row.categoryId ||
                              !row.price
                            }
                            data-testid={`button-save-${row.id}`}
                          >
                            {row.saveStatus === "loading" ? (
                              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                            ) : (
                              <Save className="w-3.5 h-3.5 mr-1.5" />
                            )}
                            Save this product
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

        {/* Footer actions */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={addRow}
            data-testid="button-add-row"
            disabled={isBusy}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
          {savedCount > 0 && (
            <Button variant="ghost" asChild data-testid="link-view-products">
              <Link href="/admin/products">
                View {savedCount} saved in Products →
              </Link>
            </Button>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
