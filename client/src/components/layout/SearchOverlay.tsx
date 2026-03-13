import { useEffect, useRef, useId } from "react";
import {
  Search,
  X,
  Clock,
  TrendingUp,
  ShoppingBag,
  AlertCircle,
  Tag,
  ArrowRight,
  Sparkles,
} from "lucide-react";
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
    isOpen &&
    (query.length >= 1 || recentSearches.length > 0 || popularSearches.length > 0);

  const showSuggestions =
    query.length >= 2 && !isLoadingSuggestions && !isSuggestionsError && suggestions.length > 0;
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
  }, [
    isOpen,
    onClose,
    selectedSuggestionIndex,
    suggestions,
    recentSearches,
    showSuggestions,
    showRecentSearches,
    totalOptions,
  ]);

  const navigateToSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setLocation(`/products?q=${encodeURIComponent(trimmed)}`);
    onClose();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigateToSearch(query.trim());
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
      ? getOptimizedImageUrl(url, { width: 56, height: 56, crop: "fill", quality: "auto:low" })
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel — slides down from top, full-width, white card */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-50 flex flex-col"
            style={{ maxHeight: "92dvh" }}
            data-testid="search-overlay"
          >
            {/* Green accent top bar */}
            <div className="h-1 shrink-0 bg-gradient-to-r from-green-400 via-green-500 to-emerald-500" />

            {/* White card body — scrollable on mobile */}
            <div className="bg-white shadow-2xl flex flex-col overflow-hidden">

              {/* ── Input section (sticky, never scrolls away) ── */}
              <div className="px-3 sm:px-6 pt-3 sm:pt-5 pb-3 shrink-0 lg:max-w-2xl lg:mx-auto lg:w-full">

                {/* Live region */}
                <div
                  id={liveRegionId}
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                  className="sr-only"
                >
                  {liveMessage}
                </div>

                <form onSubmit={handleSearch} role="search">
                  <div className="relative flex items-center">

                    {/* Search icon badge — smaller on mobile */}
                    <div className="absolute left-3 sm:left-4 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-600 shadow-sm pointer-events-none z-10 shrink-0">
                      <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" aria-hidden="true" />
                    </div>

                    {/* Input — text-base ensures no iOS auto-zoom (≥16px) */}
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
                      placeholder="Search bags, watches…"
                      className={cn(
                        "w-full h-12 sm:h-14",
                        "pl-12 sm:pl-16",
                        query.length > 0 ? "pr-24 sm:pr-36" : "pr-14 sm:pr-28",
                        "text-base text-gray-800",
                        "bg-gray-50 border-2 border-gray-200 rounded-xl sm:rounded-2xl",
                        "placeholder:text-gray-400 outline-none transition-all duration-200",
                        "focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100"
                      )}
                      data-testid="search-overlay-input"
                      autoComplete="off"
                      spellCheck={false}
                      inputMode="search"
                      enterKeyHint="search"
                    />

                    {/* Right-side controls */}
                    <div className="absolute right-2 flex items-center gap-1">
                      {/* Clear button — only shows when there's text */}
                      {query.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setQuery("");
                            setSelectedSuggestionIndex(-1);
                            inputRef.current?.focus();
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                          aria-label="Clear search"
                          data-testid="search-overlay-clear"
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                      )}

                      {/* Submit — icon on mobile, text on desktop */}
                      <button
                        type="submit"
                        aria-label="Search PakCart"
                        className="h-9 sm:h-10 w-9 sm:w-auto sm:px-5 flex items-center justify-center rounded-lg sm:rounded-xl bg-green-600 hover:bg-green-700 active:scale-95 text-white transition-all duration-150 shadow-sm"
                        data-testid="search-overlay-submit"
                      >
                        <Search className="h-4 w-4 sm:hidden" aria-hidden="true" />
                        <span className="hidden sm:block text-sm font-semibold">Search</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* ── Dropdown content — scrollable ── */}
              <div
                id={listboxId}
                role="listbox"
                aria-label="Search suggestions"
                className={cn(
                  "overflow-y-auto overscroll-contain px-3 sm:px-6 lg:max-w-2xl lg:mx-auto lg:w-full",
                  !isDropdownOpen && "hidden"
                )}
                style={{ maxHeight: "calc(92dvh - 80px)" }}
              >

                {/* Active query ≥ 2 chars */}
                {query.length >= 2 && (
                  <div className="pb-4">
                    {isLoadingSuggestions && (
                      <div className="py-8 flex items-center justify-center gap-3 text-sm text-gray-400">
                        <span
                          className="inline-block h-5 w-5 rounded-full border-2 border-green-400 border-t-transparent animate-spin"
                          aria-hidden="true"
                        />
                        Finding matches…
                      </div>
                    )}

                    {isSuggestionsError && !isLoadingSuggestions && (
                      <div className="mt-2 py-3 flex items-center gap-2.5 text-sm text-amber-600 bg-amber-50 px-4 rounded-xl">
                        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                        Couldn&apos;t load suggestions. Please try again.
                      </div>
                    )}

                    {showSuggestions && (
                      <div className="space-y-0.5 mt-1">
                        {suggestions.map((s, idx) => {
                          const thumb = thumbnailUrl(s.image);
                          const isSelected = selectedSuggestionIndex === idx;
                          const isProduct = s.type === "product";
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
                                "w-full flex items-center gap-3 px-2 sm:px-3 py-2.5 rounded-xl transition-all text-left group",
                                "border-l-2",
                                isSelected
                                  ? "bg-green-50 border-green-500"
                                  : "hover:bg-gray-50 border-transparent"
                              )}
                              data-testid={`search-suggestion-${s.type}-${idx}`}
                            >
                              {/* Thumbnail — slightly smaller on mobile */}
                              {isProduct ? (
                                thumb ? (
                                  <img
                                    src={thumb}
                                    alt=""
                                    aria-hidden="true"
                                    className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl object-cover shrink-0 bg-gray-100 ring-1 ring-gray-200"
                                    loading="lazy"
                                    width={44}
                                    height={44}
                                  />
                                ) : (
                                  <span
                                    className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gray-100 flex items-center justify-center shrink-0"
                                    aria-hidden="true"
                                  >
                                    <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                  </span>
                                )
                              ) : (
                                <span
                                  className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-green-50 flex items-center justify-center shrink-0 ring-1 ring-green-100"
                                  aria-hidden="true"
                                >
                                  <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                                </span>
                              )}

                              {/* Text */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">
                                  {s.text}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {isProduct ? "Product" : "Category"}
                                </p>
                              </div>

                              <ArrowRight
                                className={cn(
                                  "h-4 w-4 shrink-0 transition-all duration-150",
                                  isSelected
                                    ? "text-green-500 translate-x-0.5"
                                    : "text-gray-300 group-hover:text-gray-400"
                                )}
                                aria-hidden="true"
                              />
                            </button>
                          );
                        })}

                        {/* See all results */}
                        <button
                          type="button"
                          onClick={() => navigateToSearch(query.trim())}
                          className="w-full flex items-center justify-between gap-3 mt-2 px-4 py-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 hover:from-green-100 hover:to-emerald-100 transition-all group active:scale-[0.99]"
                          data-testid="search-see-all-results"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Search className="h-4 w-4 text-green-600 shrink-0" aria-hidden="true" />
                            <span className="text-sm font-semibold text-green-700 truncate">
                              See all results for &ldquo;{query}&rdquo;
                            </span>
                          </div>
                          <ArrowRight
                            className="h-4 w-4 text-green-500 shrink-0 group-hover:translate-x-0.5 transition-transform"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    )}

                    {/* No suggestions */}
                    {!isLoadingSuggestions &&
                      !isSuggestionsError &&
                      suggestions.length === 0 &&
                      query.length >= 2 && (
                        <div className="py-10 text-center">
                          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </div>
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            No results for &ldquo;{query}&rdquo;
                          </p>
                          <p className="text-xs text-gray-400 mb-5">
                            Try a different keyword
                          </p>
                          <button
                            type="button"
                            onClick={() => navigateToSearch(query.trim())}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors shadow-sm active:scale-95"
                            data-testid="search-no-results-browse"
                          >
                            <Search className="h-4 w-4" aria-hidden="true" />
                            Browse all products
                          </button>
                        </div>
                      )}
                  </div>
                )}

                {/* 1-char hint */}
                {query.length === 1 && (
                  <p className="text-sm text-gray-400 text-center py-8">
                    Keep typing to see suggestions…
                  </p>
                )}

                {/* Empty query: recents + popular */}
                {query.length === 0 && (
                  <div className="pb-4 space-y-4 sm:space-y-5">

                    {showRecentSearches && (
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                            Recent
                          </span>
                          <button
                            type="button"
                            onClick={clearRecentSearches}
                            className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium py-1"
                            data-testid="search-clear-recents"
                          >
                            Clear all
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
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
                                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all active:scale-95",
                                  isSelected
                                    ? "bg-green-600 text-white border-green-600"
                                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                                )}
                                data-testid={`search-recent-${idx}`}
                              >
                                <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                <span className="max-w-[140px] sm:max-w-none truncate">{term}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {showPopular && (
                      <div>
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2.5">
                          <Sparkles className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                          Trending now
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {popularSearches.map((term) => (
                            <button
                              key={term}
                              type="button"
                              onClick={() => navigateToSearch(term)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 hover:from-green-600 hover:to-emerald-600 hover:text-white hover:border-green-600 transition-all duration-200 active:scale-95"
                              data-testid={`search-popular-${term.toLowerCase().replace(/\s+/g, "-")}`}
                            >
                              <TrendingUp className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                              <span className="max-w-[160px] sm:max-w-none truncate">{term}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {!showRecentSearches && !showPopular && (
                      <p className="text-sm text-gray-400 text-center py-6">
                        Start typing to search products…
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* ── Footer ── */}
              <div className="shrink-0 px-3 sm:px-6 py-2.5 sm:py-3 border-t border-gray-100 flex items-center justify-between bg-white">
                <p className="text-xs text-gray-400 hidden sm:flex items-center gap-1">
                  Press{" "}
                  <kbd className="mx-1 px-1.5 py-0.5 text-xs font-mono bg-gray-100 border border-gray-200 rounded text-gray-500">
                    Esc
                  </kbd>
                  to close
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="ml-auto flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors py-1 px-2 rounded-lg hover:bg-gray-100 active:scale-95"
                  aria-label="Close search"
                  data-testid="search-overlay-close"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Close</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
