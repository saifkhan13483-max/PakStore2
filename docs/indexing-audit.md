# PakCart SEO Indexing Audit — Phase 1

**Date**: March 11, 2026
**Auditor**: Senior Technical SEO / React Engineer
**Site**: https://pakcart.store
**Status**: Phase 1 Audit Complete — Ready for Phase 2 Implementation

---

## Executive Summary

The site has meaningful SEO infrastructure already in place (SEO.tsx, react-helmet-async, structured data, robots.txt, sitemap), but several architectural and implementation gaps are causing the Search Console problems. The **primary root cause** is that this is a pure client-side SPA — all product and category content only appears after JavaScript executes and Firestore returns data (1–3 second delay). Google can render SPAs, but it queues them separately and may not wait long enough for meaningful content, leading to "Crawled — currently not indexed." Multiple secondary issues compound this.

---

## 1. All Public Routes in App.tsx

| Route | Component | Should Index? | Has SEO Component? | robots Tag |
|---|---|---|---|---|
| `/` | Home | YES | YES (SEO) | default index,follow |
| `/categories` | Categories | YES | YES (SEO) | default index,follow |
| `/collections/:slug` | CategoryCollection | YES | YES (SEO) | default index,follow |
| `/products` | Products | YES | YES (SEO) | default index,follow |
| `/products/:slug` | ProductDetail | YES | YES (SEO) | default index,follow |
| `/new-arrivals` | NewArrivals | YES | YES (SEO) | default index,follow |
| `/about` | About | YES | **NO SEO component** | **MISSING** |
| `/contact` | Contact | YES | **Raw Helmet only** (no robots/canonical) | **MISSING** |
| `/privacy` | Privacy | YES | **NO SEO component** | **MISSING** |
| `/terms` | Terms | YES | **NO SEO component** | **MISSING** |
| `/cart` | Cart | NO | YES (SEO) | noindex,follow ✓ |
| `/checkout` | Checkout | NO | YES (SEO) | noindex,follow ✓ |
| `/thank-you` | ThankYou | NO | YES (SEO) | noindex,follow ✓ |
| `/auth/login` | Login | NO | YES (SEO) | noindex,follow ✓ |
| `/auth/signup` | Signup | NO | YES (SEO) | noindex,follow ✓ |
| `/profile` | Profile | NO | YES (SEO) | noindex,follow ✓ |
| `/orders` | MyOrders | NO | **NO SEO component** | **MISSING** |
| `/orders/:id` | OrderDetail | NO | **NO SEO component** | **MISSING** |
| `/admin` | AdminDashboard | NO | **NO SEO component** | **MISSING** |
| `/admin/products` | AdminProducts | NO | **NO SEO component** | **MISSING** |
| `/admin/products/new` | AdminProductForm | NO | **NO SEO component** | **MISSING** |
| `/admin/products/:id/edit` | AdminProductForm | NO | **NO SEO component** | **MISSING** |
| `/admin/categories` | AdminCategories | NO | **NO SEO component** | **MISSING** |
| `/admin/orders` | AdminOrders | NO | **NO SEO component** | **MISSING** |
| `/admin/sitemap` | AdminSitemap | NO | **NO SEO component** | **MISSING** |
| `/admin/homepage-slider` | AdminHomepageSlider | NO | **NO SEO component** | **MISSING** |

---

## 2. Root Causes Found

### ROOT CAUSE 1 — Client-Side Rendering with Delayed Firestore Content (PRIMARY)
**Impact: 60+ pages "Crawled — currently not indexed"**

All product and category pages are pure SPA routes. On first load, the HTML contains only:
- A `<div id="root"></div>` shell
- Script/link tags for JS bundles
- Whatever react-helmet-async injects post-hydration

Meaningful page content (H1, product name, description, price, images) only appears **after**:
1. React JavaScript executes (~200–500ms)
2. Firestore SDK initializes (~100–300ms)
3. Firestore query returns data (~300ms–1s depending on connection)

Google's rendering queue treats SPAs as secondary. When it does render, it may time out or cache a thin version. The `isLoading` skeleton states return no meaningful HTML content for bots.

### ROOT CAUSE 2 — Missing `robots` Meta on Non-Indexable Pages (HIGH)
**Impact: 9 routes accidentally indexable**

The following routes have NO SEO component and therefore inherit the global `index,follow` default:
- `/orders` (MyOrders) — user-private content
- `/orders/:id` (OrderDetail) — user-private content
- All `/admin/*` routes — 8 admin management pages

