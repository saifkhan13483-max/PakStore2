# PakCart — Google Search Console Production-Readiness Audit

_Date: April 22, 2026 · Domain: https://pakcart.store_

This audit reviews the live store against Google Search Essentials and the GSC onboarding checklist, lists the changes applied in this pass, and the items the operator (you) must complete inside the GSC UI / DNS panel.

---

## 1. Summary Checklist of Changes Made in This Pass

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
- **Structured data**: Organization, WebSite (with SearchAction), OnlineStore, Product (with offers, shipping, return policy, aggregateRating), BreadcrumbList, FAQPage.
- **404 page** is helpful, includes links back to Home / Products / Contact, and is `noindex,follow`.
- **Favicon** present (`/favicon.png`) — used by Google in SERPs.
- **Lazy loading + Cloudinary CDN + font `display=swap` + preconnect** already configured for Core Web Vitals.

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

3. **Submit the sitemap** in GSC: *Indexing → Sitemaps → Add new sitemap → `sitemap.xml`*. The sitemap is also already declared in `robots.txt`.

4. **Request indexing** for the homepage and top 5 category pages via *URL Inspection → Request Indexing* for the first push.

---

## 4. Ongoing GSC Monitoring Plan

| Frequency | Report | What to look for |
|-----------|--------|------------------|
| Weekly | **Performance** | CTR drop > 20% week-over-week, queries falling out of top 10, new opportunity queries on page 2. |
| Weekly | **Page Indexing** | Spike in "Crawled – not indexed", "Discovered – not indexed", or "Duplicate, Google chose different canonical". |
| Weekly | **Core Web Vitals** (Mobile + Desktop) | Any URL group leaving the *Good* bucket — investigate LCP image, INP scripts, CLS image dimensions. |
| Bi-weekly | **Sitemaps** | Confirm "Last read" date is recent and discovered URL count matches Firestore active product count. |
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
