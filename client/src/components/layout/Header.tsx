import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import {
  Search,
  ShoppingBag,
  Menu,
  User,
  LogOut,
  Package,
  ChevronDown,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import logoImg from "@/assets/logo.png";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useCategories } from "@/hooks/use-categories";
import { MegaDropdown } from "./MegaDropdown";
import { MobileNav } from "./MobileNav";
import { SearchOverlay } from "./SearchOverlay";

const NAV_LINKS_LEFT = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Collections" },
];

const NAV_LINKS_RIGHT = [
  { href: "/about", label: "Our Story" },
  { href: "/contact", label: "Support" },
];

const SCROLL_THRESHOLD = 50;

const Header = () => {
  const [location] = useLocation();
  const isHomePage = location === "/";

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const [hoveredParentId, setHoveredParentId] = useState<string | null>(null);
  const [prevCartCount, setPrevCartCount] = useState(0);
  const [cartBadgePulse, setCartBadgePulse] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const megaCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerSearchRef = useRef<HTMLInputElement>(null);

  const totalItems = useCartStore((state) => state.getTotalItems());
  const { user, isAuthenticated, logout } = useAuthStore();
  const { categories, parentCategories } = useCategories();

  useEffect(() => {
    const handleScroll = () => {
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
      scrollTimer.current = setTimeout(() => {
        setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
      }, 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
    };
  }, []);

  useEffect(() => {
    if (totalItems > prevCartCount) {
      setCartBadgePulse(true);
      const t = setTimeout(() => setCartBadgePulse(false), 700);
      return () => clearTimeout(t);
    }
    setPrevCartCount(totalItems);
  }, [totalItems]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMegaOpen(false);
        setIsSearchOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleMegaMouseEnter = useCallback(() => {
    if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current);
    setIsMegaOpen(true);
  }, []);

  const handleMegaMouseLeave = useCallback(() => {
    megaCloseTimer.current = setTimeout(() => {
      setIsMegaOpen(false);
      setHoveredParentId(null);
    }, 150);
  }, []);

  const handleParentHover = useCallback((id: string) => {
    if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current);
    setHoveredParentId(id);
  }, []);

  const handleMegaClose = useCallback(() => {
    setIsMegaOpen(false);
    setHoveredParentId(null);
  }, []);

  const handleHeaderSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(true);
    }
  };

  const userInitial = (user?.displayName ?? user?.email ?? "U")
    .charAt(0)
    .toUpperCase();

  return (
    <>
      {/* ── DESKTOP HEADER ── */}
      <header
        className={cn(
          "hidden lg:block sticky top-0 z-50 w-full transition-all duration-300",
          isScrolled
            ? "bg-white/98 backdrop-blur-xl shadow-md border-b border-gray-100"
            : "bg-white/95 backdrop-blur-md border-b border-gray-100/80"
        )}
      >
        {/* ── TOP ROW: Logo + Search + Actions ── */}
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-6 h-[68px]">

            {/* Logo */}
            <Link href="/" data-testid="header-logo-link" className="shrink-0">
              <img
                src={logoImg}
                alt="PakCart"
                className="h-10 w-auto transition-all duration-300"
                width="140"
                height="40"
                fetchPriority="high"
              />
            </Link>

            {/* Search bar — grows to fill remaining space */}
            <form
              onSubmit={handleHeaderSearchSubmit}
              className="flex-1 max-w-2xl"
            >
              <div
                className={cn(
                  "relative flex items-center group",
                  "bg-gray-50 border-2 rounded-2xl transition-all duration-200",
                  "border-gray-200 hover:border-green-300 focus-within:border-green-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(34,197,94,0.10)]"
                )}
              >
                {/* Green search icon badge */}
                <div className="absolute left-3.5 flex items-center justify-center w-8 h-8 rounded-xl bg-green-600 shadow-sm pointer-events-none shrink-0 transition-all duration-200 group-focus-within:bg-green-700">
                  <Search className="h-4 w-4 text-white" />
                </div>

                <input
                  ref={headerSearchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder="Search bags, watches, accessories…"
                  className="w-full h-12 pl-14 pr-24 text-sm text-gray-800 placeholder:text-gray-400 bg-transparent outline-none rounded-2xl"
                  data-testid="header-search-input"
                  autoComplete="off"
                />

                {/* Keyboard shortcut hint */}
                {searchQuery.length === 0 && (
                  <div className="absolute right-[5.5rem] flex items-center gap-1 pointer-events-none">
                    <kbd className="hidden xl:flex items-center gap-0.5 text-[10px] text-gray-300 font-mono">
                      <span className="px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50">⌘</span>
                      <span className="px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50">K</span>
                    </kbd>
                  </div>
                )}

                {/* Clear button */}
                {searchQuery.length > 0 && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(""); headerSearchRef.current?.focus(); }}
                    className="absolute right-[5rem] w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label="Clear"
                    data-testid="header-search-clear"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}

                {/* Search submit button */}
                <button
                  type="submit"
                  className="absolute right-2 h-8 px-4 flex items-center gap-1.5 rounded-xl bg-green-600 hover:bg-green-700 active:scale-95 text-white text-sm font-semibold transition-all duration-150 shadow-sm"
                  data-testid="header-search-submit"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Actions: Cart + Auth */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Cart */}
              <Link href="/cart" data-testid="header-cart-link">
                <button
                  type="button"
                  className="relative w-11 h-11 flex items-center justify-center rounded-full transition-colors text-gray-600 hover:bg-green-50 hover:text-green-700"
                  aria-label="Cart"
                  data-testid="header-cart-btn"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <AnimatePresence>
                    {totalItems > 0 && (
                      <motion.span
                        key="cart-badge"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className={cn(
                          "absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-green-600 text-white text-[10px] font-bold flex items-center justify-center",
                          cartBadgePulse && "animate-bounce"
                        )}
                        data-testid="cart-badge"
                      >
                        {totalItems > 99 ? "99+" : totalItems}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </Link>

              {/* Auth */}
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="w-10 h-10 ml-1 rounded-full flex items-center justify-center font-semibold text-sm transition-all bg-green-100 text-green-700 hover:bg-green-200 ring-2 ring-transparent hover:ring-green-300"
                      aria-label="User menu"
                      data-testid="header-user-avatar"
                    >
                      {userInitial}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 mt-2 rounded-xl shadow-lg">
                    <div className="px-3 py-2 border-b mb-1">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {user.displayName ?? "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <span className="flex items-center gap-2 cursor-pointer w-full" data-testid="header-profile-link">
                          <User className="h-4 w-4" />
                          My Profile
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders">
                        <span className="flex items-center gap-2 cursor-pointer w-full" data-testid="header-orders-link">
                          <Package className="h-4 w-4" />
                          My Orders
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => logout()}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                      data-testid="header-logout-btn"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2 ml-1">
                  <Link href="/auth/login" data-testid="header-login-link">
                    <span className="text-sm font-medium transition-colors cursor-pointer text-gray-700 hover:text-green-700 whitespace-nowrap">
                      Log In
                    </span>
                  </Link>
                  <Link href="/auth/signup" data-testid="header-signup-link">
                    <Button
                      size="sm"
                      className="rounded-full px-5 bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── BOTTOM ROW: Navigation ── */}
        <div className="border-t border-gray-100/80 bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-6">
            <nav className="flex items-center gap-1 h-10 relative" onMouseLeave={handleMegaMouseLeave}>
              {NAV_LINKS_LEFT.map((link) => {
                const isActive = location === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    data-testid={`nav-link-${link.label.toLowerCase().replace(" ", "-")}`}
                  >
                    <span
                      className={cn(
                        "relative inline-flex items-center px-4 h-10 text-sm font-medium tracking-wide whitespace-nowrap transition-colors duration-150 rounded-lg",
                        isActive
                          ? "text-green-700 bg-green-50"
                          : "text-gray-600 hover:text-green-700 hover:bg-green-50/60"
                      )}
                    >
                      {link.label}
                      {isActive && (
                        <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-green-500 rounded-full" />
                      )}
                    </span>
                  </Link>
                );
              })}

              {/* Categories mega trigger */}
              <button
                type="button"
                onMouseEnter={handleMegaMouseEnter}
                className={cn(
                  "flex items-center gap-1 px-4 h-10 text-sm font-medium tracking-wide whitespace-nowrap transition-colors duration-150 rounded-lg",
                  isMegaOpen
                    ? "text-green-700 bg-green-50"
                    : "text-gray-600 hover:text-green-700 hover:bg-green-50/60"
                )}
                aria-expanded={isMegaOpen}
                data-testid="nav-categories-trigger"
              >
                Categories
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    isMegaOpen && "rotate-180"
                  )}
                />
              </button>

              {NAV_LINKS_RIGHT.map((link) => {
                const isActive = location === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    data-testid={`nav-link-${link.label.toLowerCase().replace(" ", "-")}`}
                  >
                    <span
                      className={cn(
                        "relative inline-flex items-center px-4 h-10 text-sm font-medium tracking-wide whitespace-nowrap transition-colors duration-150 rounded-lg",
                        isActive
                          ? "text-green-700 bg-green-50"
                          : "text-gray-600 hover:text-green-700 hover:bg-green-50/60"
                      )}
                    >
                      {link.label}
                      {isActive && (
                        <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-green-500 rounded-full" />
                      )}
                    </span>
                  </Link>
                );
              })}

              {/* Divider + small promo pill */}
              <div className="ml-auto flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-xs font-semibold text-green-700">
                  🚚 Free delivery over Rs. 10,000
                </span>
              </div>
            </nav>
          </div>

          {/* Mega dropdown */}
          <div onMouseEnter={handleMegaMouseEnter} onMouseLeave={handleMegaMouseLeave}>
            <MegaDropdown
              isOpen={isMegaOpen}
              parentCategories={parentCategories}
              categories={categories}
              hoveredParentId={hoveredParentId}
              onParentHover={handleParentHover}
              onClose={handleMegaClose}
            />
          </div>
        </div>
      </header>

      {/* ── MOBILE HEADER ── */}
      <header className="lg:hidden sticky top-0 z-50 w-full bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-700"
            aria-label="Open menu"
            data-testid="header-hamburger-btn"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" data-testid="header-mobile-logo">
            <img
              src={logoImg}
              alt="PakCart"
              className="h-8 w-auto"
              width="100"
              height="32"
              fetchPriority="high"
            />
          </Link>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-700"
              aria-label="Open search"
              data-testid="header-mobile-search-btn"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link href="/cart" data-testid="header-mobile-cart-link">
              <button
                type="button"
                className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-700"
                aria-label="Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-green-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── MOBILE NAV SHEET ── */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        parentCategories={parentCategories}
        categories={categories}
      />

      {/* ── SEARCH OVERLAY ── */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        initialQuery={searchQuery}
        onQueryChange={setSearchQuery}
      />
    </>
  );
};

export default Header;
