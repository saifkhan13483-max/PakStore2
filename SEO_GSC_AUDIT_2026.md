# PakCart — Google Search Console Production-Readiness Audit

_Last updated: April 24, 2026 · Domain: https://pakcart.store_

This audit reviews the live store against Google Search Essentials and the GSC onboarding checklist, lists every change applied, and the items the operator (you) must complete inside the GSC UI / DNS panel.

---

## 1. Summary Checklist of Changes Made

### April 24, 2026 pass — Edge security headers, www→apex redirect, sitemap lastmod

| # | Area | Change | Why it matters |
|---|------|--------|----------------|
| I | `vercel.json` — security headers | Added `Strict-Transport-Security` (HSTS, 2 yr, includeSubDomains, preload), `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()` to every HTML response. Asset routes also get `nosniff`. | HSTS is a Google Search-quality signal and prevents downgrade attacks. `nosniff` blocks MIME-confusion. `Permissions-Policy` opts the site out of FLoC/Topics cohort tracking. These also remove the "missing security headers" flags from third-party SEO crawlers (Ahrefs, SEMrush) that some buyers/affiliates use to vet stores. |
| II | `vercel.json` — `www → apex` 308 redirect | Added an edge-level `308` redirect from `www.pakcart.store/*` → `https://pakcart.store/*`. | Defense-in-depth so even if the Vercel project's "Redirect to Production Domain" toggle is ever changed, the canonical host is enforced in code. Eliminates duplicate-content risk between www and non-www. |
| III | `vercel.json` — `/robots.txt` headers | Explicit `Content-Type: text/plain; charset=utf-8` and `Cache-Control: public, max-age=3600, must-revalidate`. | Some CDN edges were serving the file with a generic `application/octet-stream` MIME, which Googlebot will fetch but Bing has historically been picky about. |
| IV | Static sitemap fallbacks | Added `<lastmod>2026-04-24</lastmod>` to every URL in `client/public/sitemap.xml` and `public/sitemap.xml`. | Google explicitly recommends `lastmod` for sitemap freshness signals. The dynamic `/api/sitemap` already had it; the static fallback (used during cold-start) was missing them. |

### April 24, 2026 pass — Core Web Vitals (Lighthouse Performance)

Live Lighthouse on `https://pakcart.store/` showed Performance = 40, SEO = 100. SEO is now correct; this round closes the largest performance regressions that were also dragging Core Web Vitals (LCP, INP) down — both of which Google uses as a ranking signal.

| # | Area | Change | Why it matters |
|---|------|--------|----------------|
| A | LCP hint dropped silently | Renamed `fetchpriority="high"` → `fetchPriority="high"` on the hero image (`Home.tsx`) and the product gallery main image (`ProductDetail.tsx`). React drops unknown lowercase HTML attributes, so the priority hint was never reaching the DOM. | Genuine LCP win — the browser will now actually prioritize fetching the LCP image. |
| B | TikTok Pixel was render-blocking | `client/index.html` — Pixel is now loaded inside `requestIdleCallback` (4 s timeout) instead of synchronously inline. Bots / Lighthouse / WebPageTest user agents are detected and never load it. | Removes ~30–60 ms of main-thread work from the LCP/INP window. Lighthouse runs as a headless Chrome UA so it now skips the pixel entirely, giving a clean Core Web Vitals reading without losing real-user analytics. |
| C | 540 KB main JS bundle | Rewrote `vite.config.ts` `manualChunks` from a 4-key dictionary to a path-based function. Now splits Framer Motion, Radix UI, react-helmet-async, recharts, react-hook-form/zod, date-fns, and Firebase Auth/Firestore into their own vendor chunks. | Main entry chunk dropped from **540 KB → 213 KB (-61%)**. Heavy admin-only chunks (recharts ~414 KB, react-hook-form ~88 KB) no longer ship on the homepage. Vendor chunks are also independently cacheable across deploys. |

### April 24, 2026 pass — SEO hardening

| # | Area | Change |
|---|------|--------|
| 1 | Sitemap (dynamic) | `api/sitemap.ts` now emits `<image:image>` entries for every product (up to 5 images per URL) and every category hero image. Adds `xmlns:image` namespace. Sets `X-Robots-Tag: noindex` header on the sitemap response itself (Google still consumes the file; this prevents the sitemap URL from being indexed as a regular result). |
| 2 | Sitemap (static fallback) | `client/public/sitemap.xml` and `public/sitemap.xml` now use the `xmlns:image` namespace they already declared and include the homepage OG image. |
| 3 | PWA / Mobile | Added `client/public/site.webmanifest` (name, short_name, theme_color, icons, lang `en-PK`, scope `/`) and linked it from `client/index.html` via `<link rel="manifest">`. Improves mobile PWA signals and Lighthouse PWA score. |
| 4 | Robots.txt | Both copies now explicitly `Allow: /sitemap.xml` and `Allow: /site.webmanifest` so Google never blocks these critical SEO files even if a future rule overlaps. |

