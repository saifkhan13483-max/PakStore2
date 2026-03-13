import { Link, useLocation } from "wouter";
import { Home, Grid2X2, ShoppingCart, Package, User } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/categories", label: "Categories", icon: Grid2X2 },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/orders", label: "Orders", icon: Package },
  { href: "/profile", label: "Account", icon: User },
];

export function BottomNav() {
  const [location] = useLocation();
  const { items } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const getHref = (href: string) => {
    if (href === "/profile" && !isAuthenticated) return "/auth/login";
    if (href === "/orders" && !isAuthenticated) return "/auth/login";
    return href;
  };

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.08)] lg:hidden"
      data-testid="bottom-nav"
    >
      <div className="flex items-stretch h-16">
        {navItems.map(({ href, label, icon: Icon }) => {
          const resolvedHref = getHref(href);
          const active = isActive(href);
          const showBadge = href === "/cart" && cartCount > 0;

          return (
            <Link key={href} href={resolvedHref} className="flex-1">
              <span
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 h-full w-full transition-colors",
                  active ? "text-green-600" : "text-gray-500"
                )}
                data-testid={`bottom-nav-${label.toLowerCase()}`}
              >
                <span className="relative">
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-all",
                      active ? "stroke-[2.5px]" : "stroke-[1.75px]"
                    )}
                  />
                  {showBadge && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-0.5 bg-green-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-medium leading-none",
                    active ? "text-green-600" : "text-gray-500"
                  )}
                >
                  {label}
                </span>
                {active && (
                  <span className="absolute bottom-0 h-0.5 w-8 bg-green-600 rounded-t-full" />
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
