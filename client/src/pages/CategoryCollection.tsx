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
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
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
        title={`${category.name} Online Shopping in Pakistan | Best Prices at PakCart`}
        description={category.description || `Explore our exclusive collection of ${category.name.toLowerCase()} available online in Pakistan. Shop authentic products with fast delivery and free shipping on orders over Rs. 10,000.`}
        url={`/collections/${category.slug}`}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Categories", url: "/categories" },
          { name: category.name, url: `/collections/${category.slug}` }
        ]}
        faqs={[
          { question: `What are the shipping options for ${category.name.toLowerCase()}?`, answer: "We offer fast and reliable shipping across Pakistan. Orders are typically dispatched within 24-48 hours. Delivery times vary by location, usually 3-7 business days. We provide free shipping on orders over Rs. 10,000." },
          { question: `Are the ${category.name.toLowerCase()} authentic and of good quality?`, answer: `Yes, all our ${category.name.toLowerCase()} are carefully selected for quality and authenticity. Each product goes through our quality checks to ensure it meets our standards. We source from trusted suppliers and manufacturers.` },
          { question: "What is your return and exchange policy?", answer: "We offer a 7-day return/exchange policy on all products. Items must be unused and in original packaging. Return shipping is free for defective items. To initiate a return, contact our support team with your order details." },
          { question: `Do the ${category.name.toLowerCase()} come with a warranty?`, answer: `Warranty availability depends on the specific product and manufacturer. Most of our ${category.name.toLowerCase()} come with manufacturer warranties. Check the product details page for warranty information.` },
          { question: "What payment methods do you accept?", answer: "We accept multiple payment methods including credit/debit cards (Visa, Mastercard), bank transfers, and cash on delivery for eligible orders. All transactions are secure and encrypted." },
          { question: `Do you offer bulk discounts on ${category.name.toLowerCase()}?`, answer: "Yes, we offer special pricing for bulk orders. For orders of 10+ items, please contact our sales team directly at support@pakcart.store to discuss your requirements and get a custom quote." }
        ]}
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
          <div className="text-sm text-muted-foreground mt-4 leading-relaxed max-w-3xl space-y-3">
            <p>
              Welcome to our exclusive {category.name.toLowerCase()} collection at PakCart. We bring you the finest selection of {category.name.toLowerCase()} available online in Pakistan, curated from trusted suppliers and manufacturers across the country. Whether you're looking for everyday essentials, special occasion pieces, or gifts for your loved ones, our comprehensive range has something for everyone.
            </p>
            <p>
              All our {category.name.toLowerCase()} undergo rigorous quality checks to ensure authenticity and durability. We source directly from authorized retailers and manufacturers, guaranteeing that every product meets our high standards. With our affordable pricing and regular discounts, you can shop premium {category.name.toLowerCase()} without breaking the bank. Plus, we offer fast delivery across Pakistan with free shipping on orders over Rs. 10,000, hassle-free returns within 7 days, and secure payment options including credit cards, bank transfers, and cash on delivery.
            </p>
            <p>
              Browse our latest {category.name.toLowerCase()} collection below to discover trending styles, quality materials, and unbeatable prices. Use our sorting options to find exactly what you're looking for, whether by price, newest arrivals, or featured picks. Have questions? Check our frequently asked questions section for shipping, returns, warranties, and more. Our customer service team at support@pakcart.store is always ready to help you find the perfect product.
            </p>
          </div>
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

      {filteredAndSortedProducts.length > 0 && (
        <section className="mt-16 pt-12 border-t">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full max-w-3xl">
            <AccordionItem value="delivery">
              <AccordionTrigger className="text-lg font-semibold">
                What are the shipping options for {category.name.toLowerCase()}?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                We offer fast and reliable shipping across Pakistan. Orders are typically dispatched within 24-48 hours. Delivery times vary by location, usually 3-7 business days. We provide free shipping on orders over Rs. 10,000.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="quality">
              <AccordionTrigger className="text-lg font-semibold">
                Are the {category.name.toLowerCase()} authentic and of good quality?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Yes, all our {category.name.toLowerCase()} are carefully selected for quality and authenticity. Each product goes through our quality checks to ensure it meets our standards. We source from trusted suppliers and manufacturers to guarantee the best products for our customers.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="exchange">
              <AccordionTrigger className="text-lg font-semibold">
                What is your return and exchange policy?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                We offer a 7-day return/exchange policy on all products. Items must be unused and in original packaging. Return shipping is free for defective items. To initiate a return, contact our support team with your order details.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="warranty">
              <AccordionTrigger className="text-lg font-semibold">
                Do the {category.name.toLowerCase()} come with a warranty?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Warranty availability depends on the specific product and manufacturer. Most of our {category.name.toLowerCase()} come with manufacturer warranties. Check the product details page for warranty information, or contact our support team for specifics.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="payment">
              <AccordionTrigger className="text-lg font-semibold">
                What payment methods do you accept?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                We accept multiple payment methods including credit/debit cards (Visa, Mastercard), bank transfers, and cash on delivery for eligible orders. All transactions are secure and encrypted to protect your information.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="bulk">
              <AccordionTrigger className="text-lg font-semibold">
                Do you offer bulk discounts on {category.name.toLowerCase()}?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Yes, we offer special pricing for bulk orders. For orders of 10+ items, please contact our sales team directly at support@pakcart.store to discuss your requirements and get a custom quote.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      )}
    </div>
  );
}
