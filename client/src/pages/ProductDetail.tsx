import { useRoute, Link } from "wouter";
import { useProduct } from "@/hooks/use-products";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, ShoppingCart, Truck, ShieldCheck, ChevronLeft, Star, RotateCcw } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { getOptimizedImageUrl } from "@/lib/cloudinary";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:slug");
  const { data: product, isLoading, error } = useProduct(params?.slug || "");
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

  const relatedProducts = (products || [])
    .filter(p => p.categoryId === product?.categoryId && p.id !== product?.id)
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-12">
        {/* Gallery Section */}
        <div className="space-y-4">
          <Card className="overflow-hidden border border-border/50 shadow-sm rounded-2xl">
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
          
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
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
        </div>

        {/* Info Section */}
        <div className="flex flex-col">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-2">
              <div className="flex items-center text-yellow-500">
                <Star className="w-5 h-5 fill-current" />
              </div>
              <span className="font-bold">{product.rating || "0.0"}</span>
              <span className="text-muted-foreground text-sm">({product.reviewCount || 0} reviews)</span>
              <Separator orientation="vertical" className="h-4 mx-2" />
              <Badge variant={product.inStock ? "secondary" : "destructive"} className="rounded-full text-xs">
                {product.inStock ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>
            
            <div className="text-3xl font-bold text-primary">
              {formatPrice(product.price)}
              {product.originalPrice && (
                <span className="ml-3 text-xl text-muted-foreground line-through decoration-muted-foreground/50 font-normal">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <div className="text-muted-foreground text-lg leading-relaxed line-clamp-5 min-h-[7.5rem]">
              {product.description}
            </div>

            {product.features && product.features.length > 0 && (
              <div className="py-4">
                <h3 className="font-semibold text-foreground mb-3">Key Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-start text-sm text-muted-foreground">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border/50">
              <div className="flex items-center border rounded-md bg-background p-1 w-fit">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 no-default-hover-elevate"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="w-10 text-center font-bold">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 no-default-hover-elevate"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              <Button 
                size="lg"
                className="flex-1 h-11 bg-[#1A4D2E] hover:bg-[#1A4D2E]/90 text-white rounded-md gap-2 font-semibold" 
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingCart className="w-4 h-4" />
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-12" />

      {/* Middle Section: Long Description */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Product Long Description:</h2>
        <div className="prose prose-stone dark:prose-invert max-w-none text-muted-foreground text-lg leading-relaxed">
          <p>{product.longDescription || "No detailed description available for this product."}</p>
        </div>
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
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

import { Separator } from "@/components/ui/separator";
import { products } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";
