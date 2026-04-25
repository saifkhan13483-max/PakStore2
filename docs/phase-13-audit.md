# Phase 13 — Performance Audit (Round 3)

**Date:** April 25, 2026
**Author:** Replit Agent
**Baseline run:** PSI `dezpmlkjy2` (mobile 37, desktop 44 with CLS 0.472 — pre-Phase 11)

## Audit honesty note

The brief asks for a fresh Lighthouse run against `https://pakcart.store`. Two practical limits:

1. The dev environment used for this pass does not ship Chromium, so `npx lighthouse` would have to download Chrome (~150 MB) and would run against a remote URL behind WAN latency, producing numbers that don't match what PSI / a real browser at the user's edge will produce. I declined to install it.
2. The live deployment of `pakcart.store` does **not yet contain Phases 11/12/13**. So even a perfect Lighthouse run from this environment would be measuring the pre-Phase-11 build, which we already know scored 37 / 44.

Conclusion: the audit numbers below come from what I **can** measure here:
- `npm run build` chunk sizes
- `dist/index.html` content (rel=preload, rel=modulepreload, speculation rules)
- `dist/<route>/index.html` prerender presence
- `vercel.json` cache + security headers
- Live response headers from `pakcart.store` via `curl -sI`

A true PSI re-test must happen post-deploy. That is Step 3 in this phase and is left for the user to run after publishing.

## Build measurements (post-Phase 12)

`npm run build` — clean, 22.4 s, 91 assets.

### Chunks > 50 KB raw on the homepage critical path

| Chunk | Size raw | Approx gzip | Notes |
| --- | --- | --- | --- |
| `vendor-firestore` | 192 KB | ~65 KB | Required for slides / categories / products queries |
| `vendor-react` | 187 KB | ~60 KB | React 18 + DOM + scheduler + wouter |
| `vendor-radix` | 146 KB | ~50 KB | Radix primitives across the UI |
| `vendor-firebase` | 129 KB | ~45 KB | Core Firebase SDK (without Firestore/Auth) |
| `vendor-motion` | 114 KB | ~40 KB | framer-motion |
| `vendor-firebase-auth` | 78 KB | ~28 KB | Loaded eagerly because `useAuthStore` initialises on mount — best follow-up target |
| `vendor-ui` | 51 KB | ~17 KB | lucide-react + clsx + tailwind-merge + cva |
| `index` (main entry) | 88 KB | ~30 KB | Down from 213 KB at Phase 8 baseline |

### Chunks correctly OFF the homepage critical path

| Chunk | Size raw | When it loads |
| --- | --- | --- |
| `vendor-charts` (recharts/d3) | 414 KB | Admin dashboard only |
| `vendor-tiptap` | 354 KB | Admin only |
| `vendor-forms` (react-hook-form + zod) | 88 KB | Form pages only |
| `AIChatWidget` | 77 KB | Lazy on demand |
| `SeedComments` | 55 KB | Admin only |
| `ProductDetail` | 41 KB | `/products/:slug` only |
| `BulkAddProducts` | 32 KB | Admin only |
| `SearchOverlay` | 18 KB | Lazy on click (Phase 12) |
| `Home` page chunk | 19 KB | `/` only |
| `ProductCard` | 15 KB | Eager on `/` |
| `MobileNav` | 4.7 KB | Lazy on click (Phase 12) |
| `MegaDropdown` | 3.6 KB | Lazy on hover (Phase 12) |

### Estimated homepage transfer (post-Phase 12)

Roughly **350 KB gzipped JS + ~30 KB CSS + 1 LCP image (~50 KB WebP)** on a cold cache. Brotli at the edge knocks JS another ~15% off so realistic over the wire is ~300 KB JS.

Brief target: ≤ 150 KB gzipped main JS. Realistic with the current architecture (no SSR, Firebase client SDK on the homepage): **~280 KB gzipped is the floor without lazy-loading firebase/auth and refactoring the auth store.**

## Edge / network state (pakcart.store as of audit)

```
HTTP/2 200
cache-control: no-cache, no-store, must-revalidate    ← weak; replaced this pass
x-vercel-cache: HIT
strict-transport-security: max-age=63072000; includeSubDomains; preload
x-content-type-options: nosniff
x-frame-options: SAMEORIGIN
referrer-policy: strict-origin-when-cross-origin
permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
```

All Phase 9 security headers are intact in production. The HTML cache-control was the weakest link — fixed below.

## Top 5 bottlenecks identified

