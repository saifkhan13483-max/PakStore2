/**
 * SEO Configuration for route-level indexability strategy
 * Defines which routes should be indexed and their meta properties
 */

export type RouteIndexability = "index" | "noindex";

interface RouteConfig {
  indexable: RouteIndexability;
  description?: string;
  priority?: number;
}

const ROUTE_CONFIG: Record<string, RouteConfig> = {
  // Public indexable pages
  "/": { indexable: "index", description: "Home page", priority: 1.0 },
  "/categories": { indexable: "index", description: "All categories", priority: 0.9 },
  "/collections": { indexable: "index", description: "Collection pages", priority: 0.8 },
  "/products": { indexable: "index", description: "Product listing", priority: 0.9 },
  "/products/:slug": { indexable: "index", description: "Product detail", priority: 0.7 },
  "/new-arrivals": { indexable: "index", description: "New arrivals", priority: 0.8 },
  "/about": { indexable: "index", description: "About page", priority: 0.5 },
  "/contact": { indexable: "index", description: "Contact page", priority: 0.5 },
  "/privacy": { indexable: "index", description: "Privacy policy", priority: 0.3 },
  "/terms": { indexable: "index", description: "Terms of service", priority: 0.3 },

  // Non-indexable pages
  "/cart": { indexable: "noindex", description: "Shopping cart" },
  "/checkout": { indexable: "noindex", description: "Checkout process" },
  "/thank-you": { indexable: "noindex", description: "Order confirmation" },
  "/orders": { indexable: "noindex", description: "User orders" },
  "/orders/:id": { indexable: "noindex", description: "Order details" },
  "/profile": { indexable: "noindex", description: "User profile" },
  "/auth/login": { indexable: "noindex", description: "Login page" },
  "/auth/signup": { indexable: "noindex", description: "Sign up page" },
  "/admin": { indexable: "noindex", description: "Admin dashboard" },
};

/**
 * Get indexability status for a route
 * Supports exact matches and pattern matches (e.g., /collections/:slug)
 */
export function getRouteIndexability(pathname: string): RouteIndexability {
  // Exact match
  if (ROUTE_CONFIG[pathname]) {
    return ROUTE_CONFIG[pathname].indexable;
  }

  // Pattern matching
  for (const [pattern, config] of Object.entries(ROUTE_CONFIG)) {
    if (pattern.includes(":")) {
      const regexPattern = pattern
        .replace(/:[^/]+/g, "[^/]+")
        .replace(/\//g, "\\/");
      const regex = new RegExp(`^${regexPattern}$`);
      if (regex.test(pathname)) {
        return config.indexable;
      }
    }
  }

  // Default to index for unknown routes
  return "index";
}

/**
 * Get robots meta value for a route
 */
export function getRobotsMetaForRoute(pathname: string): string {
  const indexability = getRouteIndexability(pathname);
  return indexability === "noindex" ? "noindex,follow" : "index,follow";
}

/**
 * Check if a route should be included in sitemap
 */
export function shouldIncludeInSitemap(pathname: string): boolean {
  const config = ROUTE_CONFIG[pathname];
  return config ? config.indexable === "index" : true;
}

/**
 * Get all indexable routes (for sitemap generation)
 */
export function getIndexableRoutes(): string[] {
  return Object.entries(ROUTE_CONFIG)
    .filter(([_, config]) => config.indexable === "index" && !config.description?.includes("product"))
    .map(([path]) => path);
}
