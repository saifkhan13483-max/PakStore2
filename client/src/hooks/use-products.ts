import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { mockStorage } from "@/lib/mock-storage";

export function useProducts() {
  return useQuery({
    queryKey: [api.products.list.path],
    queryFn: async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockStorage.getProducts();
    },
    refetchInterval: 30000,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: [api.products.get.path, slug],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const product = mockStorage.getProduct(slug);
      if (!product) throw new Error("Product not found");
      return product;
    },
    enabled: !!slug,
  });
}
