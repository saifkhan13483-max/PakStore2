import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { mockProducts } from "@/data/products";

// Helper to simulate API delay for mock data if backend fails/is missing
const fetchWithMockFallback = async (url: string) => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("API not available");
    return await res.json();
  } catch (err) {
    console.warn("API fetch failed, falling back to mock data:", err);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Simple mock router logic
    if (url.includes("/api/products/")) {
      const slug = url.split("/").pop();
      const product = mockProducts.find(p => p.slug === slug);
      if (!product) throw new Error("Product not found");
      return product;
    }
    return mockProducts;
  }
};

export function useProducts() {
  return useQuery({
    queryKey: [api.products.list.path],
    queryFn: async () => {
      // In a real app, strict use: return api.products.list.responses[200].parse(await res.json());
      // For this phase, we use the fallback to ensure UI works immediately
      const data = await fetchWithMockFallback(api.products.list.path);
      return api.products.list.responses[200].parse(data);
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: [api.products.get.path, slug],
    queryFn: async () => {
      const url = buildUrl(api.products.get.path, { slug });
      const data = await fetchWithMockFallback(url);
      return api.products.get.responses[200].parse(data);
    },
    enabled: !!slug,
  });
}
