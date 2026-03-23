import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface ProductRow {
  id: string;
  name: string;
  categoryId: string;
  price: string;
  originalPrice: string;
  stock: string;
  imageUrls: string;
  generatedDescription: string;
  generatedFeatures: string[];
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
    stock: "10",
    imageUrls: "",
    generatedDescription: "",
    generatedFeatures: [],
    slug: "",
    aiStatus: "idle",
    saveStatus: "idle",
    expanded: true,
  };
}

export default function BulkAddProducts() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [rows, setRows] = useState<ProductRow[]>([emptyRow()]);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

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

  const removeRow = (id: string) => {
    if (rows.length === 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleExpand = (id: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, expanded: !r.expanded } : r))
    );
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
    for (const row of pending) {
      await generateForRow(row);
    }
    setIsGeneratingAll(false);
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
        profit: 0,
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
        labels: [],
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
    let saved = 0;
    for (const row of toSave) {
      const ok = await saveRow(row);
      if (ok) saved++;
    }
    setIsSavingAll(false);

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

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <SEO title="Bulk Add Products" description="" robots="noindex" />

      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" className="p-0 h-auto" asChild>
          <Link href="/admin/products">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Bulk Add Products</h1>
          <p className="text-sm text-muted-foreground">
            Add multiple products at once — AI generates descriptions automatically
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-muted/40 rounded-xl border">
        <div className="flex items-center gap-4 flex-1 min-w-0 flex-wrap gap-y-2">
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{rows.length}</span> rows
          </span>
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{readyCount}</span> ready
          </span>
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-primary">{aiDoneCount}</span> AI generated
          </span>
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-emerald-600">{savedCount}</span> saved
          </span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={generateAll}
            disabled={isGeneratingAll || isSavingAll}
            data-testid="button-generate-all"
          >
            {isGeneratingAll ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2 text-primary" />
            )}
            AI Generate All
          </Button>
          <Button
            size="sm"
            onClick={saveAll}
            disabled={isSavingAll || isGeneratingAll || readyCount === 0}
            data-testid="button-save-all"
          >
            {isSavingAll ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save All to Store
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {rows.map((row, index) => (
          <Card
            key={row.id}
            className={cn(
              "border transition-all",
              row.saveStatus === "done" && "border-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/10",
              row.saveStatus === "error" && "border-destructive/40"
            )}
          >
            <CardHeader className="py-3 px-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-muted-foreground w-6 text-center">
                  {index + 1}
                </span>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <Input
                    placeholder="Product name *"
                    value={row.name}
                    onChange={(e) => updateRow(row.id, { name: e.target.value })}
                    disabled={row.saveStatus === "done"}
                    data-testid={`input-product-name-${row.id}`}
                    className="text-sm h-8"
                  />
                  <Select
                    value={row.categoryId}
                    onValueChange={(v) => updateRow(row.id, { categoryId: v })}
                    disabled={row.saveStatus === "done"}
                  >
                    <SelectTrigger className="h-8 text-sm" data-testid={`select-category-${row.id}`}>
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
                  <Input
                    placeholder="Price (Rs.) *"
                    type="number"
                    value={row.price}
                    onChange={(e) => updateRow(row.id, { price: e.target.value })}
                    disabled={row.saveStatus === "done"}
                    data-testid={`input-price-${row.id}`}
                    className="text-sm h-8"
                  />
                  <Input
                    placeholder="Original price (optional)"
                    type="number"
                    value={row.originalPrice}
                    onChange={(e) => updateRow(row.id, { originalPrice: e.target.value })}
                    disabled={row.saveStatus === "done"}
                    data-testid={`input-original-price-${row.id}`}
                    className="text-sm h-8"
                  />
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {row.saveStatus === "done" && (
                    <Badge className="bg-emerald-500 text-white text-[10px] h-5">Saved</Badge>
                  )}
                  {row.saveStatus === "error" && (
                    <XCircle className="w-4 h-4 text-destructive" />
                  )}
                  {row.aiStatus === "done" && row.saveStatus === "idle" && (
                    <Badge variant="outline" className="text-primary border-primary/30 text-[10px] h-5">
                      AI Ready
                    </Badge>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => generateForRow(row)}
                    disabled={row.aiStatus === "loading" || row.saveStatus === "done"}
                    title="Generate with AI"
                    data-testid={`button-ai-generate-${row.id}`}
                  >
                    {row.aiStatus === "loading" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => toggleExpand(row.id)}
                    title={row.expanded ? "Collapse" : "Expand"}
                  >
                    {row.expanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length === 1 || row.saveStatus === "done"}
                    title="Remove row"
                    data-testid={`button-remove-${row.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {row.expanded && (
              <CardContent className="pt-0 pb-4 px-4 space-y-3 border-t">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
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
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Stock quantity
                    </label>
                    <Input
                      type="number"
                      value={row.stock}
                      onChange={(e) => updateRow(row.id, { stock: e.target.value })}
                      disabled={row.saveStatus === "done"}
                      className="text-sm h-8"
                      data-testid={`input-stock-${row.id}`}
                    />
                    <label className="text-xs font-medium text-muted-foreground mb-1 block mt-2">
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

                {row.aiStatus === "done" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                        AI Generated Content
                      </span>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
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
                    {row.generatedFeatures.length > 0 && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                          Features ({row.generatedFeatures.length})
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {row.generatedFeatures.map((f, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-xs font-normal max-w-xs truncate"
                            >
                              {f}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {row.aiStatus === "idle" && (
                  <p className="text-xs text-muted-foreground italic">
                    Click <Sparkles className="inline w-3 h-3 text-primary" /> to auto-generate description and features with AI
                  </p>
                )}

                {row.saveStatus !== "done" && (
                  <div className="flex justify-end pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => saveRow(row)}
                      disabled={row.saveStatus === "loading" || !row.name || !row.categoryId || !row.price}
                      data-testid={`button-save-${row.id}`}
                    >
                      {row.saveStatus === "loading" ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      ) : row.saveStatus === "done" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                      ) : (
                        <Save className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      Save this product
                    </Button>
                  </div>
                )}

                {row.saveStatus === "done" && (
                  <div className="flex items-center gap-2 text-emerald-600 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-medium">Saved to store successfully</span>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button
          variant="outline"
          onClick={addRow}
          data-testid="button-add-row"
          disabled={isSavingAll || isGeneratingAll}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Another Product
        </Button>
        {savedCount > 0 && (
          <Button variant="ghost" asChild>
            <Link href="/admin/products">
              View in Products List →
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
