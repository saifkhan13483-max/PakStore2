import { useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useAIRecommendations } from "@/hooks/use-ai";
import { ProductCard } from "@/components/product/ProductCard";
import { Separator } from "@/components/ui/separator";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  slug: string;
  images?: string[];
  inStock?: boolean;
  rating?: number;
  reviewCount?: number;
  [key: string]: any;
}

interface AIRecommendationsProps {
  currentProduct: { name: string; category: string; price: number };
  allProducts: Product[];
}

export function AIRecommendations({
  currentProduct,
  allProducts,
}: AIRecommendationsProps) {
  const { generate, isLoading, productIds } = useAIRecommendations();

  useEffect(() => {
    if (currentProduct.name && allProducts.length > 0) {
      generate(
        currentProduct,
        allProducts.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
        }))
      );
    }
  }, [currentProduct.name]);

  const recommended = productIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  if (isLoading) {
    return (
      <section className="mb-12">
        <Separator className="mb-12" />
        <div className="flex items-center gap-2 mb-8">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <h2 className="text-2xl font-bold">AI Recommended For You</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-muted animate-pulse h-72" />
          ))}
        </div>
      </section>
    );
  }

  if (recommended.length === 0) return null;

  return (
    <section className="mb-12">
      <Separator className="mb-12" />
      <div className="flex items-center gap-2 mb-8">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">AI Recommended For You</h2>
        <span className="text-xs text-muted-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-1">
          Personalized
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommended.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
