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

  const megaCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalItems = useCartStore((state) => state.getTotalItems());
  const { user, isAuthenticated, logout } = useAuthStore();
  const { categories, parentCategories } = useCategories();

  // Debounced scroll listener
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

  // Cart badge pulse on count change
  useEffect(() => {
    if (totalItems > prevCartCount) {
      setCartBadgePulse(true);
      const t = setTimeout(() => setCartBadgePulse(false), 700);
      return () => clearTimeout(t);
    }
    setPrevCartCount(totalItems);
  }, [totalItems]);

  // Close mega dropdown on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMegaOpen(false);
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // On home page + not scrolled → transparent background, always dark text
  // On scroll or other pages → solid white with blur + shadow
  const isTransparent = isHomePage && !isScrolled;

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

  const userInitial = (user?.displayName ?? user?.email ?? "U")
    .charAt(0)
    .toUpperCase();

  return (
    <>
      {/* ── DESKTOP HEADER ── */}
      <header
        className={cn(
          "hidden lg:block sticky top-0 z-50 w-full transition-all duration-300 relative",
          isTransparent
            ? "bg-white/90 backdrop-blur-md"
            : "bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100"
        )}
      >
        <div className="container mx-auto px-6 relative">
          <div className="grid grid-cols-3 items-center h-16">
            {/* LEFT: Logo */}
            <div className="flex items-center">
              <Link href="/" data-testid="header-logo-link">
                <img
                  src={logoImg}
                  alt="PakCart"
                  className="h-10 w-auto transition-all duration-300"
                  width="140"
                  height="40"
                  fetchPriority="high"
                />
              </Link>
            </div>

            {/* CENTER: Nav links */}
            <nav className="flex items-center justify-center gap-5">
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
                        "relative text-sm font-medium uppercase tracking-normal whitespace-nowrap transition-colors duration-200 py-1",
                        "text-gray-700 hover:text-green-700",
                        isActive && "text-green-700"
                      )}
                    >
                      {link.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 rounded-full" />
                      )}
                    </span>
                  </Link>
                );
              })}

              {/* Categories (mega dropdown trigger) — middle position */}
              <button
                type="button"
                onMouseEnter={handleMegaMouseEnter}
                onMouseLeave={handleMegaMouseLeave}
                className={cn(
                  "flex items-center gap-1 text-sm font-medium uppercase tracking-normal whitespace-nowrap transition-colors duration-200 py-1 text-gray-700 hover:text-green-700",
                  isMegaOpen && "text-green-700"
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
                        "relative text-sm font-medium uppercase tracking-normal whitespace-nowrap transition-colors duration-200 py-1",
                        "text-gray-700 hover:text-green-700",
                        isActive && "text-green-700"
                      )}
                    >
                      {link.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 rounded-full" />
                      )}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* RIGHT: Icons */}
            <div className="flex items-center justify-end gap-1">
              {/* Search */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="w-10 h-10 flex items-center justify-center rounded-full transition-colors text-gray-600 hover:bg-gray-100 hover:text-green-700"
                aria-label="Open search"
                data-testid="header-search-btn"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Cart */}
              <Link href="/cart" data-testid="header-cart-link">
                <button
                  type="button"
                  className="relative w-10 h-10 flex items-center justify-center rounded-full transition-colors text-gray-600 hover:bg-gray-100 hover:text-green-700"
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
                      className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ml-1 bg-green-100 text-green-700 hover:bg-green-200"
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
                    <span className="text-sm font-medium transition-colors cursor-pointer text-gray-700 hover:text-green-700">
                      Log In
                    </span>
                  </Link>
                  <Link href="/auth/signup" data-testid="header-signup-link">
                    <Button
                      size="sm"
                      className="rounded-full px-5 bg-green-600 hover:bg-green-700 text-white font-medium"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mega dropdown — anchored to container width */}
          <div
            onMouseEnter={handleMegaMouseEnter}
            onMouseLeave={handleMegaMouseLeave}
          >
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
          {/* Hamburger */}
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-700"
            aria-label="Open menu"
            data-testid="header-hamburger-btn"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo (center) */}
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

          {/* Search */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-700"
            aria-label="Open search"
            data-testid="header-mobile-search-btn"
          >
            <Search className="h-5 w-5" />
          </button>
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
      />
    </>
  );
};

export default Header;
