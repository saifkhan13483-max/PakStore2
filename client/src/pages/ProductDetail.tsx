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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery Section */}
        <div className="space-y-4">
          <Card className="overflow-hidden border-none shadow-none bg-muted/30 rounded-2xl">
            <CardContent className="p-0 aspect-square relative">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={images[activeImage]}
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
                  <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Section */}
        <div className="flex flex-col">
          <div className="mb-6">
            <Badge variant="outline" className="mb-4 text-primary border-primary/20 font-medium">
              {product.category}
            </Badge>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center text-yellow-500">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <span className="font-bold text-lg">{product.rating || "0.0"}</span>
                <span className="text-muted-foreground">({product.reviewCount || 0} reviews)</span>
              </div>
              <Badge variant={product.inStock ? "secondary" : "destructive"} className="rounded-full">
                {product.inStock ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>
            
            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through decoration-muted-foreground/50">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <div className="prose prose-stone dark:prose-invert max-w-none text-muted-foreground text-lg leading-relaxed mb-8">
              <p>{product.longDescription || product.description}</p>
            </div>

            {product.features && product.features.length > 0 && (
              <div className="mb-8 p-6 rounded-2xl bg-muted/30 border border-border/50">
                <h3 className="font-semibold text-foreground mb-4">Key Features</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-start text-sm text-muted-foreground">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-auto space-y-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center border rounded-full bg-background p-1 w-fit shadow-sm">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 rounded-full no-default-hover-elevate"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-10 text-center font-bold text-lg">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 rounded-full no-default-hover-elevate"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <Button 
                size="lg"
                className="flex-1 h-12 rounded-full gap-3 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]" 
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingCart className="w-5 h-5" />
                {product.inStock ? "Add to Cart" : "Currently Unavailable"}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 py-6 border-y border-border/50">
              <div className="flex flex-col items-center text-center px-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-foreground">Free Delivery</span>
                <span className="text-[10px] text-muted-foreground mt-1">Orders over Rs. 5,000</span>
              </div>
              <div className="flex flex-col items-center text-center px-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-foreground">Authentic</span>
                <span className="text-[10px] text-muted-foreground mt-1">100% Quality Check</span>
              </div>
              <div className="flex flex-col items-center text-center px-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-foreground">7-Day Return</span>
                <span className="text-[10px] text-muted-foreground mt-1">Hassle-free Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Separator } from "@/components/ui/separator";
