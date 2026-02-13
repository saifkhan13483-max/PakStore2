import { useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { categoryFirestoreService } from "@/services/categoryFirestoreService";
import { type Category, type ParentCategory } from "@shared/schema";

export function useCategories() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!categoryFirestoreService || typeof categoryFirestoreService.subscribeCategories !== 'function') {
      console.error("categoryFirestoreService.subscribeCategories is not a function", categoryFirestoreService);
      return;
    }
    // Real-time synchronization for sub-categories
    const unsubscribe = categoryFirestoreService.subscribeCategories((categories) => {
      queryClient.setQueryData(["categories"], categories);
      // Ensure the cache is considered fresh after real-time update
      queryClient.invalidateQueries({ queryKey: ["categories"], refetchType: "none" });
    });
    return () => unsubscribe?.();
  }, [queryClient]);

  useEffect(() => {
    if (!categoryFirestoreService || typeof categoryFirestoreService.subscribeParentCategories !== 'function') {
      console.error("categoryFirestoreService.subscribeParentCategories is not a function", categoryFirestoreService);
      return;
    }
    // Real-time synchronization for parent categories
    const unsubscribe = categoryFirestoreService.subscribeParentCategories((parentCategories) => {
      queryClient.setQueryData(["parent-categories"], parentCategories);
      // Ensure the cache is considered fresh after real-time update
      queryClient.invalidateQueries({ queryKey: ["parent-categories"], refetchType: "none" });
    });
    return () => unsubscribe?.();
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
