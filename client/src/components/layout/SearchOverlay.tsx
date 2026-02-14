import { useState, useEffect } from "react";
import { Search, X, Command, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [, setLocation] = useLocation();
  
  const { data: products } = useProducts();
  const { categories } = useCategories();

  // Combine products and categories for search results
  const results = query.trim() 
    ? [
        ...(products?.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 4).map(p => ({
          id: p.id,
          title: p.name,
          category: "PRODUCT",
          type: "product"
        })) || []),
        ...(categories?.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 2).map(c => ({
          id: c.id,
          title: c.name,
          category: "CATEGORY",
          type: "category"
        })) || [])
      ]
    : [
        ...(products?.slice(0, 3).map(p => ({
          id: p.id,
          title: p.name,
          category: "POPULAR",
          type: "product"
        })) || []),
        ...(categories?.slice(0, 2).map(c => ({
          id: c.id,
          title: c.name,
          category: "TRENDING",
          type: "category"
        })) || [])
      ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setSelectedIndex(0);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = results[selectedIndex];
        if (selected) {
          if (selected.type === "product") {
            setLocation(`/products?search=${encodeURIComponent(selected.title)}`);
          } else {
            setLocation(`/products?categoryId=${selected.id}`);
          }
          onClose();
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, results, setLocation, onClose]);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setLocation(`/products?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-x-0 top-0 z-[101] bg-background p-4 shadow-xl md:top-[15%] md:mx-auto md:max-w-xl md:rounded-2xl border animate-in slide-in-from-top-4 duration-300 ease-out">
        <div className="flex items-center gap-2 mb-4">
          <form onSubmit={handleSearch} className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Search products..."
              className="h-11 text-base border-none bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 transition-all rounded-xl pl-10 pr-10 shadow-none"
            />
            {query && (
              <button 
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full text-muted-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>
          <Button variant="ghost" onClick={onClose} size="sm" className="text-muted-foreground hover:text-foreground rounded-xl px-3 h-11">
            Cancel
          </Button>
        </div>

        <div className="space-y-4">
          <div className="text-[10px] font-bold tracking-wider text-muted-foreground/60 uppercase px-1">
            {query.trim() ? "Search Results" : "Quick Suggestions"}
          </div>
          
          <div className="grid gap-1">
            {results.map((item, index) => (
              <button
                key={`${item.type}-${item.id}`}
                onClick={() => {
                  if (item.type === "product") {
                    setLocation(`/products?search=${encodeURIComponent(item.title)}`);
                  } else {
                    setLocation(`/products?categoryId=${item.id}`);
                  }
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl transition-all text-left group border border-transparent",
                  index === selectedIndex ? "bg-primary/5 border-primary/10" : "hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                  <Search className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    index === selectedIndex ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "text-sm font-medium transition-colors truncate",
                    index === selectedIndex ? "text-primary" : "text-foreground"
                  )}>
                    {item.title}
                  </span>
                </div>
                <Badge variant="outline" className="text-[9px] font-bold px-1.5 h-4 border-primary/10 bg-primary/5 text-primary uppercase shrink-0">
                  {item.category}
                </Badge>
              </button>
            ))}
            {query.trim() && results.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No results found for "{query}"
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground/60 font-medium px-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="flex items-center justify-center min-w-4 h-4 px-1 border rounded bg-muted/50 text-[9px]">Enter</kbd> to select
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="flex items-center justify-center min-w-4 h-4 px-1 border rounded bg-muted/50 text-[9px]">↑↓</kbd> to navigate
            </span>
          </div>
        </div>
      </div>
      <div 
        className="absolute inset-0 z-[100]" 
        onClick={onClose}
      />
    </div>
  );
}
