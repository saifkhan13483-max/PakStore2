import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { Link } from "wouter";
import { ShoppingCart, Eye, Star, ImageOff, Plus } from "lucide-react";
import { type Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const { toast } = useToast();
  const [imageError, setImageError] = useState(false);

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

  const imageUrl = product.images?.[0] ? getOptimizedImageUrl(product.images[0], { width: 400, height: 500 }) : null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -12 }}
      className="group relative bg-white dark:bg-card rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-primary/20"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted flex items-center justify-center">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
            loading="lazy"
            onError={() => {
              console.error(`Failed to load image for product: ${product.name}`, imageUrl);
              setImageError(true);
            }}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
            <ImageOff className="h-10 w-10" />
            <span className="text-xs font-medium">No Image Available</span>
          </div>
        )}
        
        {/* Modern Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-2 md:p-3">
          <div className="flex items-center justify-center gap-2 transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 ease-out">
            <Link href={`/products/${product.slug}`}>
              <Button variant="secondary" size="icon" className="rounded-full h-8 w-8 md:h-9 md:w-9 hover:bg-white hover:text-black transition-all shadow-xl hover:scale-110">
                <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
            </Link>
            <Button 
              onClick={handleAddToCart}
              variant="default" 
              size="icon" 
              className="rounded-full h-8 w-8 md:h-9 md:w-9 bg-primary text-primary-foreground hover:scale-110 transition-all shadow-xl border-2 border-primary-foreground/20"
            >
              <ShoppingCart className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </Button>
          </div>
        </div>

        {/* Badges */}
        {!product.inStock && (
          <div className="absolute top-2 left-2 bg-destructive/90 backdrop-blur-sm text-destructive-foreground px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest shadow-lg">
            Sold Out
          </div>
        )}
        {product.originalPrice && product.originalPrice > product.price && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest shadow-lg">
            {Math.round((1 - product.price / product.originalPrice) * 100)}% Off
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2 md:p-3">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-0.5 md:gap-1 mb-0.5 md:mb-1">
          <Link href={`/products/${product.slug}`} className="block flex-1">
            <h3 className="font-display text-[11px] md:text-[13px] font-bold text-foreground leading-tight hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-0.5 bg-yellow-50 dark:bg-yellow-950/30 px-1 py-0 rounded w-fit shrink-0">
            <Star className="w-2 h-2 fill-yellow-500 text-yellow-500" />
            <span className="text-[8px] md:text-[9px] font-bold text-yellow-700 dark:text-yellow-500">{(Number(product.rating) || 0).toFixed(1)}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-1 md:mt-2 pt-1 md:pt-2 border-t border-muted/50">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-[8px] md:text-[9px] text-muted-foreground line-through decoration-destructive/50">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span className="text-[11px] md:text-[14px] font-black text-primary tracking-tight">
              {formatPrice(product.price)}
            </span>
          </div>
          <Button 
            onClick={handleAddToCart}
            size="sm" 
            variant="ghost" 
            className="rounded-full h-6 w-6 md:h-7 md:w-7 p-0 hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <Plus className="h-3 w-3 md:h-3.5 md:w-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
