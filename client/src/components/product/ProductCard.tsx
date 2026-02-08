import { Link } from "wouter";
import { ShoppingCart, Eye, Star } from "lucide-react";
import { type Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white dark:bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-primary/10"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {product.images?.[0] && (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <Link href={`/products/${product.slug}`}>
            <Button variant="secondary" size="icon" className="rounded-full h-10 w-10 sm:h-12 sm:w-12 hover:scale-110 transition-transform">
              <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
          <Button 
            onClick={handleAddToCart}
            variant="default" 
            size="icon" 
            className="rounded-full h-10 w-10 sm:h-12 sm:w-12 hover:scale-110 transition-transform bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        {/* Badges */}
        {!product.inStock && (
          <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            Sold Out
          </div>
        )}
        {product.originalPrice && product.originalPrice > product.price && (
          <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            Sale
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-medium">
          {product.category}
        </p>
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="font-display text-lg font-bold text-foreground mb-1 line-clamp-1 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center text-yellow-500">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="ml-1 text-sm font-medium text-foreground">{product.rating || "0.0"}</span>
          </div>
          <span className="text-xs text-muted-foreground">({product.reviewCount || 0})</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold text-primary">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
