import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
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
import { Filter } from "lucide-react";

export default function Products() {
  const [location] = useLocation();
  const [visibleCount, setVisibleCount] = useState(8);

  const displayedProducts = useMemo(() => {
    return products.slice(0, visibleCount);
  }, [visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 8, products.length));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Shop All Products | NoorBazaar</title>
        <meta name="description" content="Browse our complete collection of authentic Pakistani artisanal products." />
      </Helmet>

      {/* Breadcrumbs */}
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
        <div className="lg:hidden mb-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground italic">Filtering functionality coming in Part 14.</p>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Filters</h3>
              <div className="p-4 border rounded-lg bg-card text-card-foreground">
                <p className="text-sm text-muted-foreground italic">Filtering functionality coming in Part 14.</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Shop All Products</h1>
            <p className="text-muted-foreground">
              Showing {displayedProducts.length} of {products.length} products
            </p>
          </div>

          {/* Product Grid */}
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">No products found.</p>
              <Button variant="outline">Browse All Products</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedProducts.map((product) => (
                  <ProductCardComponent key={product.id} product={product} />
                ))}
              </div>

              {/* Load More */}
              {visibleCount < products.length && (
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