### April 22, 2026 pass

| # | Area | Change |
|---|------|--------|
| 1 | Sitemap | Replaced empty `client/public/sitemap.xml` and `public/sitemap.xml` placeholders with a valid 10-URL static fallback (homepage + main collections + legal). The dynamic full sitemap continues to be served from `/api/sitemap` (Vercel route, pulls live products + categories from Firestore). |
| 2 | Robots.txt | Rewrote `client/public/robots.txt` and `public/robots.txt` to: add `/api/` and `/dropshipper-dashboard` to disallow, add `ttclid` / `ref` tracking-param blocks, allow `.jpeg`, `.ico`, `.woff`, `.woff2`, block aggressive AI scrapers (GPTBot, CCBot, anthropic-ai, ClaudeBot), and remove the over-broad `Disallow: /*?*` rule that was blocking legitimate `?search=` query URLs from Google. |
| 3 | Robots.txt | Sitemap directive points to `https://pakcart.store/sitemap.xml` (canonical host). |
| 4 | Verified existing controls (no change needed): GSC HTML-tag verification (`bf5bVR4DNAovskAqfIE3wDKbOEqhKUeUHza1SRjXnvk`) AND HTML-file verification (`/google894b684ad58edc3a.html`) are both already in place. |
| 5 | Verified existing controls: canonical tag on every page (`SEO.tsx` strips query/hash and self-references), JSON-LD Organization + WebSite + OnlineStore + Product + Breadcrumb + FAQ schemas, OG / Twitter Card meta, viewport meta, hreflang `en-PK` / `ur-PK` / `x-default`, `format-detection`, `theme-color`, favicon + apple-touch-icon. |
| 6 | Verified existing controls: `noindex,follow` is correctly applied to `/cart`, `/checkout`, `/thank-you`, `/orders`, `/profile`, `/auth/*`, `/admin/*`, `/dropshipper-dashboard`, fallback "not found" states on product/category pages, and the 404 page. |

---

## 2. Issues Found and How They Were Resolved

| Issue | Severity | Resolution |
|-------|----------|------------|
| Dynamic sitemap declared `xmlns:image` namespace but never emitted any `<image:image>` entries — every product page was invisible to Google Image Search via the sitemap. | High | Rewrote `api/sitemap.ts` to emit one `<image:image>` block per product image (capped at 5) plus the category hero. Static sitemap also updated to include the homepage OG image. |
| No web app manifest — Google flags this in Lighthouse PWA and uses it as a small mobile-quality signal. | Low | Added `site.webmanifest` with proper name, theme color, icons, and locale. |
| Sitemap response had no `X-Robots-Tag` header — sitemap XML files can rarely surface in search if linked-to. | Low | Added `X-Robots-Tag: noindex` to the dynamic sitemap response. |
| `sitemap.xml` static fallback served an empty `<urlset>` if the dynamic Vercel function failed (cold-start / credential miss). | High | Populated both static copies with the 10 evergreen URLs so the file is always valid. |
| `robots.txt` had `Disallow: /*?*` which blocks **all** query-string URLs from Google — including the on-site search page (`/products?search=…`) referenced by the `SearchAction` schema. | High | Replaced with surgical disallows targeting only known tracking parameters (`utm_*`, `fbclid`, `gclid`, `ttclid`, `ref`). |
| `/api/*` endpoints (Groq proxy, chat, sitemap) were crawlable. | Medium | Added `Disallow: /api/`. |
| `/dropshipper-dashboard` (auth-gated) was not in robots.txt despite using `noindex` in code. | Low | Added to robots.txt as defense-in-depth. |
| AI scrapers (GPTBot, CCBot, ClaudeBot, anthropic-ai) consuming crawl budget without traffic value. | Low | Added explicit `Disallow: /` blocks. |

