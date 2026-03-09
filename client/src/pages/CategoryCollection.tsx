import { useState, useMemo, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useParams } from "wouter";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { productFirestoreService } from "@/services/productFirestoreService";
import { categoryFirestoreService } from "@/services/categoryFirestoreService";
import type { Category } from "@shared/schema";

type SortOption = "featured" | "price-low" | "price-high" | "newest";

export default function CategoryCollection() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || "";
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [visibleCount, setVisibleCount] = useState(10);

  // Fetch the category by slug
  const { data: category, isLoading: categoryLoading } = useQuery<Category>({
    queryKey: ["category", slug],
    queryFn: async () => {
      const allCategories = await categoryFirestoreService.getAllCategories();
      const found = allCategories.find(c => c.slug === slug);
      if (!found) throw new Error("Category not found");
      return found;
    },
    enabled: !!slug,
  });

  // Fetch products for this category
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["products", category?.id, sortBy],
    queryFn: () => {
      if (!category?.id) return Promise.resolve([]);
      return productFirestoreService.getAllProducts({
        category: category.id,
        sortBy: sortBy === "price-low" ? "price-asc" : sortBy === "price-high" ? "price-desc" : sortBy === "newest" ? "newest" : undefined,
        limit: 100 
      });
    },
    enabled: !!category?.id,
    retry: false
  });

  const filteredAndSortedProducts = useMemo(() => {
    if (!productsData) return [];
    let result = [...productsData];

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      result.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return dateB - dateA;
      });
    }

    return result;
  }, [productsData, sortBy]);

  const visibleProducts = filteredAndSortedProducts.slice(0, visibleCount);
  const isLoading = categoryLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
        <p className="text-muted-foreground">The category you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO
        title={`${category.name} Online in Pakistan | Affordable Prices at PakCart`}
        description={category.description || `Shop our curated collection of ${category.name.toLowerCase()} available online in Pakistan. Best prices, authentic products, fast delivery across Pakistan with free shipping over Rs. 10,000.`}
        url={`/collections/${category.slug}`}
        schema={{
          "@context": "https://schema.org/",
          "@type": "CollectionPage",
          "name": category.name,
          "description": category.description || `Shop ${category.name.toLowerCase()} online`,
          "url": `https://pakcart.store/collections/${category.slug}`
        }}
      />

      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/categories">Categories</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{category.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed max-w-2xl">{category.description}</p>
          )}
          <p className="text-sm text-muted-foreground mt-4 leading-relaxed max-w-2xl">
            Shop our curated collection of {category.name.toLowerCase()} available online in Pakistan. We offer authentic, quality products with fast delivery across Pakistan. Find the best prices and latest designs in {category.name.toLowerCase()}.
          </p>
        </div>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-24 bg-muted/20 rounded-3xl border-2 border-dashed border-muted-foreground/20">
          <h3 className="text-xl font-bold mb-2">No products found</h3>
          <p className="text-muted-foreground">Check back soon for new items in this category.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-8" data-testid="products-grid">
            {visibleProducts.map((product) => (
              <ProductCardComponent key={product.id} product={product} data-testid={`product-card-${product.id}`} />
            ))}
          </div>

          {visibleCount < filteredAndSortedProducts.length && (
            <div className="flex justify-center">
              <Button
                onClick={() => setVisibleCount(prev => prev + 10)}
                variant="outline"
                className="px-8"
                data-testid="button-load-more"
              >
                Load More
              </Button>
            </div>
          )}

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Showing {visibleProducts.length} of {filteredAndSortedProducts.length} products
          </div>
        </>
      )}
    </div>
  );
}
