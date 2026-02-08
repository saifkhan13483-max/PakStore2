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
  { id: "loan", title: "Loan Calculator", category: "FINANCE", description: "Calculate monthly payments and total interest for any loan" },
  { id: "emi", title: "EMI Calculator", category: "FINANCE", description: "Calculate Equated Monthly Installments for loans" },
  { id: "word", title: "Word Counter", category: "TEXT", description: "Count words, characters, and paragraphs" },
  { id: "unit", title: "Unit Converter", category: "TEXT", description: "Convert between different units of measurement" },
  { id: "bmi", title: "BMI Calculator", category: "HEALTH", description: "Calculate your Body Mass Index and get health insights" },
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
    <div className="fixed inset-0 z-[100] bg-background/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-x-0 top-0 z-[101] bg-background p-4 shadow-lg md:top-[15%] md:mx-auto md:max-w-2xl md:rounded-2xl border animate-in slide-in-from-top-4 duration-300">
        <div className="flex items-center gap-2 mb-6">
          <form onSubmit={handleSearch} className="relative flex-1 group">
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools..."
              className="h-14 text-lg border border-primary/20 focus-visible:ring-0 focus-visible:border-primary transition-all rounded-xl pl-4 pr-10"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {query ? (
                <button 
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 hover:bg-accent rounded-full text-muted-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <div className="flex items-center gap-1 px-1.5 py-0.5 border rounded bg-muted/50 text-[10px] text-muted-foreground font-mono">
                  <Command className="h-3 w-3" />
                  <span>K</span>
                </div>
              )}
            </div>
          </form>
          <Button variant="ghost" onClick={onClose} className="md:hidden text-muted-foreground font-medium text-lg h-14">
            Cancel
          </Button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase px-1">
            <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
            Popular Tools
          </div>
          
          <div className="space-y-1">
            {POPULAR_TOOLS.map((tool, index) => (
              <button
                key={tool.id}
                onClick={() => {
                  setLocation(`/products?search=${encodeURIComponent(tool.title)}`);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  "w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left group",
                  index === selectedIndex ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-accent/50"
                )}
              >
                <div className={cn(
                  "h-12 w-12 flex items-center justify-center rounded-xl transition-colors shrink-0",
                  index === selectedIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                )}>
                  <Search className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                      "font-semibold transition-colors truncate",
                      index === selectedIndex ? "text-primary" : "text-foreground group-hover:text-primary"
                    )}>
                      {tool.title}
                    </span>
                    <Badge variant="secondary" className="text-[9px] font-bold tracking-wider h-4 px-1.5 bg-muted group-hover:bg-primary/10 uppercase">
                      {tool.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1 leading-tight">
                    {tool.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-4 border-t flex items-center justify-between text-[11px] text-muted-foreground font-medium px-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="flex items-center justify-center w-4 h-4 border rounded bg-muted/50 text-[10px]">✓</span> to select
            </span>
            <span className="flex items-center gap-1.5">
              <span className="flex items-center justify-center h-4 px-1 border rounded bg-muted/50 text-[10px]">↑↓</span> to navigate
            </span>
          </div>
          <span>5 results</span>
        </div>
      </div>
      <div 
        className="absolute inset-0 z-[100]" 
        onClick={onClose}
      />
    </div>
  );
}
