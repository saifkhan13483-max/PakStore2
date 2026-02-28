import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

const domain = "https://pakcart.store";

// Helper to format date to ISO string (YYYY-MM-DD)
const formatDate = (date?: any) => {
  if (!date) return new Date().toISOString().split('T')[0];
  if (typeof date.toDate === 'function') {
    return date.toDate().toISOString().split('T')[0];
  }
  return new Date(date).toISOString().split('T')[0];
};

export default async function handler(req: any, res: any) {
  try {
    // Initialize Firebase Admin if not already initialized
    if (getApps().length === 0) {
      // TODO: Ensure these environment variables are set in your Vercel project settings
      // VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_CLIENT_EMAIL, VITE_FIREBASE_PRIVATE_KEY
      const serviceAccount = {
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        clientEmail: process.env.VITE_FIREBASE_CLIENT_EMAIL,
        // Replace escaped newlines if they exist in the env var
        privateKey: process.env.VITE_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };

      if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        throw new Error("Missing Firebase service account environment variables");
      }

      initializeApp({
        credential: cert(serviceAccount),
      });
    }

    const db = getFirestore();

    // 1. Fetch Categories
    const categoriesSnapshot = await db.collection('categories')
      .where('active', '==', true) // Using 'active' per existing schema.ts, adjust if needed
      .get();
    
    const categories = categoriesSnapshot.docs.map(doc => ({
      slug: doc.data().slug,
      updatedAt: formatDate(doc.data().updatedAt)
    }));

    // 2. Fetch Products
    const productsSnapshot = await db.collection('products')
      .where('active', '==', true)
      .get();
    
    const products = productsSnapshot.docs.map(doc => ({
      slug: doc.data().slug,
      updatedAt: formatDate(doc.data().updatedAt)
    }));

    // 3. Static Pages
    const staticPages = [
      { url: '/about', priority: 0.5, changefreq: 'monthly' },
      { url: '/contact', priority: 0.5, changefreq: 'monthly' },
      { url: '/privacy', priority: 0.5, changefreq: 'monthly' },
      { url: '/terms', priority: 0.5, changefreq: 'monthly' },
    ];

    // 4. Construct XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${domain}/</loc>
    <lastmod>${formatDate()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

    // Add static pages
    staticPages.forEach(page => {
      xml += `
  <url>
    <loc>${domain}${page.url}</loc>
    <lastmod>${formatDate()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // Add categories
    categories.forEach(cat => {
      xml += `
  <url>
    <loc>${domain}/products?category=${cat.slug}</loc>
    <lastmod>${cat.updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    // Add products
    products.forEach(prod => {
      xml += `
  <url>
    <loc>${domain}/products/${prod.slug}</loc>
    <lastmod>${prod.updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(xml);

  } catch (error: any) {
    console.error("Sitemap generation error:", error);
    // Fallback XML with just the homepage if everything fails
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${domain}/</loc>
    <lastmod>${formatDate()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    res.setHeader('Content-Type', 'application/xml');
    return res.status(200).send(fallbackXml);
  }
}