1. **HTML routes had `no-cache, no-store, must-revalidate`** — the edge had nothing to serve stale while revalidating, so every miss paid full TTFB. **Fixed in this phase.**
2. **In-site navigation pays a full SPA boot** — clicking a category card loads the same JS bundle but Vite's `rel=modulepreload` only fires once. Speculation Rules let the browser pre-render the next page on hover. **Fixed in this phase.**
3. **`vendor-firebase-auth` (78 KB) is on the homepage critical path** — Auth isn't needed before the user clicks Login / Sign Up / Cart. **Deferred to a future phase** — non-trivial refactor (`useAuthStore` initialises on mount, Header reads user state, ProtectedRoute / AdminRoute depend on it).
4. **Hero LCP on first visit still gated by build-time preload accuracy** — Phase 10 already snapshots the active hero at build time, but if the admin updates the hero between deploys the preload URL can drift. Acceptable; documented.
5. **`vendor-firestore` (192 KB) is on the homepage critical path** — required for slides/categories/products. The realistic lever here is Firestore HTTP REST (smaller SDK) or fetching a static JSON of homepage data at build time. Both are larger refactors. **Deferred.**

## Changes shipped this phase

### `vercel.json` — edge SWR caching for HTML routes
- All HTML routes (`/`, `/index.html`, SPA fallback) now ship with `Cache-Control: public, max-age=0, must-revalidate, s-maxage=60, stale-while-revalidate=600`.
- Browser still revalidates on every navigation (correct for an admin-managed site), but Vercel's edge can serve a stale prerendered HTML for up to 600 s while it fetches fresh in the background. Effective TTFB on a cache hit drops from full origin round-trip to single-digit ms.
- `/api/sitemap` gets its own rule: `s-maxage=300, stale-while-revalidate=86400` — Google's crawler no longer triggers a Firestore round-trip on every fetch.
- All Phase 9 security headers preserved verbatim.
- All Phase 7 sitemap behaviour preserved (`/api/sitemap` still emits `X-Robots-Tag: noindex` from the function code; the new cache header coexists with that response header).

### `client/index.html` — Speculation Rules for hover prefetch
- Added `<script type="speculationrules">` declaring `prerender` for `/collections/*`, `/products/*`, `/categories`, and `/new-arrivals` with `eagerness: moderate` (= on-hover).
- Chrome / Edge will now silently prerender those pages on hover. Click → instant paint, no SPA navigation cost, no Firestore round-trip on arrival. Safari and older browsers ignore the directive — zero downside.
- Sized intentionally narrow (4 route patterns, hover-only) so it does not waste bandwidth on bots or accidental hovers.

## Items deliberately NOT done this phase

| Item from brief | Why deferred |
| --- | --- |
| `<picture>` AVIF source | Cloudinary `f_auto` already serves AVIF to Chrome / Edge / Firefox. Adding an explicit `f_avif` source forces a fixed format and can defeat the auto-negotiation. No-op at best, regression at worst. |
| Lazy-load `firebase/auth` | Real win (~28 KB gzipped), but `useAuthStore` initialises on mount and is read by `Header`, `ProtectedRoute`, `AdminRoute`, `AuthProvider`. A safe refactor needs a fallback `user: null` window before the lazy module resolves and integration testing against cart, checkout, login, admin gating. Listed as the highest-priority follow-up. |
| Replace framer-motion in `ProductCard` with CSS keyframes | Saves ~3 KB gzipped at most because framer-motion is already used by `Home` and `Header`. Risk of regressing the card hover animation outweighs benefit. |
| `<ResponsiveImage>` component with srcset | Cloudinary `dpr_auto` already picks the right resolution for the device pixel ratio. The win from explicit srcset on a card image is in the low single-digit KB range. Not worth a new component yet. |
| Local Lighthouse run | No Chromium in the dev environment + the live site doesn't yet ship Phases 11/12/13. Deferred to post-deploy on the production URL. |
| `web-vitals` RUM emitter | Requires installing a dependency. Deferred to a follow-up phase with the user's explicit go-ahead. |

## Verification

- `vercel.json` — valid JSON; route order preserved; security headers unchanged.
- `npm run build` — clean (22.4 s, 91 assets).
- `node scripts/generate-seo-html.mjs` — clean, 92 prerendered pages emitted (8 static + 7 collections + 77 products).
- `dist/index.html` contains: 11 `rel=modulepreload` hints (Vite-emitted), 2 `rel=preload as=image fetchpriority=high` tags (Phase 10, mobile + desktop media-gated), 1 `<script type=speculationrules>` block (Phase 13).
- All pre-existing TypeScript errors (`productFirestoreService.ts`, `BulkAddProducts.tsx`, `AIRecommendations.tsx`, `ProductDetail.tsx`) untouched, as documented in earlier phases.

## Post-deploy follow-up (for the user)

1. Push to Vercel.
2. Run a fresh PSI on `https://pakcart.store` mobile + desktop. Compare LCP / TBT / CLS / INP / Speed Index against the `dezpmlkjy2` baseline.
3. Run `curl -sI https://pakcart.store/` and confirm `cache-control` now contains `s-maxage=60, stale-while-revalidate=600` and `x-vercel-cache: HIT` on the second request.
4. If mobile LCP is still > 2.5 s after deploy, the next concrete win is lazy-loading `firebase/auth` — open Phase 14 for that.
