import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/productService";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => productService.getProducts(),
    refetchInterval: 30000,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["products", slug],
    queryFn: () => productService.getProductBySlug(slug),
    enabled: !!slug,
  });
}
