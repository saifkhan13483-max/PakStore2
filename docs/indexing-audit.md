# PakCart SEO Indexing Audit — Phase 1

**Date**: March 11, 2026  
**Status**: Phase 1 Audit Complete — Ready for Phase 2 Implementation  

## Executive Summary

Primary root cause of poor indexability: **Client-side rendering with delayed Firestore data fetch**. Product/category pages have proper SEO tags but minimal initial HTML content. Google crawls the page but marks it "crawled - currently not indexed" due to content appearing only after JS execution and Firestore fetch (1-3 second delay).

Secondary issues:
- Missing robots meta on auth/user pages (Login, Signup, Profile, MyOrders, OrderDetail)
- Sitemap contains `/products?category=ID` duplicates (6 URLs)
- Sitemap missing `/collections/:slug` category pages
- Canonical URLs may include query parameters

## Root Causes Found

### 1. **Client-Side Rendering with Delayed Content** (PRIMARY - 60 pages affected)
- Initial HTML: Title, meta, canonical, robots meta only
- Meaningful content (H1, descriptions, images): Appears AFTER JS+Firestore fetch (1-3s delay)
- Result: Google sees "thin" initial HTML → "Crawled - currently not indexed"
- Products/categories have proper SEO metadata but visibility delay causes indexation failure

### 2. **Missing Robots Meta on Protected Routes** (5 pages)
- `/auth/login`, `/auth/signup`, `/profile`, `/orders`, `/orders/:id`
- Default to `index,follow` instead of explicit `noindex,follow`
- Should be corrected for clarity and safety

### 3. **Sitemap with Query Parameter Duplicates**
- Lines 52-86: `/products?category=ID` URLs (6 total)
- Creates duplicate content signals alongside `/collections/:slug` pages
- Missing `/collections/:slug` URLs entirely from sitemap

### 4. **Canonical URL Handling**
- SEO.tsx uses `window.location.href` as default (may include query params)
- Pages must explicitly strip query params using `getCanonicalUrl()`
- Risk of query param pages treated as separate URLs

## Routes Analysis

### Correctly Indexable ✓
- `/` (Home)
- `/categories` (Category listing)
- `/products` (Product listing)
- `/products/:slug` (Product detail)
- `/collections/:slug` (Collection pages)
- `/new-arrivals`, `/about`, `/contact`, `/privacy`, `/terms`

### Correctly Non-Indexable ✓
- `/cart` - ✓ Has noindex
- `/checkout` - ✓ Has noindex
- `/thank-you` - ✓ Has noindex

### Missing Noindex Meta ✗
- `/auth/login`
- `/auth/signup`
- `/profile`
- `/orders`
- `/orders/:id`

## SEO Implementation Assessment

**Strengths**:
- ✓ SEO.tsx properly implements title, meta description, canonical, og:tags
- ✓ Structured data (Product, Breadcrumb, FAQ, Organization schemas)
- ✓ ProductDetail page sets rich schema with ratings
- ✓ CategoryCollection page includes breadcrumbs and FAQs
- ✓ seoConfig.ts provides route-level indexability mapping
- ✓ robots.txt properly references sitemap and disallows /admin

**Weaknesses**:
- ⚠️ Auth/user pages don't use seoConfig helpers
- ⚠️ Sitemap generated client-side, not server/build-time
- ⚠️ Initial HTML thin due to SPA + Firestore fetch pattern

## Sitemap Issues

**Current state**:
- 405 lines, ~52 URLs in `/public/sitemap.xml`
- Static pages included (home, products, categories, etc.)
- **Problem 1**: Query parameter URLs (lines 52-86) - 6 `/products?category=ID` entries
- **Problem 2**: Missing all `/collections/:slug` category pages
- **Impact**: Category pages not submitted to GSC, query param duplication signals

## Firestore & Data Access

- Products/categories appear to be publicly readable (SPA loads data successfully)
- No authentication required for public product/category viewing
- User orders/profile properly restricted

## Recommendations (For Phase 2)

### P0 (Critical)
1. **Pre-render public SEO pages** - Generate static HTML for product/category pages with full content
2. **Fix sitemap** - Remove query param URLs, add `/collections/:slug` pages
3. **Add robots meta to auth/user pages** - Set `robots="noindex,follow"` explicitly

### P1 (High)
4. Verify Firestore security rules allow public product/category reads
5. Audit internal links - ensure no query param URLs used
6. Investigate GSC "page with redirect" (2) and "404" (3) URLs

### P2 (Medium)
7. Build-time sitemap generation instead of client-side
8. Verify canonical URLs never include query parameters
9. Add 404 page with suggestions for products/categories

## Verification Checklist

- ✓ robots.txt exists and references sitemap
- ✓ SEO.tsx supports robots meta parameter
- ✓ Structured data properly formatted
- ⚠️ Sitemap has duplicate/missing issues (needs Phase 2 fix)
- ⚠️ Auth pages missing explicit noindex (needs Phase 2 fix)
- ⚠️ Client-side rendering may cause indexation delays (needs Phase 2 prerender)

---

**Phase 1 audit complete. Ready to proceed to Phase 2 implementation.**
