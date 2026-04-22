import { useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useCategories } from "./use-categories";
import { useCartStore } from "@/store/cartStore";
import { productFirestoreService } from "@/services/productFirestoreService";
import type { Product } from "@shared/schema";

const MAX_PRODUCTS_IN_CONTEXT = 60;
const MAX_SUBCATEGORIES_IN_CONTEXT = 50;
const DESCRIPTION_TRUNCATE = 240;

export function useSiteContext() {
  const [location] = useLocation();
  const { categories, parentCategories } = useCategories();
  const cartItems = useCartStore((s) => s.items);

  const { data: catalog } = useQuery<Product[]>({
    queryKey: ["pakbot-catalog-snapshot"],
    queryFn: () => productFirestoreService.getAllProducts({ limit: 80 }),
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const productSlugMatch = location.match(/^\/products\/([^/?#]+)/);
  const currentSlug = productSlugMatch?.[1];

  const { data: currentProduct } = useQuery<Product | null>({
    queryKey: ["pakbot-current-product", currentSlug ?? null],
    queryFn: async () => {
      if (!currentSlug) return null;
      const cached = catalog?.find((p) => p.slug === currentSlug);
      if (cached) return cached;
      try {
        return await productFirestoreService.getProductBySlug(currentSlug);
      } catch {
        return null;
      }
    },
    enabled: !!currentSlug,
    staleTime: 1000 * 60 * 5,
  });

  return useMemo(() => {
    const lines: string[] = [];
    lines.push("=== LIVE PAKCART SITE CONTEXT (real-time data — trust this over any earlier guess) ===");
    lines.push(`Today: ${new Date().toISOString().slice(0, 10)}`);
    lines.push(`Site domain: https://pakcart.store`);
    lines.push(`User is currently on page: ${location}`);

    lines.push(
      "\n=== COMPLETE PAGE DIRECTORY (every public page on pakcart.store) ===\n" +
        "Shopping & browsing:\n" +
        "  - / → Home page (featured products, hero banner, new arrivals, announcements)\n" +
        "  - /products → Full product catalog with search, filters, sorting (use this for 'show me everything' or category-less browsing)\n" +
        "  - /products/<slug> → Individual product detail page (photos, description, price, add to cart, reviews)\n" +
        "  - /categories → All categories overview page (visual grid of every category)\n" +
        "  - /collections/<slug> → Products inside one specific category or parent category\n" +
        "  - /new-arrivals → Latest products added to the store\n" +
        "\n" +
        "Cart & checkout flow:\n" +
        "  - /cart → User's shopping cart (review items, update qty, remove, proceed)\n" +
        "  - /checkout → Place the order (login required — fills shipping info & confirms)\n" +
        "  - /thank-you → Order confirmation page after successful checkout\n" +
        "\n" +
        "Account & orders:\n" +
        "  - /auth/login → Login page (Google sign-in or email/password)\n" +
        "  - /auth/signup → Create new account\n" +
        "  - /profile → User profile (saved info, addresses) — login required\n" +
        "  - /orders → 'My Orders' page — list of all past & current orders, live status — login required\n" +
        "  - /orders/<id> → Detail page for a single order with tracking info — login required\n" +
        "\n" +
        "Information pages:\n" +
        "  - /about → About PakCart (story, owner Saif Khan, mission)\n" +
        "  - /contact → Contact form & owner contact info\n" +
        "  - /privacy → Privacy policy\n" +
        "  - /terms → Terms & conditions\n" +
        "\n" +
        "Dropshipper / partner program:\n" +
        "  - /dropshipper → Become a dropshipper landing page (info + signup)\n" +
        "  - /dropshipper/dashboard → Dropshipper's own dashboard (catalog, earnings) — login required\n" +
        "\n" +
        "Rules for sharing links:\n" +
        "  - Always send users to a real page above. Never invent a path that isn't listed.\n" +
        "  - Use relative paths like /products or /orders in your replies — the chat will auto-link them.\n" +
        "  - For specific products or categories use the slugs from the live snapshot below."
    );

    if (cartItems.length > 0) {
      const total = (cartItems as any[]).reduce(
        (s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 0),
        0
      );
      lines.push(`\nUser's cart (${cartItems.length} item${cartItems.length > 1 ? "s" : ""}, total Rs${total}):`);
      (cartItems as any[]).slice(0, 10).forEach((i) => {
        lines.push(`  - ${i.name} x${i.quantity} @ Rs${i.price}${i.slug ? ` (/products/${i.slug})` : ""}`);
      });
    } else {
      lines.push("\nUser's cart: empty");
    }

    if (parentCategories.length > 0) {
      lines.push("\nMain categories:");
      parentCategories.forEach((p: any) => {
        lines.push(`  - ${p.name} → /collections/${p.slug}`);
      });
    }
    if (categories.length > 0) {
      lines.push("\nSub-categories:");
      categories.slice(0, MAX_SUBCATEGORIES_IN_CONTEXT).forEach((c: any) => {
        lines.push(`  - ${c.name} → /collections/${c.slug}`);
      });
    }

    if (catalog && catalog.length > 0) {
      lines.push(`\nLive product snapshot (${Math.min(catalog.length, MAX_PRODUCTS_IN_CONTEXT)} of ${catalog.length} fetched):`);
      catalog.slice(0, MAX_PRODUCTS_IN_CONTEXT).forEach((p) => {
        const stock = p.inStock ? "in stock" : "OUT OF STOCK";
        lines.push(`  - ${p.name} | Rs${p.price} | ${stock} | /products/${p.slug}`);
      });
    }

    if (currentProduct) {
      const p = currentProduct;
      lines.push(`\nUser is right now looking at this product:`);
      lines.push(`  Name: ${p.name}`);
      lines.push(`  Price: Rs${p.price}`);
      lines.push(`  Stock: ${p.inStock ? "in stock" : "out of stock"}`);
      lines.push(`  Link: /products/${p.slug}`);
      if (p.description) {
        const desc = String(p.description).replace(/\s+/g, " ").trim().slice(0, DESCRIPTION_TRUNCATE);
        lines.push(`  Description: ${desc}${p.description.length > DESCRIPTION_TRUNCATE ? "…" : ""}`);
      }
      if ((p as any).labels?.length) {
        lines.push(`  Labels: ${(p as any).labels.slice(0, 6).join(", ")}`);
      }
    }

    lines.push(
      "\n=== HOW TO USE THIS CONTEXT ===\n" +
        "- For price/stock/availability/links: USE this snapshot. Never invent numbers.\n" +
        "- If a product the user asks about is NOT in the snapshot, say so honestly and send them to /products to browse the full catalog.\n" +
        "- If the user is on a product page, assume they're asking about THAT product unless they say otherwise.\n" +
        "- If the user has items in their cart, you can reference them naturally (e.g. 'aap ke cart mein already X hai').\n" +
        "- Always link to the exact /products/<slug> or /collections/<slug> path — these are live URLs on pakcart.store."
    );

    return lines.join("\n");
  }, [location, categories, parentCategories, cartItems, catalog, currentProduct]);
}
