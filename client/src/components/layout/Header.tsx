import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, Search, User, X, ChevronDown, ChevronRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Category, ParentCategory, Product } from "@shared/schema";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
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
import { SearchOverlay } from "./SearchOverlay";
import { categoryFirestoreService } from "@/services/categoryFirestoreService";
import { useCategories } from "@/hooks/use-categories";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { useAuthStore } from "@/store/authStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [location, setLocation] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredParentId, setHoveredParentId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const { user, isAuthenticated, logout } = useAuthStore();
  
  const { categories: categoriesData, parentCategories, isLoading: categoriesLoading } = useCategories();

  const activeParent = hoveredParentId
    ? parentCategories?.find(p => String(p.id) === hoveredParentId)
    : parentCategories?.[0];

  const activeSubCategories = categoriesData?.filter(
    c => String(c.parentCategoryId) === String(activeParent?.id)
  ) || [];

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
    { href: "/categories", label: "Collections" },
    { href: "/about", label: "Our Story" },
    { href: "/contact", label: "Support" },
  ];

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 min-h-[64px]",
        isScrolled 
          ? "bg-background/80 backdrop-blur-lg border-b shadow-sm py-2" 
          : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-12 items-center justify-between gap-4">
          <Link href="/" className="flex items-center group">
            <img 
              src={getOptimizedImageUrl(logoImg, { width: 160, height: 40, crop: 'fit' })} 
              alt="PakCart" 
              className="h-10 w-auto transition-transform group-hover:scale-105" 
              width="160"
              height="40"
              fetchPriority="high"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link
              href="/"
              className={cn(
                "relative text-sm font-medium transition-colors hover:text-primary py-1 px-0.5",
                location === "/" 
                  ? "text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary after:rounded-full" 
                  : "text-muted-foreground"
              )}
            >
              Home
            </Link>

            <DropdownMenu onOpenChange={(open) => { if (!open) setHoveredParentId(null); }}>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary py-1 px-0.5 focus:outline-none",
                    location.startsWith("/collections") || location.startsWith("/categories")
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  Categories <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="p-0 w-auto shadow-lg rounded-lg overflow-hidden">
                <div className="flex">
                  {/* Left panel — parent categories */}
                  <div className="w-52 py-2 border-r border-border/50 bg-background">
                    {parentCategories?.map((parent) => {
                      const isActive = String(activeParent?.id) === String(parent.id);
                      return (
                        <div
                          key={parent.id}
                          onMouseEnter={() => setHoveredParentId(String(parent.id))}
                          className={cn(
                            "flex items-center justify-between px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground hover:bg-muted"
                          )}
                        >
                          <span>{parent.name}</span>
                          <ChevronRight className="h-4 w-4 opacity-60" />
                        </div>
                      );
                    })}
                    <div className="border-t border-border/50 mt-1 pt-1">
                      <DropdownMenuItem asChild className="mx-1">
                        <Link href="/products" className="cursor-pointer w-full text-sm font-medium px-3 py-2">
                          Shop All Products
                        </Link>
                      </DropdownMenuItem>
                    </div>
                  </div>

                  {/* Right panel — sub-categories of active parent */}
                  {activeSubCategories.length > 0 && (
                    <div className="w-48 py-2 bg-background">
                      {activeSubCategories.map((category) => (
                        <DropdownMenuItem key={category.id} asChild>
                          <Link
                            href={`/collections/${category.slug}`}
                            className="cursor-pointer px-4 py-2.5 text-sm text-muted-foreground hover:text-primary w-full block"
                          >
                            {category.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {navLinks.slice(2).map((link) => (
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

          <div className="flex items-center gap-1 sm:gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover-elevate"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            <SearchOverlay 
              isOpen={isSearchOpen} 
              onClose={() => setIsSearchOpen(false)} 
            />
            
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

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover-elevate">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.displayName || "Account"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer w-full">Profile Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="cursor-pointer w-full">My Orders</Link>
                  </DropdownMenuItem>
                  {user?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer w-full font-medium text-primary">
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={() => logout()}
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="text-sm font-medium">
                  <Link href="/auth/login">Log In</Link>
                </Button>
                <Button size="sm" asChild className="text-sm font-medium">
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}

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
                      <img src={getOptimizedImageUrl(logoImg)} alt="PakCart" className="h-8 w-auto" />
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="flex flex-col flex-1 overflow-y-auto py-6">
                    <nav className="flex flex-col px-6">
                      <Link
                        href="/"
                        className={cn(
                          "flex items-center py-4 text-lg font-medium transition-colors border-b",
                          location === "/" ? "text-primary" : "text-foreground hover:text-primary"
                        )}
                        onClick={() => {}}
                      >
                        Home
                      </Link>

                      <div className="flex flex-col border-b">
                        <Accordion type="single" collapsible className="w-full border-none">
                          <AccordionItem value="categories" className="border-none">
                            <AccordionTrigger className="py-4 text-lg font-medium hover:no-underline">
                              Categories
                            </AccordionTrigger>
                            <AccordionContent className="pb-4">
                              <div className="flex flex-col gap-4 pl-4">
                                {parentCategories?.map((parent) => (
                                  <div key={parent.id} className="flex flex-col gap-2">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                      {parent.name}
                                    </p>
                                    <div className="flex flex-col gap-1 pl-4">
                                      {categoriesData?.filter(c => String(c.parentCategoryId) === String(parent.id)).map((category) => (
                                        <Link
                                          key={category.id}
                                          href={`/collections/${category.slug}`}
                                          className={cn(
                                            "py-1 text-base font-medium transition-colors",
                                            location.includes(`/collections/${category.slug}`) ? "text-primary" : "text-foreground hover:text-primary"
                                          )}
                                        >
                                          {category.name}
                                        </Link>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>

                      {navLinks.slice(2).map((link) => (
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
                    
                    <div className="mt-auto p-6 flex flex-col gap-3 shrink-0">
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
                      {isAuthenticated ? (
                        <>
                          <Link href="/profile">
                            <Button className="w-full justify-start gap-3 h-12 text-lg" variant="outline">
                              <User className="h-5 w-5" />
                              My Profile
                            </Button>
                          </Link>
                          <Link href="/orders">
                            <Button className="w-full justify-start gap-3 h-12 text-lg" variant="outline">
                              <ShoppingBag className="h-5 w-5" />
                              My Orders
                            </Button>
                          </Link>
                          <Button 
                            className="w-full justify-start gap-3 h-12 text-lg text-destructive" 
                            variant="ghost"
                            onClick={() => logout()}
                          >
                            Logout
                          </Button>
                        </>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <Link href="/auth/login">
                            <Button className="w-full h-12 text-lg" variant="outline">Log In</Button>
                          </Link>
                          <Link href="/auth/signup">
                            <Button className="w-full h-12 text-lg">Sign Up</Button>
                          </Link>
                        </div>
                      )}
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