Additionally, these pages exist with proper `SEO` but have no `url` prop passed, meaning the canonical defaults to `window.location.href` and could pick up session/auth query params.

### ROOT CAUSE 3 — Missing SEO Component on Info Pages (MEDIUM)
**Impact: 4 indexable pages missing canonical, robots, og:tags**

The following pages have NO `<SEO>` component:
- `/about` — Plain JSX, no title, no description, no canonical, no robots meta
- `/terms` — No SEO component at all
- `/privacy` — No SEO component at all
- `/contact` — Uses raw `<Helmet>` with only `<title>` tag, missing canonical, robots, og:tags

These pages are indexable commercial/info pages that Google may have crawled. Without explicit canonicals, duplicate signals can arise.

### ROOT CAUSE 4 — Canonical URL Picks Up Query Parameters (MEDIUM)
**Impact: Duplicate without user-selected canonical / filter parameter duplication**

In `SEO.tsx` line 50:
```ts
url = typeof window !== "undefined" ? window.location.href : "https://pakcart.store"
```

`window.location.href` includes query strings. Pages that do NOT explicitly pass a `url` prop to `<SEO>` will have canonicals like:
- `https://pakcart.store/products?sort=price-asc&category=abc`
- `https://pakcart.store/collections/bags?sort=newest`

Affected pages (no `url` prop passed):
- `Products.tsx` — no `url` prop
- `Categories.tsx` — no `url` prop
- `NewArrivals.tsx` — no `url` prop
- `ProductDetail.tsx` — no `url` prop (critical — each product must have a clean canonical)

`CategoryCollection.tsx` correctly passes `url={'/collections/${category.slug}'}` which gets prefixed correctly by SEO.tsx.

### ROOT CAUSE 5 — Static Sitemap Files Are Outdated (HIGH)
**Impact: Category and product pages not submitted to GSC**

Two static XML files exist:
- `public/sitemap.xml` (165 lines)
- `client/public/sitemap.xml` (135 lines)

Both are **static files** that only contain the 8 static pages (home, products, categories, new-arrivals, about, contact, privacy, terms). They contain **zero** `/collections/:slug` or `/products/:slug` URLs — meaning Google has not been submitted the actual commercial content pages via sitemap.

A proper dynamic sitemap exists at `api/sitemap.ts` (Vercel serverless function) which is rewritten via `vercel.json`:
```json
{ "source": "/sitemap.xml", "destination": "/api/sitemap" }
```

**Critical conflict**: On Vercel, static files in `public/` at the same path as a rewrite **typically take precedence** over the rewrite rule. This means `/sitemap.xml` may be serving the outdated static file instead of the dynamic API. This needs verification and the static files need to be replaced.

### ROOT CAUSE 6 — Inconsistent robots.txt Files (LOW)
**Impact: Googlebot may read wrong file**

Two robots.txt files exist:
- `client/public/robots.txt` — comprehensive version (disallows admin, auth, profile, checkout, cart, orders, query params)
- `public/robots.txt` — minimal version (only disallows /admin and /admin/)

The build output will depend on which file Vite copies to `dist/`. Both reference `https://pakcart.store/sitemap.xml` correctly. The `client/public/robots.txt` is the correct, comprehensive one.

### ROOT CAUSE 7 — Soft-404 Pages Are Not Marked noindex (LOW)
**Impact: 404 errors showing in Search Console**

When a product or category slug doesn't exist:
- `ProductDetail.tsx` renders an inline "Product Not Found" message with no SEO/noindex tag
- `CategoryCollection.tsx` renders an inline "Category Not Found" message with no noindex

These soft-404 pages are indexable and have no canonical. Google may be crawling deleted/renamed product URLs that return these soft-404 states without proper signals.

---

## 3. Duplicate Route Patterns

| Pattern | Assessment |
|---|---|
| `/collections/:slug` vs `/categories/:slug` | No conflict — only `/collections/:slug` exists. No duplicate. |
| Trailing slash vs no trailing slash | No explicit redirect. Handled by hosting. Vercel default is no trailing slash. Low risk currently. |
| Query parameter variants on listing pages | HIGH RISK — `/products`, `/new-arrivals` with filter/sort params generate separate canonical URLs |
| `/products?category=ID` vs `/collections/:slug` | Previously existed in sitemap (removed if static files updated). No in-app duplicate linking found currently. |
| `/admin/:rest*` wildcard fallback | Falls through to AdminDashboard — no SEO concern but confirms admin is covered by AdminRoute |