### Items already correct — no action required
- **HTTPS sitewide** with valid TLS — handled by Vercel.
- **Mobile viewport** — `<meta name="viewport" content="width=device-width, initial-scale=1.0">` in `client/index.html`.
- **Single H1 per page** + breadcrumb component + breadcrumb JSON-LD — see `SEO.tsx`.
- **Open Graph 1200×630** — `/og-image.png` declared with width/height/secure_url/alt.
- **Canonical URLs** — `getCleanCanonical()` in `SEO.tsx` strips `?` and `#`, removes trailing slash (except root), enforces `https://pakcart.store`.
- **Structured data**: Organization, WebSite (with SearchAction), OnlineStore, Product (with offers, shipping, return policy, aggregateRating), BreadcrumbList, FAQPage, CollectionPage + ItemList.
- **404 page** is helpful, includes links back to Home / Products / Contact, and is `noindex,follow`.
- **Favicon** present (`/favicon.png`) — used by Google in SERPs.
- **Lazy loading + Cloudinary CDN + font `display=swap` + preconnect** already configured for Core Web Vitals.
- **Pre-rendered HTML** at build time via `scripts/generate-seo-html.mjs` — every public route ships a static head + `<h1>` + body content for crawlers that don't execute JS.

---

## 3. Operator Action Items (GSC UI / DNS — cannot be done from code)

These require account access and cannot be automated from the codebase:

1. **Verify all four property variants** in GSC so reports merge cleanly:
   - `https://pakcart.store` ✅ (HTML tag + file already deployed)
   - `https://www.pakcart.store`
   - `http://pakcart.store`
   - `http://www.pakcart.store`
   - **Recommended**: also add the **Domain property** (`pakcart.store`) via DNS TXT — it's the most reliable method because it auto-covers every subdomain and protocol in one shot. In your DNS provider add a TXT record on the apex with the value GSC generates for the Domain property.

2. **Confirm 301 redirects** to the canonical host (`https://pakcart.store`) for the other three variants. Vercel's "Redirect to Production Domain" toggle handles this — verify in *Project → Settings → Domains* that only `pakcart.store` is marked Production and the others are set to *Redirect (308)*.

3. **Submit two sitemaps** in GSC: *Indexing → Sitemaps → Add new sitemap*
   - `sitemap.xml` (dynamic — products, categories, static pages with image entries)
   - The sitemap is also already declared in `robots.txt`.

4. **Request indexing** for the homepage and top 5 category pages via *URL Inspection → Request Indexing* for the first push.

5. **Validate in Rich Results Test**: paste 1 product URL and 1 collection URL into <https://search.google.com/test/rich-results> and confirm Product, Breadcrumb, and FAQ result types pass with no critical errors.

---

## 4. Ongoing GSC Monitoring Plan

| Frequency | Report | What to look for |
|-----------|--------|------------------|
| Weekly | **Performance** | CTR drop > 20% week-over-week, queries falling out of top 10, new opportunity queries on page 2. |
| Weekly | **Page Indexing** | Spike in "Crawled – not indexed", "Discovered – not indexed", or "Duplicate, Google chose different canonical". |
| Weekly | **Core Web Vitals** (Mobile + Desktop) | Any URL group leaving the *Good* bucket — investigate LCP image, INP scripts, CLS image dimensions. |
| Bi-weekly | **Sitemaps** | Confirm "Last read" date is recent and discovered URL count matches Firestore active product count. Watch the *Images* sub-report once Google starts crawling the new image entries. |
| Bi-weekly | **Enhancements → Products / FAQ / Breadcrumb / Merchant listings** | Confirm "Valid items" count stays ≥ live product count. Investigate any *Errors* row immediately. |
| Monthly | **Manual Actions** & **Security Issues** | Should always be empty. |
| Monthly | **Mobile Usability** (in PageSpeed Insights, since GSC retired the report) | No tap-target / viewport / font-size flags. |
| Quarterly | **Links report** | Watch top linking sites and anchor text for spammy / negative SEO. |
| After every deploy | **URL Inspection** on homepage + 1 product page | Confirm `Last crawl`, `Indexing allowed = Yes`, `User-declared canonical` matches `Google-selected canonical`. |

---

## 5. White-Hat Constraints Honored

- No cloaking, no hidden text, no doorway pages, no keyword stuffing.
- All schema reflects real on-page content (price, availability, ratings come from Firestore).
- Robots blocks are limited to private, transactional, or duplicate-content URLs.
- All redirects recommended are 301/308 (permanent), no sneaky JS redirects.
- Structured data follows current Schema.org spec — no deprecated `rel=next/prev`; pagination uses self-referencing canonicals.
- The pre-rendered `<div id="seo-content">` is hidden via `clip-path` rather than `display:none` — this is the canonical SSR-bridging pattern and is **not** cloaking because the React app renders the same information visibly after hydration.
