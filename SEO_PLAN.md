# PakCart SEO & Sitemap Plan

## URL Architecture
- **Homepage**: `/` (Priority: 1.0, Changefreq: daily)
- **Categories**: `/categories` (Priority: 0.8, Changefreq: weekly)
- **Products Listing**: `/products` (Priority: 0.9, Changefreq: daily)
- **Product Details**: `/products/:slug` (Priority: 0.7, Changefreq: weekly)
- **New Arrivals**: `/new-arrivals` (Priority: 0.8, Changefreq: weekly)
- **Informational Pages**:
  - `/about` (Priority: 0.5, Changefreq: monthly)
  - `/contact` (Priority: 0.5, Changefreq: monthly)
  - `/privacy` (Priority: 0.3, Changefreq: yearly)
  - `/terms` (Priority: 0.3, Changefreq: yearly)

## Excluded from Sitemap
- Admin Dashboard (`/admin/*`)
- User Account/Profile (`/profile`, `/orders/*`)
- Auth Pages (`/auth/login`, `/auth/signup`)
- Checkout Flow (`/cart`, `/checkout`, `/thank-you`)

## Implementation
The sitemap is dynamically generated via `client/src/lib/sitemap.ts` and can be used to export a static `sitemap.xml` or served via a backend route. Since this is a client-side SPA, we'll provide the XML structure for the canonical domain `https://pakcart.store`.
