import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { Link } from "wouter";
import { ShoppingCart, Eye, Star, ImageOff, Plus, Loader2, Download, Images } from "lucide-react";
import { type Product, commentSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { useRealtimeCollection } from "@/hooks/use-firestore-realtime";
import { where } from "firebase/firestore";
import { buildSingleTxt, downloadTxt } from "@/lib/exportProduct";
import { useDropshipperStatus } from "@/hooks/use-dropshipper-status";
import { MediaDownloadDialog } from "@/components/product/MediaDownloadDialog";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const { toast } = useToast();
  const [imageError, setImageError] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const { isApprovedDropshipper } = useDropshipperStatus();

  // Real-time rating/reviews from Firestore
  const constraints = useMemo(() => [where("productId", "==", product.id)], [product.id]);
  const { data: comments, isLoading: isLoadingReviews } = useRealtimeCollection(
    "comments",
    commentSchema,
    ["comments", product.id],
    constraints
  );

  const { displayRating, displayReviewCount } = useMemo(() => {
    if (!comments || comments.length === 0) {
      return { displayRating: 0, displayReviewCount: 0 };
    }
    const total = comments.reduce((acc, c) => acc + (Number(c.rating) || 0), 0);
    return {
      displayRating: (total / comments.length).toFixed(1),
      displayReviewCount: comments.length
    };
  }, [comments]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleExport = (e: React.MouseEvent) => {
    e.preventDefault();
    const content = buildSingleTxt(product);
    const slug = product.slug || product.name.toLowerCase().replace(/\s+/g, "-");
    downloadTxt(content, `pakcart-${slug}.txt`);
    toast({
      title: "Product details exported",
      description: `${product.name} details saved as .txt file.`,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const imageUrl = product.images?.[0] ? getOptimizedImageUrl(product.images[0], { width: 400, height: 500, crop: 'fill' }) : null;
  const hasMedia = (product.images && product.images.length > 0) || !!product.videoUrl;

  return (
    <>
    {isApprovedDropshipper && hasMedia && (
      <MediaDownloadDialog
        product={product}
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
      />
    )}
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -12 }}
      className="group relative bg-white dark:bg-card rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-primary/20"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '300px 400px' }}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted flex items-center justify-center">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
            loading="lazy"
            decoding="async"
            width="400"
            height="500"
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
          <div className="flex items-center justify-center gap-1.5 transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 ease-out">
            <Link href={`/products/${product.slug}`}>
              <Button variant="secondary" size="icon" className="rounded-full h-8 w-8 md:h-9 md:w-9 hover:bg-white hover:text-black transition-all shadow-xl hover:scale-110" data-testid={`btn-view-${product.id}`}>
                <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
            </Link>
            <Button 
              onClick={handleAddToCart}
              variant="default" 
              size="icon" 
              className="rounded-full h-8 w-8 md:h-9 md:w-9 bg-primary text-primary-foreground hover:scale-110 transition-all shadow-xl border-2 border-primary-foreground/20"
              data-testid={`btn-cart-${product.id}`}
            >
              <ShoppingCart className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </Button>
            {isApprovedDropshipper && (
              <Button
                onClick={handleExport}
                variant="secondary"
                size="icon"
                className="rounded-full h-8 w-8 md:h-9 md:w-9 hover:bg-green-600 hover:text-white transition-all shadow-xl hover:scale-110"
                title="Export product details as .txt"
                data-testid={`btn-export-${product.id}`}
              >
                <Download className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
            )}
            {isApprovedDropshipper && hasMedia && (
              <Button
                onClick={(e) => { e.preventDefault(); setMediaOpen(true); }}
                variant="secondary"
                size="icon"
                className="rounded-full h-8 w-8 md:h-9 md:w-9 hover:bg-green-600 hover:text-white transition-all shadow-xl hover:scale-110"
                title="Download product images & video"
                data-testid={`btn-media-${product.id}`}
              >
                <Images className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {!product.inStock && (
            <div className="bg-destructive/90 backdrop-blur-sm text-destructive-foreground px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest shadow-lg w-fit">
              Sold Out
            </div>
          )}
          {product.labels?.filter(label => label === 'Best Seller').map((label) => (
            <div 
              key={label}
              className="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest shadow-lg w-fit bg-amber-500 text-white"
            >
              {label}
            </div>
          ))}
        </div>
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
            <h3 className="font-display text-[11px] md:text-[13px] font-bold text-foreground leading-tight hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
          {isLoadingReviews ? (
            <div className="flex items-center px-1 py-0 rounded w-fit shrink-0">
              <Loader2 className="w-2 h-2 animate-spin text-muted-foreground" />
            </div>
          ) : Number(displayReviewCount) > 0 && (
            <div className="flex items-center gap-0.5 bg-yellow-50 dark:bg-yellow-950/30 px-1 py-0 rounded w-fit shrink-0">
              <Star className="w-2 h-2 fill-yellow-500 text-yellow-500" />
              <span className="text-[8px] md:text-[9px] font-bold text-yellow-700 dark:text-yellow-500">{displayRating}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-1 md:mt-2 pt-1 md:pt-2 border-t border-muted/50">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-[8px] md:text-[9px] text-muted-foreground line-through decoration-destructive/50">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span className="text-[11px] md:text-[14px] font-black text-primary tracking-tight">
              {formatPrice(product.price + (product.profit || 0))}
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
    </>
  );
}
