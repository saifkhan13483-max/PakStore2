import { useState, useMemo, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import SEO from "@/components/SEO";
import { products } from "@/data/products";
import { ProductCard as ProductCardComponent } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
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

  // Handle URL parameters for initial filters (optional but recommended in Part 14)
  useEffect(() => {
    const params = new URLSearchParams(search);
    const cat = params.get("category");
    if (cat) {
      setFilterState(prev => ({ ...prev, categories: [cat] }));
    }
  }, [search]);

  const queryParam = useMemo(() => {
    const params = new URLSearchParams(search);
    return params.get("q") || "";
  }, [search]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filter by search query
    if (queryParam) {
      const q = queryParam.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (filterState.categories.length > 0) {
      result = result.filter((p) => filterState.categories.includes(p.category));
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

    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort((a, b) => b.id - a.id);
        break;
      default:
        // Featured - no sorting
        break;
    }

    return result;
  }, [filterState, sortBy]);

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
        <div className="lg:hidden mb-4 flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex-1 gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <Filters onFilterChange={handleFilterChange} />
              </div>
            </SheetContent>
          </Sheet>
          <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
            <SelectTrigger className="w-[180px]">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest Arrivals</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <Filters onFilterChange={handleFilterChange} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                {queryParam ? `Search Results for "${queryParam}"` : "Shop All Products"}
              </h1>
              <p className="text-muted-foreground">
                Showing {displayedProducts.length} of {filteredAndSortedProducts.length} products
              </p>
            </div>
            
            <div className="hidden lg:block">
              <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
                <SelectTrigger className="w-[200px]">
                  <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest Arrivals</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Product Grid */}
          {filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed">
              <div className="max-w-md mx-auto">
                <Filter className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No products match your filters</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or search criteria to find what you're looking for.
                </p>
                <Button variant="default" onClick={() => handleFilterChange({ categories: [], priceRange: null, inStockOnly: false })}>
                  Clear All Filters
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedProducts.map((product) => (
                  <ProductCardComponent key={product.id} product={product} />
                ))}
              </div>

              {/* Load More */}
              {visibleCount < filteredAndSortedProducts.length && (
                <div className="mt-12 text-center">
                  <Button 
                    onClick={handleLoadMore} 
                    size="lg"
                    variant="outline"
                    className="min-w-[200px]"
                  >
                    Load More Products
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
