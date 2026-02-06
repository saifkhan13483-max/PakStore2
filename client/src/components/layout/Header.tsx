import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, Search, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const Header = () => {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center group">
              <span className="font-display text-2xl md:text-3xl font-bold tracking-tight text-primary transition-transform group-hover:scale-105">
                Noor<span className="text-secondary">Bazaar</span>
              </span>
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
            <div className="hidden sm:flex items-center">
              <Button variant="ghost" size="icon" className="hover-elevate">
                <Search className="h-5 w-5" />
              </Button>
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
                      Noor<span className="text-secondary">Bazaar</span>
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="flex flex-col flex-1 py-6">
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
                    
                    <div className="mt-auto p-6 space-y-4">
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
