import { useRoute, Link } from "wouter";
import { useProduct } from "@/hooks/use-products";
import { useCartStore } from "@/store/cartStore";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, ShoppingCart, Truck, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function ProductDetails() {
  const [match, params] = useRoute("/product/:slug");
  const { data: product, isLoading, isError } = useProduct(params?.slug || "");
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
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-body">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/collections" className="hover:text-primary">{product.category}</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
            {/* Gallery */}
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="aspect-square rounded-3xl overflow-hidden bg-muted border"
              >
                {product.images && product.images[activeImage] && (
                  <img 
                    src={product.images[activeImage]} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                )}
              </motion.div>
              <div className="grid grid-cols-4 gap-4">
                {product.images?.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === idx ? 'border-primary' : 'border-transparent hover:border-primary/50'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <Badge variant="outline" className="w-fit mb-4 text-primary border-primary/20">
                {product.category}
              </Badge>
              
              <h1 className="font-display text-4xl font-bold text-foreground mb-4">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              <div className="prose prose-stone max-w-none text-muted-foreground mb-8">
                <p>{product.longDescription || product.description}</p>
              </div>

              {/* Specifications */}
              {product.specifications && (
                <div className="bg-muted/30 rounded-xl p-6 mb-8 border border-border/50">
                  <h3 className="font-display font-semibold mb-4">Specifications</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {Object.entries(product.specifications as Record<string, string>).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-muted-foreground block text-xs uppercase tracking-wider">{key}</span>
                        <span className="font-medium text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8 pt-4 border-t">
                <div className="flex items-center border rounded-full bg-background px-4 py-2 w-fit">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1 hover:text-primary transition-colors disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="mx-4 font-semibold min-w-[1.5rem] text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1 hover:text-primary transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                <Button 
                  onClick={handleAddToCart}
                  size="lg" 
                  className="flex-1 rounded-full text-lg h-14 bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {product.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="bg-primary/10 p-2 rounded-full text-primary">
                    <Truck className="h-4 w-4" />
                  </div>
                  <span>Free shipping over PKR 5,000</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="bg-primary/10 p-2 rounded-full text-primary">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span>Authentic & Quality Checked</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
