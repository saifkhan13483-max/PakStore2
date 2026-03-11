import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

const DOMAIN = "https://pakcart.store";

const formatDate = (date?: any) => {
  if (!date) return new Date().toISOString().split('T')[0];
  if (typeof date.toDate === 'function') {
    return date.toDate().toISOString().split('T')[0];
  }
  return new Date(date).toISOString().split('T')[0];
};

const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/products', priority: '0.9', changefreq: 'daily' },
  { url: '/categories', priority: '0.8', changefreq: 'weekly' },
  { url: '/new-arrivals', priority: '0.8', changefreq: 'weekly' },
  { url: '/about', priority: '0.5', changefreq: 'monthly' },
  { url: '/contact', priority: '0.5', changefreq: 'monthly' },
  { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { url: '/terms', priority: '0.3', changefreq: 'yearly' },
];

function parsePrivateKey(raw?: string): string | undefined {
  if (!raw) return undefined;
  // Vercel stores newlines as literal \n — replace them back
  return raw.replace(/\\n/g, '\n');
}

function buildXml(urls: { loc: string; lastmod?: string; changefreq: string; priority: string }[]): string {
  const today = new Date().toISOString().split('T')[0];
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  for (const u of urls) {
    xml += `
  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod || today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`;
  }
  xml += `\n</urlset>`;
  return xml;
}

export default async function handler(req: any, res: any) {
  const today = new Date().toISOString().split('T')[0];

  const urls: { loc: string; lastmod?: string; changefreq: string; priority: string }[] = staticPages.map(p => ({
    loc: `${DOMAIN}${p.url}`,
    lastmod: today,
    changefreq: p.changefreq,
    priority: p.priority,
  }));

  try {
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.VITE_FIREBASE_CLIENT_EMAIL;
    const privateKey = parsePrivateKey(process.env.VITE_FIREBASE_PRIVATE_KEY);

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        `Missing Firebase Admin credentials. Present: projectId=${!!projectId}, clientEmail=${!!clientEmail}, privateKey=${!!privateKey}`
      );
    }

    if (getApps().length === 0) {
      initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
    }

    const db = getFirestore();

    // Fetch categories
    let categoriesSnapshot = await db.collection('categories').where('active', '==', true).get();
    if (categoriesSnapshot.empty) {
      categoriesSnapshot = await db.collection('categories').get();
    }
    for (const doc of categoriesSnapshot.docs) {
      const data = doc.data();
      if (!data.slug) continue;
      urls.push({
        loc: `${DOMAIN}/collections/${data.slug}`,
        lastmod: formatDate(data.updatedAt),
        changefreq: 'weekly',
        priority: '0.8',
      });
    }

    // Fetch active products
    let productsSnapshot = await db.collection('products').where('active', '==', true).get();
    if (productsSnapshot.empty) {
      productsSnapshot = await db.collection('products').get();
    }
    for (const doc of productsSnapshot.docs) {
      const data = doc.data();
      if (!data.slug) continue;
      urls.push({
        loc: `${DOMAIN}/products/${data.slug}`,
        lastmod: formatDate(data.updatedAt),
        changefreq: 'weekly',
        priority: '0.7',
      });
    }

    const xml = buildXml(urls);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(xml);

  } catch (error: any) {
    console.error("Sitemap generation error:", error.message);

    // Fallback: serve static pages only so the sitemap is never broken
    const xml = buildXml(urls);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=300');
    return res.status(200).send(xml);
  }
}
