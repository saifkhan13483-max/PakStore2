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
    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-x-0 top-0 z-[101] bg-background p-4 shadow-xl md:top-[10%] md:mx-auto md:max-w-2xl md:rounded-2xl border animate-in slide-in-from-top-4 duration-300 ease-out h-full md:h-auto overflow-y-auto">
        <div className="flex items-center gap-2 mb-6 sticky top-0 bg-background pb-2">
          <form onSubmit={handleSearch} className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Search products..."
              className="h-10 text-sm border-none bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all rounded-xl pl-12 pr-12 shadow-none"
            />
            {query && (
              <button 
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted rounded-full text-muted-foreground transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </form>
          <Button variant="ghost" onClick={onClose} size="sm" className="text-muted-foreground hover:text-foreground rounded-xl px-4 h-10 text-xs">
            Cancel
          </Button>
        </div>

        <div className="space-y-4 pb-4">
          <div className="text-[10px] font-bold tracking-[0.1em] text-muted-foreground/50 uppercase px-2">
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
                  "w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left group border border-transparent hover-elevate",
                  index === selectedIndex ? "bg-primary/10 border-primary/20 shadow-sm" : "hover:bg-muted/30"
                )}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 pr-6">
                  <div className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    index === selectedIndex ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}>
                    <Search className="h-3.5 w-3.5 shrink-0" />
                  </div>
                  <span className={cn(
                    "text-sm font-medium transition-colors truncate max-w-[200px]",
                    index === selectedIndex ? "text-primary" : "text-foreground"
                  )}>
                    {item.title}
                  </span>
                </div>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[9px] font-bold px-1.5 h-4 uppercase shrink-0 transition-colors",
                    index === selectedIndex 
                      ? "border-primary/20 bg-primary/10 text-primary" 
                      : "border-border/50 bg-muted/30 text-muted-foreground"
                  )}
                >
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
      </div>
      <div 
        className="absolute inset-0 z-[100]" 
        onClick={onClose}
      />
    </div>
  );
}