---

## 4. SEO.tsx Assessment

| Feature | Status | Notes |
|---|---|---|
| `<title>` | ✓ Implemented | `${title} | PakCart` format |
| `<meta name="description">` | ✓ Implemented | Falls back to default |
| `<link rel="canonical">` | ⚠️ Partial | Default uses `window.location.href` — picks up query params |
| `<meta name="robots">` | ✓ Implemented | Default `index,follow`, can be overridden |
| `<meta property="og:url">` | ⚠️ Partial | Same issue — uses absoluteUrl which can include query params |
| Product schema (JSON-LD) | ✓ Implemented | Full Product schema with offers, rating |
| BreadcrumbList schema | ✓ Implemented | Used by CategoryCollection |
| FAQPage schema | ✓ Implemented | Used by ProductDetail and CategoryCollection |
| Organization schema | ✓ Implemented | Used as default when no product/schema |

---

## 5. Sitemap Problems

| Problem | File | Impact |
|---|---|---|
| Static file serves instead of dynamic API | `public/sitemap.xml` | No product/category URLs submitted |
| No `/collections/:slug` URLs | Both static files | Category pages invisible to GSC |
| No `/products/:slug` URLs | Both static files | Product pages invisible to GSC |
| No `lastmod` on static pages | Both static files | GSC can't detect content freshness |
| Duplicate static files (public/ and client/public/) | Both | Only one is served; creates confusion |
| `api/sitemap.ts` requires Firebase Admin env vars | Vercel env | May fail if `VITE_FIREBASE_CLIENT_EMAIL`/`VITE_FIREBASE_PRIVATE_KEY` not set |

---

## 6. robots.txt Assessment

**`client/public/robots.txt`** (comprehensive — should be the active one):
```
User-agent: *
Allow: /
Allow: /assets/
Allow: /*.js
Allow: /*.css

Disallow: /admin
Disallow: /admin/
Disallow: /auth
Disallow: /auth/
Disallow: /profile
Disallow: /profile/
Disallow: /checkout
Disallow: /checkout/
Disallow: /cart
Disallow: /cart/
Disallow: /thank-you
Disallow: /thank-you/
Disallow: /orders
Disallow: /orders/
Disallow: /*?*
Disallow: /*&*

Sitemap: https://pakcart.store/sitemap.xml
```

**Assessment**:
- ✓ References sitemap
- ✓ Blocks admin, auth, user, checkout, cart, orders
- ✓ Blocks query parameter URLs
- ✓ Allows JS/CSS assets
- ⚠️ Missing `Disallow: /thank-you` in `public/robots.txt`
- ⚠️ `public/robots.txt` is the minimal fallback — may conflict with build output

---

## 7. Firestore Public Read Access

| Collection | Anonymous Read? | Assessment |
|---|---|---|
| `products` | `allow read: if true;` | ✓ Public — bots can access if server-side rendering is added |
| `categories` | `allow read: if true;` | ✓ Public |
| `parentCategories` | `allow read: if true;` | ✓ Public |
| `hero_slides` | `allow read: if true;` | ✓ Public |
| `homepage_slides` | `allow read: if true;` | ✓ Public |
| `comments` | `allow read: if true;` | ✓ Public |
| `users` | `allow read: if isAuthenticated();` | ✓ Correctly private |
| `orders` | `allow read: if isAuthenticated() && ...` | ✓ Correctly private |
| `media` | `allow read: if isAuthenticated();` | ✓ Correctly private |

**No Firestore access blocking issue** for public product/category data. The issue is SPA rendering, not Firestore rules.

---

## 8. Internal Link Audit

| Link Pattern | Location | Assessment |
|---|---|---|
| `/products` | Home, ProductDetail Back button | ✓ Canonical |
| `/collections/:slug` | CategoryCard, Home | ✓ Canonical |
| `/categories` | Header/Nav, Breadcrumbs | ✓ Canonical |
| `/products/:slug` | ProductCard, RelatedProducts | ✓ Canonical |
| `<Link href="...">` vs `onClick` redirect | Most links use Link | ✓ Real anchor hrefs used |
| `/products?category=ID` | Not found in current component code | ✓ No issue currently |

Internal links appear to use canonical clean URLs. No redirect or non-canonical internal links found.

---

## 9. Rendering & Indexability Risk Summary

