import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SEARCHES = [
  { label: "Bags", slug: "bags" },
  { label: "Watches", slug: "watches" },
  { label: "Slippers", slug: "khussas" },
  { label: "Bedsheets", slug: "bedsheets" },
  { label: "Eid Special", slug: "eid-special" },
];

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: products } = useProducts();
  const { categories } = useCategories();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const results =
    query.trim().length > 0
      ? [
          ...(products
            ?.filter((p) =>
              p.name.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 4)
            .map((p) => ({
              id: p.id,
              slug: p.slug,
              title: p.name,
              type: "product" as const,
            })) ?? []),
          ...(categories
            ?.filter((c) =>
              c.name.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 3)
            .map((c) => ({
              id: c.id,
              slug: c.slug,
              title: c.name,
              type: "category" as const,
            })) ?? []),
        ]
      : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setLocation(`/products?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const handleResultClick = (result: {
    type: "product" | "category";
    slug: string;
  }) => {
    if (result.type === "product") {
      setLocation(`/products/${result.slug}`);
    } else {
      setLocation(`/collections/${result.slug}`);
    }
    onClose();
  };

  const handlePopularClick = (slug: string) => {
    setLocation(`/collections/${slug}`);
    onClose();
  };

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
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
          />

          {/* Panel slides down from top */}
          <motion.div
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg"
            data-testid="search-overlay"
          >
            <div className="max-w-3xl mx-auto px-8 py-6">
              {/* Input */}
              <form onSubmit={handleSearch}>
                <div className="flex items-center gap-3 border-b-2 border-green-500 pb-2">
                  <Search className="h-6 w-6 text-gray-400 shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for bags, watches, bedsheets..."
                    className="flex-1 text-xl text-gray-800 placeholder-gray-400 outline-none bg-transparent"
                    data-testid="search-overlay-input"
                  />
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full p-1.5 hover:bg-gray-100 transition-colors shrink-0"
                    aria-label="Close search"
                    data-testid="search-overlay-close"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </form>

              {/* Live results */}
              {results.length > 0 && (
                <div className="mt-4 space-y-1">
                  {results.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      type="button"
                      onClick={() => handleResultClick(result)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-green-50 transition-colors text-left group"
                      data-testid={`search-result-${result.type}-${result.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <Search className="h-4 w-4 text-gray-400 group-hover:text-green-600 shrink-0" />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                          {result.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase text-gray-400 group-hover:text-green-600 bg-gray-100 group-hover:bg-green-100 px-2 py-0.5 rounded-full">
                        {result.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Popular searches */}
              {query.trim().length === 0 && (
                <div className="mt-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Popular Searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((item) => (
                      <button
                        key={item.slug}
                        type="button"
                        onClick={() => handlePopularClick(item.slug)}
                        className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:border-green-500 hover:text-green-700 hover:bg-green-50 transition-colors"
                        data-testid={`search-popular-${item.slug}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {query.trim().length > 0 && results.length === 0 && (
                <div className="mt-6 text-center py-4">
                  <p className="text-sm text-gray-500">
                    No results found for &ldquo;{query}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
