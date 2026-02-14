import { useState, useEffect } from "react";
import { Search, X, Command, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SEARCHES = [
  { id: "pashmina", title: "Kashmiri Pashmina", category: "BEST SELLER" },
  { id: "khussa", title: "Multani Khussa", category: "BEST SELLER" },
  { id: "powerbank", title: "Power Bank", category: "ELECTRONICS" },
  { id: "honey", title: "Pure Honey", category: "ORGANIC" },
  { id: "lamp", title: "Salt Lamp", category: "HOME DECOR" },
];

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [, setLocation] = useLocation();

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
        setSelectedIndex((prev) => (prev + 1) % POPULAR_SEARCHES.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + POPULAR_SEARCHES.length) % POPULAR_SEARCHES.length);
      } else if (e.key === "Enter") {
        if (query.trim() && selectedIndex === -1) {
          return;
        }
        e.preventDefault();
        const selected = POPULAR_SEARCHES[selectedIndex];
        if (selected) {
          setLocation(`/products?search=${encodeURIComponent(selected.title)}`);
          onClose();
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, query, setLocation, onClose]);

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
              onChange={(e) => setQuery(e.target.value)}
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
            Quick Searches
          </div>
          
          <div className="grid gap-1">
            {POPULAR_SEARCHES.map((item, index) => (
              <button
                key={item.id}
                onClick={() => {
                  setLocation(`/products?search=${encodeURIComponent(item.title)}`);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl transition-all text-left group border border-transparent",
                  index === selectedIndex ? "bg-primary/5 border-primary/10" : "hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <Search className={cn(
                    "h-4 w-4 transition-colors",
                    index === selectedIndex ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "text-sm font-medium transition-colors",
                    index === selectedIndex ? "text-primary" : "text-foreground"
                  )}>
                    {item.title}
                  </span>
                </div>
                <Badge variant="outline" className="text-[9px] font-bold px-1.5 h-4 border-primary/10 bg-primary/5 text-primary uppercase">
                  {item.category}
                </Badge>
              </button>
            ))}
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
