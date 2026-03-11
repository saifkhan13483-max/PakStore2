/**
 * SEO Configuration for route-level indexability strategy
 * Defines which routes should be indexed and their meta properties
 * Used for robots meta tags, sitemap generation, and SEO decisions
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
  "/collections/:slug": { indexable: "index", description: "Category collection", priority: 0.8 },
  "/new-arrivals": { indexable: "index", description: "New arrivals", priority: 0.8 },
  "/about": { indexable: "index", description: "About page", priority: 0.5 },
  "/contact": { indexable: "index", description: "Contact page", priority: 0.5 },
  "/privacy": { indexable: "index", description: "Privacy policy", priority: 0.3 },
  "/terms": { indexable: "index", description: "Terms of service", priority: 0.3 },

  // Non-indexable pages (user-specific, utility, or sensitive)
  "/cart": { indexable: "noindex", description: "Shopping cart - user specific" },
  "/checkout": { indexable: "noindex", description: "Checkout process - user specific" },
  "/thank-you": { indexable: "noindex", description: "Order confirmation - user specific" },
  "/orders": { indexable: "noindex", description: "User orders - authentication required" },
  "/orders/:id": { indexable: "noindex", description: "Order details - authentication required" },
  "/profile": { indexable: "noindex", description: "User profile - authentication required" },
  "/auth/login": { indexable: "noindex", description: "Login page - utility" },
  "/auth/signup": { indexable: "noindex", description: "Sign up page - utility" },
  "/admin": { indexable: "noindex", description: "Admin dashboard - restricted" },
  "/admin/*": { indexable: "noindex", description: "Admin section - restricted" },
};

/**
 * Get indexability status for a route
 * Supports exact matches and pattern matches (e.g., /collections/:slug)
 */
export function getRouteIndexability(pathname: string): RouteIndexability {
  // Exact match first
  if (ROUTE_CONFIG[pathname]) {
    return ROUTE_CONFIG[pathname].indexable;
  }

  // Pattern matching with dynamic segments
  for (const [pattern, config] of Object.entries(ROUTE_CONFIG)) {
    if (pattern.includes(":") || pattern.includes("*")) {
      const regexPattern = pattern
        .replace(/\*/g, ".*")
        .replace(/:[^/]+/g, "[^/]+")
        .replace(/\//g, "\\/");
      const regex = new RegExp(`^${regexPattern}$`);
      if (regex.test(pathname)) {
        return config.indexable;
      }
    }
  }

  // Default to noindex for unknown routes (safe default)
  return "noindex";
}

/**
 * Get robots meta value for a route
 * @param pathname - The current route pathname
 * @returns robots meta value (e.g., "index,follow" or "noindex,follow")
 */
export function getRobotsMetaForRoute(pathname: string): string {
  const indexability = getRouteIndexability(pathname);
  return indexability === "noindex" ? "noindex,follow" : "index,follow";
}

/**
 * Check if a route should be included in sitemap
 * @param pathname - The route pathname
 * @returns true if route should be in sitemap
 */
export function shouldIncludeInSitemap(pathname: string): boolean {
  const indexability = getRouteIndexability(pathname);
  // Only include indexable routes in sitemap
  return indexability === "index";
}

/**
 * Get all indexable static routes (for sitemap generation)
 * Excludes dynamic/parameterized routes
 */
export function getStaticIndexableRoutes(): string[] {
  return Object.entries(ROUTE_CONFIG)
    .filter(([path, config]) => 
      config.indexable === "index" && 
      !path.includes(":") && 
      !path.includes("*")
    )
    .map(([path]) => path);
}

/**
 * Strip query parameters from URL for canonical URL
 * @param url - Full URL with potential query params
 * @returns Clean URL without query parameters
 */
export function getCanonicalUrl(url: string): string {
  if (!url) return "https://pakcart.store";
  
  try {
    const urlObj = new URL(url);
    // Remove search params for canonical
    return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
  } catch {
    // Fallback for relative URLs
    const withoutQuery = url.split("?")[0];
    if (withoutQuery.startsWith("http")) {
      return withoutQuery;
    }
    return `https://pakcart.store${withoutQuery.startsWith("/") ? withoutQuery : "/" + withoutQuery}`;
  }
}
