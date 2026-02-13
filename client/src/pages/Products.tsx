import { useState, useMemo, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import SEO from "@/components/SEO";
import { ProductCard as ProductCardComponent } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Filters, type FilterState } from "@/components/products/Filters";
import { useQuery } from "@tanstack/react-query";
import { productFirestoreService } from "@/services/productFirestoreService";

type SortOption = "featured" | "price-low" | "price-high" | "newest";

export default function Products() {
  const [location] = useLocation();
  const search = useSearch();
  const [visibleCount, setVisibleCount] = useState(8);
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [filterState, setFilterState] = useState<FilterState>({
    categories: [],
    priceRange: null,
    inStockOnly: false,
  });

  const queryParam = useMemo(() => {
    const params = new URLSearchParams(search);
    return params.get("search") || params.get("q") || "";
  }, [search]);

  // Handle URL parameters for initial filters
  useEffect(() => {
    const params = new URLSearchParams(search);
    const cat = params.get("category") || params.get("categoryId");
    const parentCat = params.get("parentCategoryId");
    
    if (cat) {
      setFilterState(prev => ({ ...prev, categories: [cat] }));
    } else if (parentCat) {
      // If a parent category is selected, we might want to filter by all its sub-categories
      // For now, let's just clear sub-category filters if a parent is explicitly viewed
      // or handle it by fetching all products for that parent in the query
      setFilterState(prev => ({ ...prev, categories: [] }));
    }
  }, [search]);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", { categories: filterState.categories, sortBy, queryParam, parentCategoryId: new URLSearchParams(search).get("parentCategoryId") }],
    queryFn: () => {
      const params = new URLSearchParams(search);
      return productFirestoreService.getAllProducts({
        category: filterState.categories.length > 0 ? filterState.categories[0] : undefined,
        parentCategoryId: params.get("parentCategoryId") || undefined,
        search: queryParam,
        sortBy: sortBy === "price-low" ? "price-asc" : sortBy === "price-high" ? "price-desc" : sortBy === "newest" ? "newest" : undefined,
        limit: 100 
      });
    }
  });

  const filteredAndSortedProducts = useMemo(() => {
    if (!productsData) return [];
    let result = [...productsData];

    // Client-side additional filters if not handled by Firestore service
    // Filter by category (double check client side)
    if (filterState.categories.length > 0) {
      result = result.filter(p => filterState.categories.includes(String(p.categoryId)));
    }

    // Filter by price range
    if (filterState.priceRange) {
      const ranges: Record<string, { min: number; max: number }> = {
        "Under Rs. 1,000": { min: 0, max: 1000 },
        "Rs. 1,000 - Rs. 3,000": { min: 1000, max: 3000 },
        "Rs. 3,000 - Rs. 5,000": { min: 3000, max: 5000 },
        "Rs. 5,000 - Rs. 10,000": { min: 5000, max: 10000 },
        "Over Rs. 10,000": { min: 10000, max: Infinity },
      };
      const range = ranges[filterState.priceRange];
      if (range) {
        result = result.filter((p) => p.price >= range.min && p.price <= range.max);
      }
    }

    // Filter by availability
    if (filterState.inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    return result;
  }, [productsData, filterState]);

  const displayedProducts = useMemo(() => {
    return filteredAndSortedProducts.slice(0, visibleCount);
  }, [filteredAndSortedProducts, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 8, filteredAndSortedProducts.length));
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilterState(newFilters);
    setVisibleCount(8); // Reset visibility when filters change
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO 
        title="Shop All Products" 
        description="Browse our complete collection of authentic Pakistani artisanal products, including apparel, home decor, and food."
      />

      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Shop</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Filter Trigger */}
        <div className="lg:hidden mb-6 flex gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex-1 gap-2 h-11 rounded-xl shadow-sm hover:bg-accent transition-colors">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader className="border-b pb-4">
                <SheetTitle className="text-xl font-bold">Refine Collection</SheetTitle>
              </SheetHeader>
              <div className="py-6 overflow-y-auto max-h-[calc(100vh-100px)]">
                <Filters onFilterChange={handleFilterChange} />
              </div>
            </SheetContent>
          </Sheet>
          <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
            <SelectTrigger className="w-[180px] h-11 rounded-xl shadow-sm">
              <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest Arrivals</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-28 bg-card rounded-2xl p-6 border shadow-sm">
            <Filters onFilterChange={handleFilterChange} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {queryParam ? `Search Results for "${queryParam}"` : "Our Collections"}
              </h1>
                <p className="text-muted-foreground font-medium flex items-center gap-2">
                {isLoading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Showing {displayedProducts.length} of {filteredAndSortedProducts.length} unique items
                  </>
                )}
              </p>
            </div>
            
            <div className="hidden lg:block">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">Sort:</span>
                <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
                  <SelectTrigger className="w-[220px] h-10 rounded-xl bg-card border shadow-sm hover:bg-accent transition-colors">
                    <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Featured" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="featured">Most Popular</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Latest Releases</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[4/5] w-full rounded-2xl md:rounded-3xl" />
                  <div className="space-y-2 px-1">
                    <Skeleton className="h-5 w-4/5" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-24 bg-muted/20 rounded-3xl border-2 border-dashed border-muted-foreground/20">
              <div className="max-w-sm mx-auto px-6">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <Filter className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <h3 className="text-2xl font-bold mb-3">No results found</h3>
                <p className="text-muted-foreground mb-8 text-balance">
                  We couldn't find any products matching your current selection. Try broadening your filters.
                </p>
                <Button 
                  variant="default" 
                  size="lg"
                  className="rounded-full px-8"
                  onClick={() => handleFilterChange({ categories: [], priceRange: null, inStockOnly: false })}
                >
                  Reset All Filters
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {displayedProducts.map((product) => (
                  <ProductCardComponent key={product.id} product={product} />
                ))}
              </div>

              {/* Load More */}
              {visibleCount < filteredAndSortedProducts.length && (
                <div className="mt-16 text-center border-t pt-12">
                  <Button 
                    onClick={handleLoadMore} 
                    size="lg"
                    variant="outline"
                    className="min-w-[240px] h-12 rounded-full border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 shadow-sm"
                  >
                    Explore More Items
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
