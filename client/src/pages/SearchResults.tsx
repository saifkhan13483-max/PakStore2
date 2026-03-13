import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Star,
  ImageOff,
  Loader2,
  TrendingUp,
  Home,
  ChevronRight,
  Lightbulb,
  FolderOpen,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { searchProductsPage, getSmartSuggestions, saveRecentSearch } from "@/services/searchService";
import { logSearch } from "@/services/searchAnalyticsService";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { useQuery } from "@tanstack/react-query";
import type { SearchOptions, SearchResult, SmartSuggestion } from "@shared/schema";

type SortOption = "relevance" | "price_asc" | "price_desc" | "rating" | "newest";

const SORT_LABELS: Record<SortOption, string> = {
  relevance: "Relevance",
  price_asc: "Price: Low to High",
  price_desc: "Price: High to Low",
  rating: "Customer Rating",
  newest: "Newest",
};

const PRICE_PRESETS = [
  { label: "Under Rs. 500", min: undefined, max: 500 },
  { label: "Rs. 500 – 1,000", min: 500, max: 1000 },
  { label: "Rs. 1,000 – 2,000", min: 1000, max: 2000 },
  { label: "Rs. 2,000 – 5,000", min: 2000, max: 5000 },
  { label: "Over Rs. 5,000", min: 5000, max: undefined },
];

const PAGE_SIZE = 20;

function sanitizeParam(val: string | null): string {
  if (!val) return "";
  return val.replace(/<[^>]*>/g, "").substring(0, 100).trim();
}

function formatPrice(price: number): string {
  return "Rs. " + price.toLocaleString("en-PK");
}

function useUrlParams() {
  const [location, setLocation] = useLocation();

  // useLocation gives just the pathname; read search from window.location for reactivity
  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );

  const q = sanitizeParam(params.get("q"));
  const sort = (params.get("sort") as SortOption) || "relevance";
  const category = params.get("category") || "";
  const minPrice = params.get("minPrice") ? Number(params.get("minPrice")) : undefined;
  const maxPrice = params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined;
  const inStock = params.get("inStock") === "true";

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const next = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : ""
      );
      for (const [key, val] of Object.entries(updates)) {
        if (val === undefined || val === "" || val === "false") {
          next.delete(key);
        } else {
          next.set(key, val);
        }
      }
      const qs = next.toString();
      setLocation(qs ? `/search?${qs}` : "/search");
    },
    [location, setLocation]
  );

  return { q, sort, category, minPrice, maxPrice, inStock, updateParams };
}

