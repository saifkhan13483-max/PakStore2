import { getOptimizedImageUrl } from "@/lib/cloudinary";
import logoImg from "@/assets/logo.png";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, Search, User, LogOut, Command, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SearchOverlay } from "./SearchOverlay";
import { useQuery } from "@tanstack/react-query";
import { Category, ParentCategory } from "@shared/schema";
import { categoryFirestoreService } from "@/services/categoryFirestoreService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const getTotalItems = useCartStore(state => state.getTotalItems);
  const itemCount = getTotalItems();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const { data: parentCategories } = useQuery<ParentCategory[]>({ 
    queryKey: ["parent-categories"],
    queryFn: () => categoryFirestoreService.getAllParentCategories()
  });
  const { data: categoriesData } = useQuery<Category[]>({ 
    queryKey: ["categories"],
    queryFn: () => categoryFirestoreService.getAllCategories()
  });

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between relative">
          
          {/* Mobile Menu */}
          <div className="flex items-center md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto p-6">
                    <nav className="flex flex-col gap-4 mt-4">
                      <Link href="/" className="text-lg font-medium hover:text-primary transition-colors">
                        Home
                      </Link>

                      <div className="flex flex-col gap-4">
                        {parentCategories?.map((parent) => (
                          <div key={parent.id} className="flex flex-col gap-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              {parent.name}
                            </p>
                            <div className="flex flex-col gap-2 pl-4">
                              {categoriesData?.filter(c => String(c.parentCategoryId) === String(parent.id)).map((category) => (
                                <Link key={category.id} href={`/products?categoryId=${category.id}`} className="text-base font-medium hover:text-primary transition-colors">
                                  {category.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {navLinks.slice(2).map((link) => (
                        <Link key={link.href} href={link.href} className="text-lg font-medium hover:text-primary transition-colors">
                          {link.name}
                        </Link>
                      ))}
                    </nav>
                  </div>
                  <div className="p-6 border-t bg-muted/20 shrink-0">
                    <Link href="/cart">
                      <Button className="w-full justify-start gap-3 h-12" variant="outline">
                        <ShoppingCart className="h-5 w-5" />
                        View Cart
                        {itemCount > 0 && (
                          <Badge className="ml-auto rounded-full">
                            {itemCount}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <img src={getOptimizedImageUrl(logoImg)} alt="PakCart" className="h-10 w-auto" />
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link 
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === "/" ? "text-primary font-semibold" : "text-muted-foreground"
              }`}
            >
              Home
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex items-center gap-2 text-sm font-medium transition-all hover:text-primary focus:outline-none h-10 px-4 rounded-full border border-transparent hover:border-border/50 hover:bg-accent/30 ${
                    location.startsWith("/products") ? "text-primary bg-primary/5 border-primary/20" : "text-muted-foreground"
                  }`}
                >
                  <Menu className="h-4 w-4" />
                  Categories
                  <ChevronDown className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="start" 
                className="w-[480px] p-0 shadow-2xl border-border/40 overflow-hidden rounded-xl animate-in fade-in slide-in-from-top-2 duration-300"
              >
                <div className="flex">
                  <div className="flex-1 p-6 bg-background">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                      {parentCategories?.map((parent) => (
                        <div key={parent.id} className="space-y-3">
                          <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary/80 px-0 py-0 mb-1 border-b border-primary/10 pb-1">
                            {parent.name}
                          </DropdownMenuLabel>
                          <div className="flex flex-col gap-1">
                            {categoriesData?.filter(c => String(c.parentCategoryId) === String(parent.id)).map((category) => (
                              <DropdownMenuItem key={category.id} asChild className="p-0 focus:bg-transparent">
                                <Link 
                                  href={`/products?categoryId=${category.id}`} 
                                  className="group flex items-center justify-between w-full rounded-md px-2 py-1.5 text-[13px] text-muted-foreground transition-all hover:bg-primary/5 hover:text-primary active:translate-x-0.5"
                                >
                                  <span className="font-medium">{category.name}</span>
                                  <ChevronDown className="h-3 w-3 -rotate-90 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                                </Link>
                              </DropdownMenuItem>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="w-40 bg-muted/30 border-l border-border/40 p-6 flex flex-col justify-between">
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Featured</p>
                      <Link href="/products" className="block group">
                        <p className="text-sm font-semibold group-hover:text-primary transition-colors">New Arrivals</p>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">Check out our latest electronic gadgets.</p>
                      </Link>
                    </div>
                    <DropdownMenuItem asChild className="p-0 focus:bg-transparent mt-8">
                      <Link 
                        href="/products" 
                        className="flex items-center justify-center w-full font-bold text-[10px] uppercase tracking-widest px-3 py-3 bg-primary text-primary-foreground rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.97]"
                      >
                        All Products
                      </Link>
                    </DropdownMenuItem>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {navLinks.slice(1).map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === link.href ? "text-primary font-semibold" : "text-muted-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSearchOpen(true)}
              className="hidden lg:flex items-center gap-2 w-64 justify-start text-muted-foreground h-10 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 border-border/50 transition-all group"
            >
              <Search className="h-4 w-4 group-hover:text-primary transition-colors" />
              <span className="text-sm font-medium">Search...</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground/60">
                ⌘K
              </kbd>
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-5 w-5 text-muted-foreground" />
            </Button>

            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
            
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                {itemCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground text-[10px] p-0 animate-in zoom-in"
                  >
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full overflow-hidden">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="hidden sm:flex text-sm font-medium">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="text-sm font-medium">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
