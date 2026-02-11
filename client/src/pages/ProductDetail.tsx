import { useRoute, Link } from "wouter";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, ShoppingCart, ChevronLeft, Star } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { useQuery } from "@tanstack/react-query";
import { productFirestoreService } from "@/services/productFirestoreService";
import { categoryFirestoreService } from "@/services/categoryFirestoreService";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/product/ProductCard";
import { CommentSection } from "@/components/product/CommentSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:slug");
  const slug = params?.slug || "";
  
  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => productFirestoreService.getProductBySlug(slug),
  });

  const { data: category } = useQuery({
    queryKey: ["category", product?.categoryId],
    enabled: !!product?.categoryId,
    queryFn: () => categoryFirestoreService.getCategory(String(product!.categoryId!)),
  });

  const { data: relatedProductsData } = useQuery({
    queryKey: ["products", "related", product?.categoryId],
    enabled: !!product?.categoryId,
    queryFn: () => productFirestoreService.getProductsByCategory(String(product!.categoryId!)),
  });

  const addToCart = useCartStore(state => state.addToCart);
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      toast({
        title: "Added to cart",
        description: `${quantity} x ${product.name} added to your cart.`,
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const relatedProducts = (relatedProductsData || [])
    .filter((p: any) => p.id !== product?.id)
    .slice(0, 4);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-12">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-3/4" />
            </div>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-32 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 flex-1" />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Product Not Found</h2>
        <p className="text-muted-foreground mb-8">The product you are looking for might have been moved or removed.</p>
        <Button asChild>
          <Link href="/products">Return to Shop</Link>
        </Button>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : ["https://placehold.co/600x600?text=No+Image"];

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO 
        title={product.name} 
        description={product.description}
        type="product"
        image={images[0]}
      />
      
      <Button variant="ghost" className="mb-6 group hover:bg-transparent p-0" asChild>
        <Link href="/products">
          <ChevronLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Shop
        </Link>
      </Button>

      {/* Top Section: Images and Primary Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-16 mb-12 lg:mb-20">
        {/* Gallery Section */}
        <div className="flex flex-col md:flex-row gap-4 lg:sticky lg:top-24 h-fit">
          {images.length > 1 && (
            <div className="flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0 md:pr-2 scrollbar-hide md:max-h-[400px] lg:max-h-[500px] order-2 md:order-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === idx 
                      ? "border-primary ring-2 ring-primary/10" 
                      : "border-transparent opacity-70 hover:opacity-100 hover:border-primary/30"
                  }`}
                >
                  <img src={getOptimizedImageUrl(img, { width: 100, height: 100 })} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          
          <Card className="flex-1 overflow-hidden border border-border/50 shadow-sm rounded-2xl order-1 md:order-2">
            <CardContent className="p-0 aspect-square relative">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={getOptimizedImageUrl(images[activeImage], { width: 800, height: 800 })}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <div className="flex flex-col justify-center">
          <div className="space-y-6">
            <div className="space-y-2">
              {category && (
                <p className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-widest">
                  {category.name}
                </p>
              )}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight">
                {product.name}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 dark:bg-yellow-950/30 rounded-full border border-yellow-200/50 dark:border-yellow-800/30">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span className="font-bold text-yellow-700 dark:text-yellow-500">{product.rating || "0.0"}</span>
              </div>
              <span className="text-muted-foreground text-sm">({product.reviewCount || 0} reviews)</span>
              <Separator orientation="vertical" className="h-4 hidden sm:block" />
              <Badge variant={product.inStock ? "secondary" : "destructive"} className="rounded-full px-3">
                {product.inStock ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>
            
            <div className="flex items-baseline gap-3">
              <span className="text-3xl md:text-4xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through decoration-muted-foreground/50 font-normal">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <div className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-2xl">
              {product.description}
            </div>

            {product.features && product.features.length > 0 && (
              <div className="py-2">
                <h3 className="font-semibold text-foreground mb-4">Key Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                  {product.features.map((feature, i) => (
                    <div key={i} className="flex items-start text-sm text-muted-foreground">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60 mr-3 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-border/50">
              <div className="flex items-center border rounded-md bg-background p-1 w-full sm:w-fit justify-between sm:justify-start">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 no-default-hover-elevate"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 no-default-hover-elevate"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <Button 
                size="lg"
                className="flex-1 h-12 bg-[#1A4D2E] hover:bg-[#1A4D2E]/90 text-white rounded-md gap-3 font-bold text-lg shadow-md transition-all active:scale-[0.98]" 
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingCart className="w-5 h-5" />
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Tabs for Description and Reviews */}
      <section className="mb-16">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger 
              value="description" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-semibold text-base transition-none"
            >
              Product long description:
            </TabsTrigger>
            <TabsTrigger 
              value="reviews" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-semibold text-base transition-none"
            >
              Customer Reviews
            </TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="pt-8 focus-visible:ring-0">
            <div className="prose prose-stone dark:prose-invert max-w-none text-muted-foreground text-lg leading-relaxed">
              <p>{product.longDescription || "No detailed description available for this product."}</p>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="pt-8 focus-visible:ring-0">
            <CommentSection productId={product.id} />
          </TabsContent>
        </Tabs>
      </section>

      <Separator className="my-12" />

      {/* Bottom Section: Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Related Products</h2>
            <Button variant="ghost" asChild className="p-0 h-auto">
              <Link href={`/products?categoryId=${product.categoryId}`}>View all</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
