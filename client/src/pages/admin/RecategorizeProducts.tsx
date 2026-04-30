import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { productFirestoreService } from "@/services/productFirestoreService";
import { categoryFirestoreService } from "@/services/categoryFirestoreService";
import { Loader2, CheckCircle2, XCircle, Wand2, Save } from "lucide-react";

type Category = { id: string; name: string; slug?: string };
type Product = {
  id: string;
  name: string;
  categoryId?: string;
  images?: string[];
};

const KEYWORD_RULES: { keywords: string[]; categoryName: string }[] = [
  { keywords: ["wallet", "purse holder"], categoryName: "Bags & Wallets" },
  {
    keywords: ["bag", "handbag", "clutch", "tote", "backpack", "purse"],
    categoryName: "Bags",
  },
  { keywords: ["watch", "wristwatch", "timepiece"], categoryName: "Watches" },
  {
    keywords: [
      "jewelry",
      "jewellery",
      "necklace",
      "ring",
      "earring",
      "bracelet",
      "pendant",
      "anklet",
    ],
    categoryName: "Jewelry",
  },
  {
    keywords: [
      "dress",
      "kurti",
      "kurta",
      "frock",
      "shirt",
      "shalwar",
      "kameez",
      "suit",
      "abaya",
    ],
    categoryName: "Stitched Dresses",
  },
  { keywords: ["slipper", "sandal", "chappal", "flip flop"], categoryName: "Slippers" },
  { keywords: ["shoe", "sneaker", "boot", "loafer", "heel"], categoryName: "Shoes" },
  { keywords: ["eid"], categoryName: "Eid Special Collection" },
  { keywords: ["custom", "personalized", "personalised"], categoryName: "Customizable Items" },
  {
    keywords: ["bedsheet", "bed sheet", "bedding", "duvet", "comforter", "pillowcase"],
    categoryName: "Bedsheets",
  },
];

function suggestCategory(productName: string, categories: Category[]): string | null {
  const text = (productName || "").toLowerCase();
  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((kw) => text.includes(kw))) {
      const cat = categories.find(
        (c) => c.name.trim().toLowerCase() === rule.categoryName.toLowerCase(),
      );
      if (cat) return cat.id;
    }
  }
  return null;
}

const UNCHANGED = "__unchanged__";
const NONE = "__none__";