function SearchResultCard({ result }: { result: SearchResult }) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = result.primaryImage
    ? getOptimizedImageUrl(result.primaryImage, { width: 300, height: 380, crop: "fill" })
    : null;

  return (
    <Link href={`/products/${result.slug}`}>
      <div
        className="group bg-white dark:bg-card rounded-2xl overflow-hidden border border-gray-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
        data-testid={`search-result-card-${result.productId}`}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 flex items-center justify-center">
          {imageUrl && !imgError ? (
            <img
              src={imageUrl}
              alt={result.name}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              width="300"
              height="380"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
              <ImageOff className="h-8 w-8" />
              <span className="text-xs">No Image</span>
            </div>
          )}

          {!result.inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                Out of Stock
              </span>
            </div>
          )}

          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {result.labels?.includes("Best Seller") && (
              <span className="bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                Best Seller
              </span>
            )}
            {result.labels?.includes("New") && (
              <span className="bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                New
              </span>
            )}
          </div>
        </div>

        <div className="p-2 md:p-3">
          <p className="text-[10px] text-muted-foreground mb-0.5 truncate">{result.categoryName}</p>
          <h3 className="text-[11px] md:text-[13px] font-semibold text-foreground leading-tight line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {result.name}
          </h3>

          <div className="flex items-center justify-between mt-1 pt-1 border-t border-muted/50">
            <span className="text-[12px] md:text-[14px] font-black text-primary">
              {formatPrice(result.price)}
            </span>
            {result.rating > 0 && (
              <div className="flex items-center gap-0.5 bg-yellow-50 dark:bg-yellow-950/30 px-1.5 py-0.5 rounded">
                <Star className="w-2.5 h-2.5 fill-yellow-500 text-yellow-500" />
                <span className="text-[9px] font-bold text-yellow-700 dark:text-yellow-400">
                  {result.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-card rounded-2xl overflow-hidden border border-gray-100">
      <Skeleton className="aspect-[4/5] w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/4 mt-2" />
      </div>
    </div>
  );
}

function SmartEmptyState({
  query,
  onSearch,
}: {
  query: string;
  onSearch: (q: string) => void;
}) {
  const { data: smart, isLoading } = useQuery<SmartSuggestion>({
    queryKey: ["smart-suggestions", query],
    queryFn: () => getSmartSuggestions(query),
    enabled: query.length > 0,
    staleTime: 2 * 60_000,
    gcTime: 10 * 60_000,
  });

  return (
    <div className="flex flex-col items-center py-12 px-4 text-center max-w-2xl mx-auto w-full">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <Search className="w-10 h-10 text-gray-400" />
      </div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-foreground mb-2">
        No results for &ldquo;{query}&rdquo;
      </h2>
      <p className="text-gray-500 text-sm mb-6 max-w-sm">
        We couldn&rsquo;t find any products matching your search.
      </p>

      {isLoading ? (
        <div className="space-y-3 w-full max-w-sm">
          <Skeleton className="h-5 w-48 mx-auto" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
        </div>
      ) : (
        <>
          {smart?.correctedQuery && (
            <div className="mb-6 p-3 bg-primary/5 border border-primary/20 rounded-xl inline-flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Did you mean:{" "}
                <button
                  type="button"
                  onClick={() => onSearch(smart.correctedQuery!)}
                  className="font-semibold text-primary hover:underline"
                  data-testid="did-you-mean-btn"
                >
                  {smart.correctedQuery}
                </button>
                ?
              </span>
            </div>
          )}

          {smart?.relatedCategories && smart.relatedCategories.length > 0 && (
            <div className="mb-8 w-full">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5 justify-center">
                <FolderOpen className="w-3.5 h-3.5" />
                Browse by category
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {smart.relatedCategories.map((cat) => (
                  <Link key={cat.id} href={`/collections/${cat.slug}`}>
                    <span
                      className="px-4 py-1.5 text-sm rounded-full border border-primary/30 text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
                      data-testid={`empty-category-${cat.slug}`}
                    >
                      {cat.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {smart?.relatedProducts && smart.relatedProducts.length > 0 && (
            <div className="mb-8 w-full">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-1.5 justify-center">
                <ArrowRight className="w-3.5 h-3.5" />
                Related products you might like
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {smart.relatedProducts.slice(0, 4).map((result) => (
                  <SearchResultCard key={result.productId} result={result} />
                ))}
              </div>
            </div>
          )}

          {smart?.trendingNow && smart.trendingNow.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5 justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
                Trending on PakCart
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {smart.trendingNow.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => onSearch(term)}
                    className="px-4 py-1.5 text-sm rounded-full border border-gray-200 text-gray-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
                    data-testid={`empty-trending-${term}`}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-3 justify-center">
            <ul className="text-sm text-gray-500 space-y-1 mb-2 text-left list-none">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                Check your spelling
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                Try more general terms
              </li>
            </ul>
          </div>
          <Link href="/categories">
            <Button variant="outline" className="mt-4 rounded-full">
              Browse All Categories
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}

export default function SearchResults() {
  const { q, sort, category, minPrice, maxPrice, inStock, updateParams } = useUrlParams();
  const [, setLocation] = useLocation();

  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [customMin, setCustomMin] = useState("");
  const [customMax, setCustomMax] = useState("");

  const filters: SearchOptions = useMemo(
    () => ({
      sortBy: sort,
      categorySlug: category || undefined,
      minPrice,
      maxPrice,
      inStockOnly: inStock,
    }),
    [sort, category, minPrice, maxPrice, inStock]
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["search-results", q, sort, category, minPrice, maxPrice, inStock],
    queryFn: ({ pageParam }) =>
      searchProductsPage(q, {
        ...filters,
        cursor: pageParam ?? undefined,
        pageSize: PAGE_SIZE,
      }),
    initialPageParam: null as Parameters<typeof searchProductsPage>[1]["cursor"],
    getNextPageParam: (lastPage) => lastPage.cursor ?? undefined,
    enabled: q.length > 0,
    staleTime: 2 * 60_000,
    gcTime: 10 * 60_000,
  });

  const allResults = useMemo(
    () => data?.pages.flatMap((p) => p.results) ?? [],
    [data]
  );

  const totalCount = allResults.length;
  const isLastPage = !hasNextPage;

  const categoriesInResults = useMemo(() => {
    const seen = new Set<string>();
    const cats: { slug: string; name: string }[] = [];
    for (const r of allResults) {
      if (r.categorySlug && !seen.has(r.categorySlug)) {
        seen.add(r.categorySlug);
        cats.push({ slug: r.categorySlug, name: r.categoryName });
      }
    }
    return cats;
  }, [allResults]);

  const handleNewSearch = useCallback(
    (newQ: string) => {
      if (!newQ.trim()) return;
      saveRecentSearch(newQ.trim());
      updateParams({ q: newQ.trim() });
    },
    [updateParams]
  );

  // Fire-and-forget analytics logging when first page of results loads
  const loggedQueryRef = useRef<string>("");
  useEffect(() => {
    if (!q || isLoading) return;
    const firstPage = data?.pages[0];
    if (firstPage === undefined) return;
    if (loggedQueryRef.current === q) return;
    loggedQueryRef.current = q;
    logSearch(q, allResults.length);
  }, [q, isLoading, data, allResults.length]);

  const handleSortChange = (val: string) => {
    updateParams({ sort: val });
    setMobileSortOpen(false);
  };

  const handleCategoryFilter = (slug: string) => {
    updateParams({ category: category === slug ? "" : slug });
  };

  const handlePricePreset = (min: number | undefined, max: number | undefined) => {
    updateParams({
      minPrice: min !== undefined ? String(min) : undefined,
      maxPrice: max !== undefined ? String(max) : undefined,
    });
    setMobileFilterOpen(false);
  };

  const handleCustomPrice = () => {
    const min = customMin ? Number(customMin) : undefined;
    const max = customMax ? Number(customMax) : undefined;
    updateParams({
      minPrice: min !== undefined ? String(min) : undefined,
      maxPrice: max !== undefined ? String(max) : undefined,
    });
    setMobileFilterOpen(false);
  };

  const handleInStockToggle = (checked: boolean) => {
    updateParams({ inStock: checked ? "true" : undefined });
  };

  const clearAllFilters = () => {
    updateParams({
      sort: undefined,
      category: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      inStock: undefined,
    });
    setCustomMin("");
    setCustomMax("");
  };

  const activeFilterCount = [
    sort !== "relevance",
    !!category,
    minPrice !== undefined || maxPrice !== undefined,
    inStock,
  ].filter(Boolean).length;

  const priceLabel = useMemo(() => {
    if (minPrice !== undefined && maxPrice !== undefined)
      return `Rs. ${minPrice.toLocaleString()} – ${maxPrice.toLocaleString()}`;
    if (minPrice !== undefined) return `Over Rs. ${minPrice.toLocaleString()}`;
    if (maxPrice !== undefined) return `Under Rs. ${maxPrice.toLocaleString()}`;
    return null;
  }, [minPrice, maxPrice]);

  return (
    <>
      <Helmet>
        <title>Search results for &apos;{q}&apos; — PakCart</title>
        <meta
          name="description"
          content={`Find ${q} at best prices on PakCart. Cash on Delivery available.`}
        />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
            <Link href="/">
              <span className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer">
                <Home className="w-3 h-3" />
                Home
              </span>
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">Search Results</span>
          </nav>

          {/* Results count / query heading */}
          <div className="mb-4">
            {isLoading ? (
              <Skeleton className="h-7 w-72" />
            ) : (
              <h1 className="text-lg font-bold text-gray-800 dark:text-foreground" data-testid="search-results-heading">
                {totalCount > 0 ? (
                  <>
                    Showing{" "}
                    <span className="text-primary">{totalCount}</span>{" "}
                    {hasNextPage ? "+" : ""} result{totalCount !== 1 ? "s" : ""} for{" "}
                    <span className="text-primary">&ldquo;{q}&rdquo;</span>
                  </>
                ) : !isLoading && q ? (
                  <>No results for &ldquo;{q}&rdquo;</>
                ) : null}
              </h1>
            )}
          </div>

          {/* ── DESKTOP FILTER BAR ── */}
          <div className="hidden md:flex items-center gap-3 flex-wrap mb-6 p-3 bg-white dark:bg-card rounded-xl border border-gray-200 shadow-sm sticky top-16 z-30">
            {/* Sort */}
            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger
                className="w-[180px] h-9 text-sm rounded-lg"
                data-testid="sort-select"
              >
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {SORT_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category pills */}
            {categoriesInResults.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {categoriesInResults.map((cat) => (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => handleCategoryFilter(cat.slug)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                      category === cat.slug
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                    )}
                    data-testid={`category-pill-${cat.slug}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {/* Price dropdown */}
            <Select
              value={
                PRICE_PRESETS.find(
                  (p) => p.min === minPrice && p.max === maxPrice
                )?.label ?? "all"
              }
              onValueChange={(val) => {
                if (val === "all") {
                  handlePricePreset(undefined, undefined);
                  return;
                }
                const preset = PRICE_PRESETS.find((p) => p.label === val);
                if (preset) handlePricePreset(preset.min, preset.max);
              }}
            >
              <SelectTrigger className="w-[190px] h-9 text-sm rounded-lg" data-testid="price-select">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Price</SelectItem>
                {PRICE_PRESETS.map((p) => (
                  <SelectItem key={p.label} value={p.label}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* In Stock toggle */}
            <div className="flex items-center gap-2 ml-1" data-testid="instock-toggle-wrapper">
              <Switch
                id="in-stock-desktop"
                checked={inStock}
                onCheckedChange={handleInStockToggle}
                data-testid="instock-toggle"
              />
              <label
                htmlFor="in-stock-desktop"
                className="text-sm text-gray-600 cursor-pointer select-none"
              >
                In Stock Only
              </label>
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-1.5 ml-auto flex-wrap">
                {sort !== "relevance" && (
                  <Badge variant="secondary" className="gap-1 text-xs pr-1">
                    {SORT_LABELS[sort]}
                    <button
                      type="button"
                      onClick={() => updateParams({ sort: undefined })}
                      className="ml-0.5 hover:text-destructive"
                      data-testid="remove-sort-filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {category && (
                  <Badge variant="secondary" className="gap-1 text-xs pr-1">
                    {categoriesInResults.find((c) => c.slug === category)?.name ?? category}
                    <button
                      type="button"
                      onClick={() => updateParams({ category: undefined })}
                      className="ml-0.5 hover:text-destructive"
                      data-testid="remove-category-filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {priceLabel && (
                  <Badge variant="secondary" className="gap-1 text-xs pr-1">
                    {priceLabel}
                    <button
                      type="button"
                      onClick={() => updateParams({ minPrice: undefined, maxPrice: undefined })}
                      className="ml-0.5 hover:text-destructive"
                      data-testid="remove-price-filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {inStock && (
                  <Badge variant="secondary" className="gap-1 text-xs pr-1">
                    In Stock
                    <button
                      type="button"
                      onClick={() => updateParams({ inStock: undefined })}
                      className="ml-0.5 hover:text-destructive"
                      data-testid="remove-instock-filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs text-muted-foreground hover:text-destructive underline ml-1"
                  data-testid="clear-all-filters"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* ── MOBILE FILTER BAR ── */}
          <div className="md:hidden flex gap-2 mb-4 sticky top-14 z-30 bg-gray-50 dark:bg-background py-2">
            <button
              type="button"
              onClick={() => setMobileSortOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white dark:bg-card border border-gray-200 text-sm font-medium text-gray-700 hover:border-primary transition-colors"
              data-testid="mobile-sort-btn"
            >
              <ArrowUpDown className="w-4 h-4" />
              Sort
              {sort !== "relevance" && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white dark:bg-card border border-gray-200 text-sm font-medium text-gray-700 hover:border-primary transition-colors"
              data-testid="mobile-filter-btn"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filter
              {activeFilterCount > 0 && (
                <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* ── RESULTS GRID ── */}
          {isError && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">Something went wrong. Please try again.</p>
              <Button
                variant="outline"
                className="mt-4 rounded-full"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : allResults.length === 0 && q ? (
            <SmartEmptyState
              query={q}
              onSearch={handleNewSearch}
            />
          ) : (
            <>
              <div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
                data-testid="search-results-grid"
              >
                {allResults.map((result) => (
                  <SearchResultCard key={result.productId} result={result} />
                ))}
              </div>

              {/* Load More */}
              <div className="flex flex-col items-center mt-10 mb-6">
                {hasNextPage ? (
                  <Button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="rounded-full px-8 py-2.5 min-w-[180px]"
                    data-testid="load-more-btn"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More Results"
                    )}
                  </Button>
                ) : totalCount > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    You&rsquo;ve seen all {totalCount} results
                  </p>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── MOBILE SORT BOTTOM SHEET ── */}
      {mobileSortOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileSortOpen(false)}
          />
          <div className="relative bg-white dark:bg-card rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold text-sm">Sort By</span>
              <button
                type="button"
                onClick={() => setMobileSortOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100"
                data-testid="mobile-sort-close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 pb-8">
              {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSortChange(key)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors",
                    sort === key
                      ? "bg-primary/10 text-primary font-semibold"
                      : "hover:bg-gray-50 text-gray-700"
                  )}
                  data-testid={`mobile-sort-${key}`}
                >
                  {SORT_LABELS[key]}
                  {sort === key && (
                    <span className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE FILTER BOTTOM SHEET ── */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative bg-white dark:bg-card rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-white dark:bg-card z-10">
              <span className="font-semibold text-sm">Filters</span>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100"
                data-testid="mobile-filter-close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-5">
              {/* Category */}
              {categoriesInResults.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Category
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categoriesInResults.map((cat) => (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => handleCategoryFilter(cat.slug)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                          category === cat.slug
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-gray-200 text-gray-600"
                        )}
                        data-testid={`mobile-category-pill-${cat.slug}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range Presets */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Price Range
                </p>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => handlePricePreset(undefined, undefined)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      minPrice === undefined && maxPrice === undefined
                        ? "bg-primary/10 text-primary font-semibold"
                        : "hover:bg-gray-50 text-gray-700"
                    )}
                    data-testid="mobile-price-any"
                  >
                    Any Price
                  </button>
                  {PRICE_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handlePricePreset(p.min, p.max)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        minPrice === p.min && maxPrice === p.max
                          ? "bg-primary/10 text-primary font-semibold"
                          : "hover:bg-gray-50 text-gray-700"
                      )}
                      data-testid={`mobile-price-${p.label}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Custom range */}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={customMin}
                    onChange={(e) => setCustomMin(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    data-testid="mobile-price-min-input"
                  />
                  <span className="text-gray-400">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={customMax}
                    onChange={(e) => setCustomMax(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    data-testid="mobile-price-max-input"
                  />
                  <button
                    type="button"
                    onClick={handleCustomPrice}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
                    data-testid="mobile-price-go-btn"
                  >
                    Go
                  </button>
                </div>
              </div>

              {/* In Stock */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700">In Stock Only</span>
                <Switch
                  id="in-stock-mobile"
                  checked={inStock}
                  onCheckedChange={handleInStockToggle}
                  data-testid="mobile-instock-toggle"
                />
              </div>
            </div>

            <div className="px-4 pb-8 pt-2 flex gap-3 sticky bottom-0 bg-white dark:bg-card border-t">
              <Button
                variant="outline"
                className="flex-1 rounded-full"
                onClick={clearAllFilters}
                data-testid="mobile-clear-filters-btn"
              >
                Clear All
              </Button>
              <Button
                className="flex-1 rounded-full"
                onClick={() => setMobileFilterOpen(false)}
                data-testid="mobile-apply-filters-btn"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
