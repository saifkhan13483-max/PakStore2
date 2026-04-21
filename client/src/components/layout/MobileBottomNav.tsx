import { Link, useLocation } from "wouter";
import { Home, Grid2X2, ShoppingBag, Package, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";

const MobileBottomNav = () => {
  const [location] = useLocation();
  const totalItems = useCartStore((state) => state.getTotalItems());
  const { isAuthenticated } = useAuthStore();

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      testId: "bottom-nav-home",
      exact: true,
    },
    {
      href: "/categories",
      label: "Categories",
      icon: Grid2X2,
      testId: "bottom-nav-categories",
    },
    {
      href: "/cart",
      label: "Cart",
      icon: ShoppingBag,
      testId: "bottom-nav-cart",
      badge: totalItems > 0 ? totalItems : null,
    },
    {
      href: "/orders",
      label: "Orders",
      icon: Package,
      testId: "bottom-nav-orders",
    },
    {
      href: isAuthenticated ? "/profile" : "/auth/login",
      label: isAuthenticated ? "Account" : "Login",
      icon: User,
      testId: "bottom-nav-account",
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg lg:hidden"
      data-testid="mobile-bottom-nav"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive =
            item.exact ? location === item.href : location.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={item.testId}
              className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 relative"
            >
              <span
                className={cn(
                  "relative flex items-center justify-center w-7 h-7",
                  isActive ? "text-green-600" : "text-gray-500"
                )}
              >
                <item.icon
                  size={22}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                {item.badge != null && (
                  <span className="absolute -top-1.5 -right-1.5 bg-green-600 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 leading-none">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "text-[10px] font-medium leading-none",
                  isActive ? "text-green-600" : "text-gray-500"
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-green-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
