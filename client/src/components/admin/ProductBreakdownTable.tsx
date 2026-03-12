import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Trash2,
  Search,
  Star,
  Loader2,
  ArrowUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PerProductStat } from "@/lib/seed-data/analytics";
import {
  seedSingleProduct,
  DEFAULT_SEED_OPTIONS,
} from "@/lib/seed-comments";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type SortKey = "productName" | "realCount" | "seededCount" | "avgRating" | "lastCommentDate";
type SortDir = "asc" | "desc";

interface Props {
  perProduct: PerProductStat[];
  onRefreshNeeded: () => void;
}

function StarsMini({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            "h-3 w-3",
            s <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/25"
          )}
        />
      ))}
    </span>
  );
}

export function ProductBreakdownTable({ perProduct, onRefreshNeeded }: Props) {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("seededCount");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);

  const adminUser = { uid: user?.uid ?? "", email: user?.email ?? null };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const filtered = perProduct
    .filter((p) =>
      search === "" || p.productName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let av: number | string = 0;
      let bv: number | string = 0;
      if (sortKey === "productName") {
        av = a.productName.toLowerCase();
        bv = b.productName.toLowerCase();
        return sortDir === "asc"
          ? (av as string).localeCompare(bv as string)
          : (bv as string).localeCompare(av as string);
      }
      if (sortKey === "lastCommentDate") {
        av = a.lastCommentDate?.getTime() ?? 0;
        bv = b.lastCommentDate?.getTime() ?? 0;
      } else {
        av = a[sortKey] as number;
        bv = b[sortKey] as number;
      }
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });

  const handleReseed = async (productId: string, productName: string) => {
    setLoadingProductId(productId);
    const ac = new AbortController();
    try {
      await seedSingleProduct(productId, DEFAULT_SEED_OPTIONS, adminUser, () => {}, ac.signal);
      toast({ title: "Re-seeded!", description: `"${productName}" has been re-seeded.` });
      queryClient.invalidateQueries({ queryKey: ["analytics-data"] });
      onRefreshNeeded();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Failed", description: e.message });
    } finally {
      setLoadingProductId(null);
    }
  };

  const handleRemoveSeeded = async (productId: string, productName: string) => {
    setLoadingProductId(productId);
    try {
      const snap = await getDocs(
        query(
          collection(db, "comments"),
          where("productId", "==", productId),
          where("userId", "==", "system-seed")
        )
      );
      for (const d of snap.docs) {
        await deleteDoc(doc(db, "comments", d.id));
      }
      toast({
        title: "Removed!",
        description: `${snap.size} seeded comment(s) removed from "${productName}".`,
      });
      queryClient.invalidateQueries({ queryKey: ["analytics-data"] });
      onRefreshNeeded();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Failed", description: e.message });
    } finally {
      setLoadingProductId(null);
    }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortDir === "asc" ? (
        <ChevronUp className="h-3 w-3 ml-1 inline-block" />
      ) : (
        <ChevronDown className="h-3 w-3 ml-1 inline-block" />
      )
    ) : (
      <ArrowUpDown className="h-3 w-3 ml-1 inline-block opacity-30" />
    );

  return (
    <div className="space-y-3" data-testid="product-breakdown-table">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-8 text-sm"
          data-testid="input-product-search"
        />
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none whitespace-nowrap text-xs"
                onClick={() => handleSort("productName")}
              >
                Product <SortIcon k="productName" />
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-center text-xs whitespace-nowrap"
                onClick={() => handleSort("realCount")}
              >
                Real <SortIcon k="realCount" />
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-center text-xs whitespace-nowrap"
                onClick={() => handleSort("seededCount")}
              >
                Seeded <SortIcon k="seededCount" />
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-xs whitespace-nowrap"
                onClick={() => handleSort("avgRating")}
              >
                Avg <SortIcon k="avgRating" />
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-xs whitespace-nowrap"
                onClick={() => handleSort("lastCommentDate")}
              >
                Last Review <SortIcon k="lastCommentDate" />
              </TableHead>
              <TableHead className="text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground text-sm py-8">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <>
                  <TableRow
                    key={p.productId}
                    className="cursor-pointer hover:bg-muted/30"
                    onClick={() =>
                      setExpandedId(expandedId === p.productId ? null : p.productId)
                    }
                    data-testid={`row-product-${p.productId}`}
                  >
                    <TableCell className="text-sm font-medium max-w-[200px] truncate">
                      <span className="flex items-center gap-1.5">
                        {expandedId === p.productId ? (
                          <ChevronUp className="h-3 w-3 shrink-0 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
                        )}
                        {p.productName}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {p.realCount > 0 ? (
                        <Badge variant="secondary" className="text-xs">{p.realCount}</Badge>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {p.seededCount > 0 ? (
                        <Badge variant="outline" className="text-xs">{p.seededCount}</Badge>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {p.avgRating > 0 ? (
                        <div className="flex items-center gap-1">
                          <StarsMini rating={p.avgRating} />
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {p.avgRating.toFixed(1)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {p.lastCommentDate
                        ? p.lastCommentDate.toLocaleDateString("en-PK", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          disabled={loadingProductId === p.productId}
                          onClick={() => handleReseed(p.productId, p.productName)}
                          data-testid={`button-reseed-${p.productId}`}
                          title="Re-seed this product"
                        >
                          {loadingProductId === p.productId ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3 w-3" />
                          )}
                        </Button>
                        {p.seededCount > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                            disabled={loadingProductId === p.productId}
                            onClick={() => handleRemoveSeeded(p.productId, p.productName)}
                            data-testid={`button-remove-seeded-${p.productId}`}
                            title="Remove seeded comments"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Expanded inline comments */}
                  {expandedId === p.productId && p.seededComments.length > 0 && (
                    <TableRow key={`${p.productId}-expanded`}>
                      <TableCell colSpan={6} className="bg-muted/20 p-0">
                        <div className="p-4 space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                          {p.seededComments.map((c) => (
                            <div
                              key={c.id}
                              className="text-xs border rounded-md p-3 bg-card space-y-1"
                            >
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium">{c.userName}</span>
                                <StarsMini rating={c.rating} />
                                {c.createdAt?.seconds && (
                                  <span className="text-muted-foreground">
                                    {new Date(c.createdAt.seconds * 1000).toLocaleDateString(
                                      "en-PK",
                                      { day: "numeric", month: "short", year: "numeric" }
                                    )}
                                  </span>
                                )}
                              </div>
                              <p className="text-muted-foreground leading-relaxed line-clamp-3">
                                {c.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground text-right">
        Showing {filtered.length} of {perProduct.length} products
      </p>
    </div>
  );
}
