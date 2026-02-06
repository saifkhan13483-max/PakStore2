import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, Search, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import logoImg from "@/assets/logo.png";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const Header = () => {
  const [location, setLocation] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const totalItems = useCartStore((state) => state.getTotalItems());
  
  const { data: searchResults, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", { search: searchQuery }],
    enabled: searchQuery.length > 2,
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Shop" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled 
          ? "bg-background/80 backdrop-blur-lg border-b shadow-sm py-2" 
          : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-12 items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center group">
              <img 
                src={logoImg} 
                alt="PakCart" 
                className="h-10 w-auto transition-transform group-hover:scale-105" 
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative text-sm font-medium transition-colors hover:text-primary py-1 px-0.5",
                    location === link.href 
                      ? "text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary after:rounded-full" 
                      : "text-muted-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="relative">
              {isSearchOpen ? (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center bg-background border rounded-full px-3 py-1 w-[200px] sm:w-[300px] animate-in slide-in-from-right-4">
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search products..."
                    className="border-0 focus-visible:ring-0 h-8 p-0 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchQuery.trim()) {
                        setLocation(`/products?search=${encodeURIComponent(searchQuery)}`);
                        setIsSearchOpen(false);
                      }
                      if (e.key === "Escape") setIsSearchOpen(false);
                    }}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setIsSearchOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  
                  {searchQuery.length > 2 && (
                    <div className="absolute top-full right-0 mt-2 w-full bg-background border rounded-lg shadow-lg overflow-hidden z-50">
                      {isLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
                      ) : searchResults && searchResults.length > 0 ? (
                        <div className="max-height-[300px] overflow-auto">
                          {searchResults.slice(0, 5).map((product) => (
                            <Link 
                              key={product.id} 
                              href={`/products/${product.slug}`}
                              onClick={() => {
                                setIsSearchOpen(false);
                                setSearchQuery("");
                              }}
                              className="flex items-center gap-3 p-3 hover:bg-muted transition-colors border-b last:border-0"
                            >
                              <div className="w-10 h-10 rounded bg-muted flex-shrink-0">
                                {product.images?.[0] && (
                                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded" />
                                )}
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium truncate">{product.name}</p>
                                <p className="text-xs text-muted-foreground">Rs. {product.price}</p>
                              </div>
                            </Link>
                          ))}
                          {searchResults.length > 5 && (
                            <Link 
                              href={`/products?search=${encodeURIComponent(searchQuery)}`}
                              onClick={() => setIsSearchOpen(false)}
                              className="block p-2 text-center text-xs font-medium text-primary hover:bg-muted"
                            >
                              View all results
                            </Link>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">No products found</div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover-elevate"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}
            </div>
            
            <Button variant="ghost" size="icon" className="relative hover-elevate" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px] font-bold animate-in zoom-in"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Link>
            </Button>

            <Button variant="ghost" size="icon" className="hidden sm:flex hover-elevate">
              <User className="h-5 w-5" />
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden hover-elevate">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0">
                <div className="flex flex-col h-full bg-background">
                  <SheetHeader className="p-6 border-b text-left">
                    <SheetTitle className="font-display text-2xl font-bold text-primary">
                      <img src={logoImg} alt="PakCart" className="h-8 w-auto" />
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="flex flex-col flex-1 py-6">
                    <div className="px-6 mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search products..." 
                          className="pl-10 h-10 rounded-full"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && searchQuery.trim()) {
                              setLocation(`/products?search=${encodeURIComponent(searchQuery)}`);
                            }
                          }}
                        />
                      </div>
                    </div>

                    <nav className="flex flex-col px-6">
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={cn(
                            "flex items-center py-4 text-lg font-medium transition-colors border-b last:border-0",
                            location === link.href ? "text-primary" : "text-foreground hover:text-primary"
                          )}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </nav>
                    
                    <div className="mt-auto p-6 flex flex-col gap-3">
                      <Link href="/cart">
                        <Button className="w-full justify-start gap-3 h-12 text-lg" variant="outline">
                          <ShoppingCart className="h-5 w-5" />
                          View Cart
                          {totalItems > 0 && (
                            <Badge variant="secondary" className="ml-auto rounded-full px-2 py-0.5">
                              {totalItems}
                            </Badge>
                          )}
                        </Button>
                      </Link>
                      <Link href="/account">
                        <Button className="w-full justify-start gap-3 h-12 text-lg" variant="outline">
                          <User className="h-5 w-5" />
                          My Account
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
