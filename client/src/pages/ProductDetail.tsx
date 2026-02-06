import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ShoppingCart, 
  ChevronLeft, 
  Truck, 
  ShieldCheck, 
  RotateCcw,
  Plus,
  Minus,
  Star
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import SEO from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:slug");
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/slug/${params?.slug}`],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <Button asChild>
          <Link href="/products">Back to Shop</Link>
        </Button>
      </div>
    );
  }

  const images = product.images || ["https://placehold.co/600x600?text=No+Image"];

  const handleAddToCart = () => {
    toast({
      title: "Added to cart",
      description: `${quantity}x ${product.name} added to your shopping cart.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO 
        title={product.name} 
        description={product.description}
        type="product"
        image={images[0]}
      />
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/products">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Shop
        </Link>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <Card className="overflow-hidden border-none shadow-none bg-muted/30">
            <CardContent className="p-0 aspect-square relative">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
            </CardContent>
          </Card>
          
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                    selectedImage === idx ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-6">
            <Badge className="mb-2" variant="outline">{product.category}</Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < 4 ? "fill-current" : ""}`} />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">(4.5/5)</span>
              </div>
              <Badge variant={product.inStock ? "secondary" : "destructive"}>
                {product.inStock ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>
            
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-primary">Rs. {product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  Rs. {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              {product.longDescription || product.description}
            </p>

            {product.features && product.features.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold mb-3">Key Features:</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-auto space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center border rounded-md w-fit h-10 px-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 no-default-hover-elevate"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 no-default-hover-elevate"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <Button 
                className="flex-1 h-10 gap-2" 
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/20">
                <Truck className="w-5 h-5 mb-2 text-primary" />
                <span className="text-xs font-medium">Fast Delivery</span>
                <span className="text-[10px] text-muted-foreground">Across Pakistan</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/20">
                <ShieldCheck className="w-5 h-5 mb-2 text-primary" />
                <span className="text-xs font-medium">Quality Guranteed</span>
                <span className="text-[10px] text-muted-foreground">100% Authentic</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/20">
                <RotateCcw className="w-5 h-5 mb-2 text-primary" />
                <span className="text-xs font-medium">Easy Returns</span>
                <span className="text-[10px] text-muted-foreground">7-Day Policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
