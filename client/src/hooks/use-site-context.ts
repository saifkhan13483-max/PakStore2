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
      "\n=== COMPLETE PAGE DIRECTORY (every public page on pakcart.store — what each does, who it's for, and when to send a user there) ===\n" +
        "\n" +
        "── SHOPPING & BROWSING ──\n" +
        "• / (Home page)\n" +
        "    What it does: Landing page with the hero slider/banner, scrolling announcement bar, category quick-grid, featured 'Best Seller' products, new-arrival highlights and curated collections.\n" +
        "    Send the user here when: they say 'home', 'main page', 'kuch dikhao', or are new to the site and want a quick overview.\n" +
        "\n" +
        "• /products (Full catalog)\n" +
        "    What it does: The complete product listing across every category. Has live search, category filter, price filter, sort by Featured / Price / Newest, and pagination/infinite scroll.\n" +
        "    Send the user here when: they want to 'browse everything', search by keyword, or you don't have an exact product to link to. Also use this when stock/price needs to be confirmed in real time.\n" +
        "\n" +
        "• /products/<slug> (Single product detail)\n" +
        "    What it does: Big photo gallery, full description, price, In Stock / Out of Stock badge, variant selector (size / color when applicable), quantity picker, Add to Cart button, customer reviews section.\n" +
        "    Send the user here when: you've identified the exact product they want — give them the direct slug link from the live snapshot below.\n" +
        "\n" +
        "• /categories (All categories)\n" +
        "    What it does: A clean visual grid of every parent category and sub-category in the store. Each tile links into /collections/<slug>.\n" +
        "    Send the user here when: they're not sure what they want and need to browse by category.\n" +
        "\n" +
        "• /collections/<slug> (Single category)\n" +
        "    What it does: All products inside one category (e.g. /collections/bags-wallets, /collections/jewelry). Same filters and sorting as /products but scoped to that category. Has SEO-friendly category breadcrumbs.\n" +
        "    Send the user here when: they ask for a specific category — bags, jewelry, shoes, slippers, stitched dresses, watches, tech gadgets, etc. Always use the exact slug from the categories list below.\n" +
        "\n" +
        "• /new-arrivals (Latest stock)\n" +
        "    What it does: All recently added products, sorted newest-first, with sort options.\n" +
        "    Send the user here when: they ask 'what's new', 'naya kya aaya', 'fresh stock', or want to see the latest additions before everyone else.\n" +
        "\n" +
        "── CART & CHECKOUT FLOW ──\n" +
        "• /cart (Shopping cart)\n" +
        "    What it does: Lists every item the user added — image, name, qty +/− buttons, remove (X), per-item subtotal and grand total. Shows stock-limit warnings if they exceed available qty. Has 'Proceed to Checkout' button.\n" +
        "    Send the user here when: they ask 'meri cart dikhao', 'kya kya add kiya hai', or want to update quantities before ordering.\n" +
        "\n" +
        "• /checkout (Place order — LOGIN REQUIRED)\n" +
        "    What it does: Multi-step checkout — shipping form (full name, email, phone, full address, city dropdown covering every Pakistani city, area), order summary on the side, then 'Continue to Payment' → 'Complete Order'. Cash on Delivery is supported across Pakistan.\n" +
        "    Send the user here when: they're ready to buy and have items in the cart. If they aren't logged in, tell them they'll be asked to log in first.\n" +
        "\n" +
        "• /thank-you (Order confirmation)\n" +
        "    What it does: Shown automatically after a successful checkout — confirms the order ID and next steps. Not something the user navigates to manually; only mention it if they ask 'mera order place ho gaya kya'.\n" +
        "\n" +
        "── ACCOUNT & ORDERS ──\n" +
        "• /auth/login (Login)\n" +
        "    What it does: Sign in with Google (one-tap) OR email + password. Required before checkout, viewing orders, profile, or dropshipper dashboard.\n" +
        "• /auth/signup (Create account)\n" +
        "    What it does: New account via Google or email/password. Once created, they stay signed in.\n" +
        "• /profile (User profile — LOGIN REQUIRED)\n" +
        "    What it does: Saved name, email, phone and default delivery addresses for faster checkout next time.\n" +
        "• /orders (My Orders — LOGIN REQUIRED)\n" +
        "    What it does: Full list of every order the user has placed — date, order total, item count, current status (Pending / Confirmed / Shipped / Delivered / Cancelled). Click any row → /orders/<id>.\n" +
        "    Send the user here when: they ask 'mera order kahan hai', 'tracking', 'delivery kab tak aaye gi', 'kya status hai'.\n" +
        "• /orders/<id> (Single order detail — LOGIN REQUIRED)\n" +
        "    What it does: Detail of one specific order — every item with photo & qty, full shipping address, status timeline, total breakdown.\n" +
        "    Send the user here only if they share an order ID, otherwise just send them to /orders.\n" +
        "\n" +
        "── INFORMATION PAGES ──\n" +
        "• /about (About PakCart)\n" +
        "    What it does: Tells the PakCart story — Pakistan's premier destination for authentic artisanal goods, founded 2024, mission to connect local artisans/brands with shoppers nationwide. Highlights nationwide delivery and authentic-quality guarantee. Owner: Saif Khan.\n" +
        "• /contact (Contact us)\n" +
        "    What it does: Contact form + direct contact info — Email contact@pakcart.store, WhatsApp/SMS 0318-8055850 (Mon–Fri 9am–6pm PKT, message only — not call).\n" +
        "    Send the user here when: they want to email/WhatsApp support, raise an issue, or send a custom inquiry.\n" +
        "• /privacy (Privacy policy)\n" +
        "    What it does: Explains what personal data is collected (identity, contact, financial, technical), how it's used, security measures, and the privacy contact (privacy@pakcart.store). Last updated Feb 7, 2026.\n" +
        "• /terms (Terms & Conditions)\n" +
        "    What it does: Terms of use, license, disclaimer, shipping & returns policy (nationwide delivery 3–5 business days, 7-day return window for unused items in original packaging — perishables non-returnable unless damaged in transit), governing law (Pakistan). Last updated Feb 7, 2026.\n" +
        "    Send the user here when: they ask about return policy, refund window, delivery time, or legal terms.\n" +
        "\n" +
        "── DROPSHIPPER / PARTNER PROGRAM ──\n" +
        "• /dropshipper (Become a dropshipper)\n" +
        "    What it does: Landing page explaining the dropshipper program — list PakCart products on your own Daraz / Facebook page / Instagram / website, earn on every sale, no inventory needed. Has signup/application form. Shows count of active dropshippers.\n" +
        "    Send the user here when: they ask about reselling, becoming a partner, earning from PakCart, or 'mein bhi yeh products bechna chahta hoon'.\n" +
        "• /dropshipper/dashboard (Dropshipper dashboard — LOGIN REQUIRED for approved dropshippers)\n" +
        "    What it does: Approved dropshippers' control panel — browse the full catalog with their pricing, see earnings, download product images/details for their own listings.\n" +
        "\n" +
        "── KEY CONTACT / SUPPORT INFO (use this when a user needs human help) ──\n" +
        "• Owner: Saif Khan — WhatsApp / SMS: 03188055850 (message only, no calls)\n" +
        "• Customer support email: contact@pakcart.store\n" +
        "• Support hours: Mon–Fri, 9am–6pm PKT\n" +
        "• Privacy queries: privacy@pakcart.store\n" +
        "• Build-your-own-store inquiries: saifkhan@pakcart.store\n" +
        "\n" +
        "── PAYMENT, DELIVERY & RETURN POLICY (verified facts — safe to quote) ──\n" +
        "• Payment: Cash on Delivery (COD) available across Pakistan.\n" +
        "• Delivery area: Nationwide — every city in Pakistan (full city dropdown at checkout).\n" +
        "• Standard delivery time: 3–5 business days.\n" +
        "• Returns: 7 days from delivery, unused items in original packaging. Perishables not eligible unless damaged in transit.\n" +
        "• Live order tracking: /orders (must be logged in).\n" +
        "\n" +
        "── RULES FOR SHARING LINKS ──\n" +
        "• Always send users to a real page listed above. NEVER invent a path that isn't listed.\n" +
        "• Use relative paths like /products, /collections/<slug>, /orders, /contact in your replies — the chat will auto-link them.\n" +
        "• For specific products or categories, use the exact slugs from the live snapshot below.\n" +
        "• If a user needs login first (checkout, orders, profile, dropshipper dashboard), mention it briefly so they aren't surprised by the login screen."
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
