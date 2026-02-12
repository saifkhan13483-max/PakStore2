import { useQuery, useMutation } from "@tanstack/react-query";
import { productFirestoreService } from "@/services/productFirestoreService";
import { queryClient } from "@/lib/queryClient";
import { type InsertProduct } from "@shared/schema";

export function useProducts(categoryId?: string) {
  return useQuery({
    queryKey: ["products", { categoryId }],
    queryFn: () => productFirestoreService.getAllProducts({ category: categoryId }),
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["products", slug],
    queryFn: () => productFirestoreService.getProductBySlug(slug),
    enabled: !!slug,
  });
}

export function useCreateProduct() {
  return useMutation({
    mutationFn: (data: InsertProduct) => productFirestoreService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertProduct> }) =>
      productFirestoreService.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", variables.id] });
    },
  });
}

export function useDeleteProduct() {
  return useMutation({
    mutationFn: (id: string) => productFirestoreService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
