import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  searchProducts,
  getSuggestions,
  getPopularSearches,
  getRecentSearches,
  saveRecentSearch,
  clearRecentSearchesStorage,
} from "@/services/searchService";
import { logSearch } from "@/services/searchAnalyticsService";
import type { SearchResult, SearchOptions, Suggestion } from "@shared/schema";

export function useSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    getRecentSearches()
  );
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setSelectedSuggestionIndex(-1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const {
    data: suggestions = [],
    isLoading: isLoadingSuggestions,
  } = useQuery<Suggestion[]>({
    queryKey: ["search-suggestions", debouncedQuery],
    queryFn: () => getSuggestions(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  const { data: popularSearches = [] } = useQuery<string[]>({
    queryKey: ["search-popular"],
    queryFn: getPopularSearches,
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
  });

  const performSearch = useCallback(
    async (searchQuery: string, options?: SearchOptions) => {
      const q = searchQuery.trim();
      if (!q) return;
      setIsLoadingResults(true);
      setIsDropdownOpen(false);
      saveRecentSearch(q);
      setRecentSearches(getRecentSearches());
      try {
        const results = await searchProducts(q, options);
        setSearchResults(results);
        // fire-and-forget — never block search UX
        logSearch(q, results.length);
      } catch (err) {
        if (import.meta.env.DEV) console.error("Search failed:", err);
        setSearchResults([]);
      } finally {
        setIsLoadingResults(false);
      }
    },
    []
  );

  const clearRecentSearches = useCallback(() => {
    clearRecentSearchesStorage();
    setRecentSearches([]);
  }, []);

  return {
    query,
    setQuery,
    debouncedQuery,
    suggestions,
    isLoadingSuggestions,
    searchResults,
    isLoadingResults,
    performSearch,
    popularSearches,
    recentSearches,
    clearRecentSearches,
    selectedSuggestionIndex,
    setSelectedSuggestionIndex,
    isDropdownOpen,
    setIsDropdownOpen,
  };
}