| Page Type | Initial HTML Quality | Bot Experience |
|---|---|---|
| Home | Thin (Skeleton + hero placeholders) | ⚠️ Poor — hero and products only after JS |
| `/products` | Thin (Skeleton grid) | ⚠️ Poor — product list only after JS |
| `/products/:slug` | Thin (Skeleton) | ⚠️ Poor — critical product data only after JS |
| `/collections/:slug` | Thin (Skeleton grid) | ⚠️ Poor — category/products only after JS |
| `/categories` | Thin (Skeleton) | ⚠️ Poor — category list only after JS |
| `/about`, `/contact`, `/privacy`, `/terms` | Static content — renders immediately | ✓ OK — no Firestore fetch needed |
| `/cart`, `/checkout` | Noindex, minimal content | ✓ OK — intentionally excluded |

---

## Phase 2 Implementation Priority Order

### P0 — Critical (Must fix first)
1. **Fix canonical URL default** — Strip query params from `window.location.href` in SEO.tsx; add explicit `url` props to all indexable pages
2. **Fix static sitemap files** — Remove/replace `public/sitemap.xml` and `client/public/sitemap.xml` to force the dynamic `api/sitemap.ts` to serve
3. **Add noindex to missing non-indexable pages** — `/orders`, `/orders/:id`, all `/admin/*` routes
4. **Add SEO component to info pages** — `/about`, `/contact`, `/privacy`, `/terms` (add proper canonical, robots, og:tags)

### P1 — High Impact
5. **Soft-404 noindex** — Add `robots="noindex,follow"` when ProductDetail/CategoryCollection shows not-found state
6. **Verify dynamic sitemap works** — Ensure `api/sitemap.ts` is serving via `/sitemap.xml` and Firebase Admin credentials are set in Vercel
7. **Pre-render strategy** — Implement pre-rendering for `/products/:slug` and `/collections/:slug` pages

### P2 — Medium Impact
8. **Reconcile robots.txt** — Ensure only one comprehensive `robots.txt` is deployed from `client/public/`
9. **ProductDetail url prop** — Pass explicit `url={'/products/${product.slug}'}` to SEO component
10. **Content quality on listing pages** — Add above-the-fold text content to Products, Categories, NewArrivals pages

---

## Files That Need Changes in Phase 2

| File | Change Needed |
|---|---|
| `client/src/components/SEO.tsx` | Fix default url to strip query params using `window.location.pathname` |
| `client/src/pages/ProductDetail.tsx` | Pass explicit `url` prop to SEO |
| `client/src/pages/Products.tsx` | Pass explicit `url` prop to SEO |
| `client/src/pages/Categories.tsx` | Pass explicit `url` prop to SEO |
| `client/src/pages/NewArrivals.tsx` | Pass explicit `url` prop to SEO |
| `client/src/pages/About.tsx` | Add SEO component with proper props |
| `client/src/pages/Contact.tsx` | Replace raw Helmet with SEO component |
| `client/src/pages/Privacy.tsx` | Add SEO component with proper props |
| `client/src/pages/Terms.tsx` | Add SEO component with proper props |
| `client/src/pages/MyOrders.tsx` | Add SEO with `robots="noindex,follow"` |
| `client/src/pages/OrderDetail.tsx` | Add SEO with `robots="noindex,follow"` |
| `client/src/pages/admin/*.tsx` | Add SEO with `robots="noindex,follow"` to all admin pages |
| `public/sitemap.xml` | Remove or update to force dynamic API to serve |
| `client/public/sitemap.xml` | Remove or update to force dynamic API to serve |
| `public/robots.txt` | Replace with comprehensive version from client/public/ |
| `api/sitemap.ts` | Verify Firebase Admin credentials; fix `active` filter if categories don't have this field |

---

## Verification Checklist (Post-Phase 2)

- [ ] `SEO.tsx` canonical never includes query params
- [ ] All indexable pages have explicit canonical URL props
- [ ] All non-indexable pages have `robots="noindex,follow"`
- [ ] `/sitemap.xml` returns dynamic XML with product + category URLs
- [ ] Sitemap has zero noindex/redirect/404 URLs
- [ ] `robots.txt` references sitemap and blocks all private routes
- [ ] About, Contact, Privacy, Terms have SEO components
- [ ] Product not-found state is noindex
- [ ] Category not-found state is noindex
- [ ] Pre-render or SSR implemented for `/products/:slug` and `/collections/:slug`

---

**Phase 1 audit complete. Proceed to Phase 2 implementation.**
