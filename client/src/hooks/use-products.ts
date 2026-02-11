import { useQuery } from "@tanstack/react-query";
import { productFirestoreService } from "@/services/productFirestoreService";

export function useProducts(categoryId?: string) {
  return useQuery({
    queryKey: ["products", categoryId],
    queryFn: () => productFirestoreService.getAllProducts({ category: categoryId }),
    refetchInterval: 30000,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["products", slug],
    queryFn: () => productFirestoreService.getProductBySlug(slug),
    enabled: !!slug,
  });
}
