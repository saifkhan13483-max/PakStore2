import { useState, useCallback } from "react";
import {
  generateProductDescription,
  generateAIRecommendations,
  generateCartConversionMessage,
  generateAIReviews,
  generateSEOMeta,
  generateSmartSearchQuery,
  generateVariantNames,
  generateFullProductContent,
  type FullProductContent,
} from "@/services/ai";

export function useAIDescription() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const generate = useCallback(
    async (name: string, category: string, price: number) => {
      if (!name) return null;
      setIsLoading(true);
      try {
        const desc = await generateProductDescription(name, category, price);
        setResult(desc);
        return desc;
      } catch (err) {
        console.error("AI description error:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { generate, isLoading, result };
}

export function useAIRecommendations() {
  const [isLoading, setIsLoading] = useState(false);
  const [productIds, setProductIds] = useState<string[]>([]);

  const generate = useCallback(
    async (
      currentProduct: { name: string; category: string; price: number },
      availableProducts: {
        id: string;
        name: string;
        category: string;
        price: number;
      }[]
    ) => {
      setIsLoading(true);
      try {
        const ids = await generateAIRecommendations(
          currentProduct,
          availableProducts
        );
        setProductIds(ids);
        return ids;
      } catch (err) {
        console.error("AI recommendations error:", err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { generate, isLoading, productIds };
}

export function useAICartConversion() {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{
    urgency: string;
    offer: string;
    trust: string;
  } | null>(null);

  const generate = useCallback(
    async (
      items: { name: string; price: number; quantity: number }[],
      total: number
    ) => {
      setIsLoading(true);
      try {
        const msgs = await generateCartConversionMessage(items, total);
        setMessages(msgs);
        return msgs;
      } catch (err) {
        console.error("AI cart conversion error:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { generate, isLoading, messages };
}

export function useAIReviews() {
  const [isLoading, setIsLoading] = useState(false);

  const generate = useCallback(
    async (productName: string, category: string, count?: number) => {
      setIsLoading(true);
      try {
        return await generateAIReviews(productName, category, count);
      } catch (err) {
        console.error("AI reviews error:", err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { generate, isLoading };
}

export function useAISEO() {
  const [isLoading, setIsLoading] = useState(false);

  const generate = useCallback(
    async (name: string, category: string, description: string) => {
      setIsLoading(true);
      try {
        return await generateSEOMeta(name, category, description);
      } catch (err) {
        console.error("AI SEO error:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { generate, isLoading };
}

export function useAIVariantNames() {
  const [isLoading, setIsLoading] = useState(false);

  const generate = useCallback(
    async (
      productName: string,
      category: string,
      variantType: string,
      imageUrls: string[]
    ) => {
      setIsLoading(true);
      try {
        return await generateVariantNames(productName, category, variantType, imageUrls);
      } catch (err) {
        console.error("AI variant names error:", err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { generate, isLoading };
}

export function useAIFullContent() {
  const [isLoading, setIsLoading] = useState(false);

  const generate = useCallback(
    async (
      productImageUrls: string[],
      hints: {
        nameHint?: string;
        currentCategory?: string;
        availableCategories?: string[];
        variantTypes?: string[];
        extraDetails?: string;
      } = {}
    ): Promise<FullProductContent | null> => {
      setIsLoading(true);
      try {
        return await generateFullProductContent(productImageUrls, hints);
      } catch (err) {
        console.error("AI full content error:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { generate, isLoading };
}

export function useAISmartSearch() {
  const [isLoading, setIsLoading] = useState(false);

  const parse = useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      return await generateSmartSearchQuery(query);
    } catch (err) {
      console.error("AI smart search error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { parse, isLoading };
}
