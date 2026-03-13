import { useEffect, useRef, useId } from "react";
import { Search, X, Clock, TrendingUp, ShoppingBag, AlertCircle, Tag } from "lucide-react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useSearch } from "@/hooks/useSearch";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayId = useId();
  const listboxId = `search-listbox-${overlayId}`;
  const liveRegionId = `search-live-${overlayId}`;

  const {
    query,
    setQuery,
    suggestions,
    isLoadingSuggestions,
    isSuggestionsError,
    popularSearches,
    recentSearches,
    clearRecentSearches,
    selectedSuggestionIndex,
    setSelectedSuggestionIndex,
    prefetchDropdown,
  } = useSearch();

  const isDropdownOpen =
    isOpen && (query.length >= 1 || recentSearches.length > 0 || popularSearches.length > 0);

  const showSuggestions = query.length >= 2 && !isLoadingSuggestions && !isSuggestionsError && suggestions.length > 0;
  const showRecentSearches = query.length === 0 && recentSearches.length > 0;
  const showPopular = query.length === 0 && popularSearches.length > 0;

  const totalOptions = showSuggestions
    ? suggestions.length
    : showRecentSearches
    ? recentSearches.length
    : 0;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      prefetchDropdown();
    } else {
      setQuery("");
      setSelectedSuggestionIndex(-1);
    }
  }, [isOpen, prefetchDropdown, setQuery, setSelectedSuggestionIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestionIndex((i) => Math.min(i + 1, totalOptions - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestionIndex((i) => Math.max(i - 1, -1));
      } else if (e.key === "Enter") {
        if (selectedSuggestionIndex >= 0) {
          if (showSuggestions && suggestions[selectedSuggestionIndex]) {
            handleSuggestionClick(suggestions[selectedSuggestionIndex]);
          } else if (showRecentSearches && recentSearches[selectedSuggestionIndex]) {
            navigateToSearch(recentSearches[selectedSuggestionIndex]);
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, selectedSuggestionIndex, suggestions, recentSearches, showSuggestions, showRecentSearches, totalOptions]);

  const navigateToSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setLocation(`/search?q=${encodeURIComponent(trimmed)}`);
    onClose();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigateToSearch(query.trim());
    }
  };

  const handleSuggestionClick = (s: { text: string; type: string; slug?: string }) => {
    if (s.type === "product" && s.slug) {
      setLocation(`/products/${s.slug}`);
      onClose();
    } else if (s.type === "category" && s.slug) {
      setLocation(`/collections/${s.slug}`);
      onClose();
    } else {
      navigateToSearch(s.text);
    }
  };

  const thumbnailUrl = (url: string | undefined) =>
    url
      ? getOptimizedImageUrl(url, { width: 48, height: 48, crop: "fill", quality: "auto:low" })
      : null;

  const liveMessage = isLoadingSuggestions
    ? "Loading suggestions…"
    : suggestions.length > 0 && query.length >= 2
    ? `${suggestions.length} suggestion${suggestions.length !== 1 ? "s" : ""} available`
    : "";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg"
            data-testid="search-overlay"
          >
            <div className="max-w-3xl mx-auto px-4 sm:px-8 py-4 sm:py-6">

              {/* Live region for screen readers */}
              <div
                id={liveRegionId}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
              >
                {liveMessage}
              </div>

              {/* Input */}
              <form onSubmit={handleSearch} role="search">
                <div className="flex items-center gap-2 sm:gap-3 border-b-2 border-green-500 pb-2">
                  <Search className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 shrink-0" aria-hidden="true" />
                  <input
                    ref={inputRef}
                    type="text"
                    role="combobox"
                    aria-expanded={isDropdownOpen}
                    aria-controls={listboxId}
                    aria-autocomplete="list"
                    aria-activedescendant={
                      selectedSuggestionIndex >= 0
                        ? `search-option-${selectedSuggestionIndex}`
                        : undefined
                    }
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setSelectedSuggestionIndex(-1);
                    }}
                    placeholder="Search for bags, watches, bedsheets..."
                    className="flex-1 text-base sm:text-xl text-gray-800 placeholder-gray-400 outline-none bg-transparent min-w-0"
                    data-testid="search-overlay-input"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    type="submit"
                    aria-label="Search PakCart"
                    className="rounded-full p-1.5 hover:bg-green-50 transition-colors shrink-0"
                    data-testid="search-overlay-submit"
                  >
                    <Search className="h-4 w-4 text-green-600" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full p-1.5 hover:bg-gray-100 transition-colors shrink-0"
                    aria-label="Close search"
                    data-testid="search-overlay-close"
                  >
                    <X className="h-5 w-5 text-gray-500" aria-hidden="true" />
                  </button>
                </div>
              </form>

              {/* Dropdown */}
              <div
                id={listboxId}
                role="listbox"
                aria-label="Search suggestions"
                className={cn("mt-2", !isDropdownOpen && "hidden")}
              >

                {/* --- Firestore suggestions (query ≥ 2 chars) --- */}
                {query.length >= 2 && (
                  <>
                    {isLoadingSuggestions && (
                      <div className="py-4 flex items-center gap-2 text-sm text-gray-400 px-3">
                        <span className="inline-block h-4 w-4 rounded-full border-2 border-green-400 border-t-transparent animate-spin" aria-hidden="true" />
                        Loading suggestions…
                      </div>
                    )}

                    {isSuggestionsError && !isLoadingSuggestions && (
                      <div className="py-3 flex items-center gap-2 text-sm text-amber-600 px-3">
                        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                        Couldn&apos;t load suggestions. Showing recent searches below.
                      </div>
                    )}

                    {showSuggestions && (
                      <div className="mt-1 space-y-0.5">
                        {suggestions.map((s, idx) => {
                          const thumb = thumbnailUrl(s.image);
                          const isSelected = selectedSuggestionIndex === idx;
                          return (
                            <button
                              key={`suggestion-${idx}`}
                              id={`search-option-${idx}`}
                              type="button"
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => handleSuggestionClick(s)}
                              onMouseEnter={() => setSelectedSuggestionIndex(idx)}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left group",
                                isSelected ? "bg-green-50" : "hover:bg-green-50"
                              )}
                              data-testid={`search-suggestion-${s.type}-${idx}`}
                            >
                              {/* Thumbnail or icon */}
                              {s.type === "product" ? (
                                thumb ? (
                                  <img
                                    src={thumb}
                                    alt=""
                                    aria-hidden="true"
                                    className="h-9 w-9 rounded-lg object-cover shrink-0 bg-gray-100"
                                    loading="lazy"
                                    width={36}
                                    height={36}
                                  />
                                ) : (
                                  <span className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0" aria-hidden="true">
                                    <ShoppingBag className="h-4 w-4 text-gray-400" />
                                  </span>
                                )
                              ) : (
                                <span className="h-9 w-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0" aria-hidden="true">
                                  <Tag className="h-4 w-4 text-green-500" />
                                </span>
                              )}

                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-700 group-hover:text-green-700 line-clamp-2 break-words">
                                  {s.text}
                                </p>
                                {s.type === "category" && (
                                  <p className="text-xs text-gray-400 mt-0.5">Category</p>
                                )}
                              </div>
                              <Search className="h-3.5 w-3.5 text-gray-300 group-hover:text-green-400 shrink-0" aria-hidden="true" />
                            </button>
                          );
                        })}

                        {/* See all results */}
                        <button
                          type="button"
                          onClick={() => navigateToSearch(query.trim())}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-green-50 transition-colors text-left group border-t border-gray-100 mt-1 pt-2"
                          data-testid="search-see-all-results"
                        >
                          <Search className="h-4 w-4 text-green-600 shrink-0" aria-hidden="true" />
                          <span className="text-sm font-semibold text-green-700">
                            See all results for &ldquo;{query}&rdquo;
                          </span>
                        </button>
                      </div>
                    )}

                    {/* No suggestions, no error */}
                    {!isLoadingSuggestions && !isSuggestionsError && suggestions.length === 0 && query.length >= 2 && (
                      <div className="mt-3 sm:mt-4">
                        <p className="text-sm text-gray-500 mb-3 px-3">
                          No suggestions for &ldquo;{query}&rdquo;
                        </p>
                        <button
                          type="button"
                          onClick={() => navigateToSearch(query.trim())}
                          className="flex items-center gap-2 px-4 py-2 mx-3 rounded-full border border-green-200 text-sm font-medium text-green-700 hover:bg-green-50 transition-colors"
                          data-testid="search-no-results-browse"
                        >
                          <Search className="h-4 w-4" aria-hidden="true" />
                          Browse all products for &ldquo;{query}&rdquo;
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* query is 1 char — too short for suggestions */}
                {query.length === 1 && (
                  <p className="text-sm text-gray-400 px-3 py-3">
                    Keep typing to see suggestions…
                  </p>
                )}

                {/* --- Empty query: recent searches + popular --- */}
                {query.length === 0 && (
                  <>
                    {showRecentSearches && (
                      <div className="mt-3 sm:mt-4">
                        <div className="flex items-center justify-between px-3 mb-2">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                            Recent Searches
                          </p>
                          <button
                            type="button"
                            onClick={clearRecentSearches}
                            className="text-xs text-blue-600 hover:underline"
                            data-testid="search-clear-recents"
                          >
                            Clear
                          </button>
                        </div>
                        <div className="space-y-0.5">
                          {recentSearches.map((term, idx) => {
                            const isSelected = selectedSuggestionIndex === idx;
                            return (
                              <button
                                key={term}
                                id={`search-option-${idx}`}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => navigateToSearch(term)}
                                onMouseEnter={() => setSelectedSuggestionIndex(idx)}
                                className={cn(
                                  "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-left group",
                                  isSelected ? "bg-green-50" : "hover:bg-green-50"
                                )}
                                data-testid={`search-recent-${idx}`}
                              >
                                <Clock className="h-4 w-4 text-gray-400 group-hover:text-green-500 shrink-0" aria-hidden="true" />
                                <span className="text-sm text-gray-700 group-hover:text-green-700 truncate flex-1">
                                  {term}
                                </span>
                                <Search className="h-3.5 w-3.5 text-gray-300 group-hover:text-green-400 shrink-0" aria-hidden="true" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {showPopular && (
                      <div className={showRecentSearches ? "mt-4 sm:mt-5" : "mt-3 sm:mt-4"}>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3 flex items-center gap-1.5">
                          <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                          Popular Searches
                        </p>
                        <div className="flex flex-wrap gap-2 px-3">
                          {popularSearches.map((term) => (
                            <button
                              key={term}
                              type="button"
                              onClick={() => navigateToSearch(term)}
                              className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:border-green-500 hover:text-green-700 hover:bg-green-50 transition-colors"
                              data-testid={`search-popular-${term.toLowerCase().replace(/\s+/g, "-")}`}
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {!showRecentSearches && !showPopular && (
                      <p className="text-sm text-gray-400 px-3 py-3">
                        Start typing to search…
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
