## Dynamic Sitemap (Vercel)
The sitemap is served dynamically at `/sitemap.xml` via a Vercel Serverless Function (`api/sitemap.ts`). This ensures that new products and categories are automatically indexed as soon as they are added to Firestore.

### Setup Checklist
1. **Environment Variables**: Set the following in Vercel:
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_CLIENT_EMAIL`
   - `VITE_FIREBASE_PRIVATE_KEY`
2. **Verification**: Visit `https://pakcart.store/sitemap.xml` to verify the output.
3. **Submission**: Submit the URL to Google Search Console.
4. **Automation**: Google will periodically re-fetch the sitemap, picking up new items automatically.

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
