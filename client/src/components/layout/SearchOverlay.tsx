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

const POPULAR_TOOLS = [
  { id: "pashmina", title: "Kashmiri Pashmina", category: "BEST SELLER", description: "Authentic hand-woven wool scarf" },
  { id: "khussa", title: "Multani Khussa", category: "BEST SELLER", description: "Traditional leather footwear with embroidery" },
  { id: "powerbank", title: "BX-301 Power Bank", category: "BEST SELLER", description: "High-capacity 20000mAh fast charging" },
  { id: "honey", title: "Sidr Honey", category: "BEST SELLER", description: "Pure organic mountain honey" },
  { id: "lamp", title: "Salt Lamp", category: "BEST SELLER", description: "Natural Himalayan rock salt lamp" },
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
        setSelectedIndex((prev) => (prev + 1) % POPULAR_TOOLS.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + POPULAR_TOOLS.length) % POPULAR_TOOLS.length);
      } else if (e.key === "Enter") {
        if (query.trim() && selectedIndex === -1) {
          // Normal search if typing and nothing selected
          return;
        }
        e.preventDefault();
        const selectedTool = POPULAR_TOOLS[selectedIndex];
        if (selectedTool) {
          setLocation(`/products?search=${encodeURIComponent(selectedTool.title)}`);
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
      setLocation(`/products?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="fixed inset-x-0 top-0 z-[101] bg-background p-6 shadow-2xl md:top-[10%] md:mx-auto md:max-w-2xl md:rounded-3xl border border-border/50 animate-in slide-in-from-top-8 duration-500 ease-out">
        <div className="flex items-center gap-4 mb-8">
          <form onSubmit={handleSearch} className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products, categories..."
              className="h-14 text-lg border-none bg-muted/30 focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all rounded-2xl pl-12 pr-12 shadow-inner"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {query ? (
                <button 
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1.5 hover:bg-muted rounded-full text-muted-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 border rounded-lg bg-background/50 text-[10px] text-muted-foreground font-medium tracking-tight">
                  <span className="text-xs">⌘</span>
                  <span>K</span>
                </div>
              )}
            </div>
          </form>
          <Button variant="ghost" onClick={onClose} className="text-muted-foreground hover:text-foreground font-medium px-4 h-14 rounded-2xl">
            Cancel
          </Button>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-3 text-[11px] font-bold tracking-[0.2em] text-muted-foreground/50 uppercase px-1">
            Suggested Search
          </div>
          
          <div className="grid gap-2">
            {POPULAR_TOOLS.map((tool, index) => (
              <button
                key={tool.id}
                onClick={() => {
                  setLocation(`/products?search=${encodeURIComponent(tool.title)}`);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left group border border-transparent",
                  index === selectedIndex ? "bg-primary/5 border-primary/10 shadow-sm" : "hover:bg-muted/50"
                )}
              >
                <div className={cn(
                  "h-12 w-12 flex items-center justify-center rounded-xl transition-all duration-300 shrink-0",
                  index === selectedIndex ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground group-hover:scale-105"
                )}>
                  <Search className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className={cn(
                      "text-base font-semibold transition-colors truncate",
                      index === selectedIndex ? "text-primary" : "text-foreground group-hover:text-primary"
                    )}>
                      {tool.title}
                    </span>
                    <Badge variant="outline" className="text-[9px] font-bold tracking-widest px-2 py-0.5 border-primary/10 bg-primary/5 text-primary uppercase">
                      {tool.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground/80 line-clamp-1 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
                <ArrowRight className={cn(
                  "h-4 w-4 text-primary transition-all duration-300",
                  index === selectedIndex ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                )} />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground/60 font-medium px-1">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <kbd className="flex items-center justify-center min-w-5 h-5 px-1.5 border rounded bg-muted/50 text-[10px] font-sans">Enter</kbd> to select
            </span>
            <span className="flex items-center gap-2">
              <kbd className="flex items-center justify-center min-w-5 h-5 px-1.5 border rounded bg-muted/50 text-[10px] font-sans">↑↓</kbd> to navigate
            </span>
          </div>
          <span className="bg-muted/50 px-2 py-0.5 rounded-full">{POPULAR_TOOLS.length} results</span>
        </div>
      </div>
      <div 
        className="absolute inset-0 z-[100]" 
        onClick={onClose}
      />
    </div>
  );
}
