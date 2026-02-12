import { useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { categoryFirestoreService } from "@/services/categoryFirestoreService";
import { type Category, type ParentCategory } from "@shared/schema";

export function useCategories() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = categoryFirestoreService.subscribeCategories((categories) => {
      queryClient.setQueryData(["categories"], categories);
    });
    return () => unsubscribe();
  }, [queryClient]);

  useEffect(() => {
    const unsubscribe = categoryFirestoreService.subscribeParentCategories((parentCategories) => {
      queryClient.setQueryData(["parent-categories"], parentCategories);
    });
    return () => unsubscribe();
  }, [queryClient]);

  const categoriesQuery = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => categoryFirestoreService.getAllCategories(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const parentCategoriesQuery = useQuery<ParentCategory[]>({
    queryKey: ["parent-categories"],
    queryFn: () => categoryFirestoreService.getAllParentCategories(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  return {
    categories: categoriesQuery.data || [],
    parentCategories: parentCategoriesQuery.data || [],
    isLoading: categoriesQuery.isLoading || parentCategoriesQuery.isLoading,
    error: categoriesQuery.error || parentCategoriesQuery.error,
  };
}