export default function RecategorizeProducts() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState("");
  const [result, setResult] = useState<{ ok: number; skip: number; err: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [prods, cats] = await Promise.all([
          productFirestoreService.getAllProducts({}),
          categoryFirestoreService.getAllCategories(),
        ]);
        setProducts(prods as Product[]);
        setCategories(cats as Category[]);
      } catch (e: any) {
        toast({
          title: "Failed to load",
          description: e.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const categoryById = useMemo(() => {
    const m = new Map<string, Category>();
    categories.forEach((c) => m.set(c.id, c));
    return m;
  }, [categories]);

  const autoMatch = () => {
    const next: Record<string, string> = {};
    let matched = 0;
    products.forEach((p) => {
      const suggested = suggestCategory(p.name, categories);
      if (suggested && suggested !== p.categoryId) {
        next[p.id] = suggested;
        matched += 1;
      }
    });
    setSelections(next);
    toast({
      title: "Auto-matched",
      description: `Suggested category changes for ${matched} product${matched === 1 ? "" : "s"}.`,
    });
  };

  const setRow = (productId: string, value: string) => {
    setSelections((prev) => {
      const next = { ...prev };
      if (value === UNCHANGED) delete next[productId];
      else next[productId] = value;
      return next;
    });
  };

  const apply = async () => {
    const entries = Object.entries(selections);
    if (entries.length === 0) {
      toast({ title: "Nothing to apply", description: "No changes selected." });
      return;
    }
    setSaving(true);
    setResult(null);
    let ok = 0,
      skip = 0,
      err = 0;
    for (const [productId, newCatId] of entries) {
      try {
        const product = products.find((p) => p.id === productId);
        const targetId = newCatId === NONE ? "" : newCatId;
        if (product?.categoryId === targetId) {
          skip += 1;
          continue;
        }
        await productFirestoreService.updateProduct(productId, {
          categoryId: targetId,
        } as any);
        ok += 1;
      } catch (e) {
        err += 1;
      }
    }
    setProducts((prev) =>
      prev.map((p) =>
        selections[p.id] !== undefined
          ? { ...p, categoryId: selections[p.id] === NONE ? "" : selections[p.id] }
          : p,
      ),
    );
    setSelections({});
    setResult({ ok, skip, err });
    setSaving(false);
    toast({
      title: "Done",
      description: `Updated ${ok}, skipped ${skip}, failed ${err}.`,
      variant: err > 0 ? "destructive" : "default",
    });
  };

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, filter]);

  const pendingCount = Object.keys(selections).length;

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle data-testid="heading-recategorize">Re-categorize Products</CardTitle>
          <CardDescription>
            Assign the correct category to each existing product. Click{" "}
            <strong>Auto-Match by Name</strong> to suggest categories based on each product's name,
            adjust any rows manually, then click <strong>Apply Changes</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={autoMatch}
              disabled={loading || saving || products.length === 0}
              data-testid="button-auto-match"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Auto-Match by Name
            </Button>
            <Button
              onClick={apply}
              disabled={loading || saving || pendingCount === 0}
              data-testid="button-apply-changes"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Apply Changes ({pendingCount})
            </Button>
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by product name…"
              className="max-w-xs"
              data-testid="input-filter-products"
            />
            <div className="ml-auto text-sm text-muted-foreground">
              {products.length} product{products.length === 1 ? "" : "s"} ·{" "}
              {categories.length} categor{categories.length === 1 ? "y" : "ies"}
            </div>
          </div>

          {result && (
            <div className="flex gap-2 text-sm" data-testid="text-apply-result">
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" /> {result.ok} updated
              </Badge>
              <Badge variant="secondary">{result.skip} unchanged</Badge>
              {result.err > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="h-3 w-3" /> {result.err} failed
                </Badge>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading products…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No products found.</div>
          ) : (
            <div className="border rounded-md divide-y max-h-[70vh] overflow-y-auto">
              {filtered.map((p) => {
                const currentCat = p.categoryId ? categoryById.get(p.categoryId) : undefined;
                const pendingValue = selections[p.id];
                const suggested = suggestCategory(p.name, categories);
                const isSuggested =
                  suggested && pendingValue === suggested && suggested !== p.categoryId;
                return (
                  <div
                    key={p.id}
                    className="grid grid-cols-1 md:grid-cols-[1fr_auto_280px] gap-3 items-center p-3"
                    data-testid={`row-product-${p.id}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {p.images && p.images[0] ? (
                        <img
                          src={p.images[0]}
                          alt=""
                          className="h-12 w-12 rounded object-cover bg-muted shrink-0"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded bg-muted shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="font-medium truncate" data-testid={`text-name-${p.id}`}>
                          {p.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          Current:{" "}
                          {currentCat ? (
                            currentCat.name
                          ) : p.categoryId ? (
                            <span className="text-destructive">
                              Unknown ({p.categoryId.slice(0, 6)}…)
                            </span>
                          ) : (
                            <em>None</em>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-start md:justify-center">
                      {isSuggested && (
                        <Badge variant="secondary" className="text-xs">
                          Suggested
                        </Badge>
                      )}
                    </div>
                    <Select
                      value={pendingValue ?? UNCHANGED}
                      onValueChange={(v) => setRow(p.id, v)}
                    >
                      <SelectTrigger data-testid={`select-category-${p.id}`}>
                        <SelectValue placeholder="Choose category…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UNCHANGED}>— No change —</SelectItem>
                        <SelectItem value={NONE}>(Remove category)</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
