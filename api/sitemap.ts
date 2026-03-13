import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

const DOMAIN = "https://pakcart.store";
const TODAY = new Date().toISOString().split('T')[0];

function escapeXml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const formatDate = (date?: any): string => {
  if (!date) return TODAY;
  try {
    if (typeof date.toDate === 'function') {
      return date.toDate().toISOString().split('T')[0];
    }
    const d = new Date(date);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  } catch {}
  return TODAY;
};

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

const STATIC_PAGES: SitemapUrl[] = [
  { loc: `${DOMAIN}/`, lastmod: TODAY, changefreq: 'daily', priority: '1.0' },
  { loc: `${DOMAIN}/products`, lastmod: TODAY, changefreq: 'daily', priority: '0.9' },
  { loc: `${DOMAIN}/categories`, lastmod: TODAY, changefreq: 'weekly', priority: '0.8' },
  { loc: `${DOMAIN}/new-arrivals`, lastmod: TODAY, changefreq: 'weekly', priority: '0.8' },
  { loc: `${DOMAIN}/about`, lastmod: TODAY, changefreq: 'monthly', priority: '0.5' },
  { loc: `${DOMAIN}/contact`, lastmod: TODAY, changefreq: 'monthly', priority: '0.5' },
  { loc: `${DOMAIN}/privacy`, lastmod: TODAY, changefreq: 'yearly', priority: '0.3' },
  { loc: `${DOMAIN}/terms`, lastmod: TODAY, changefreq: 'yearly', priority: '0.3' },
];

function buildXml(urls: SitemapUrl[]): string {
  const seen = new Set<string>();
  const deduped = urls.filter(u => {
    if (!u.loc || seen.has(u.loc)) return false;
    seen.add(u.loc);
    return true;
  });

  const urlsXml = deduped.map(u => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlsXml}\n</urlset>`;
}

function parsePrivateKey(raw?: string): string | undefined {
  if (!raw) return undefined;
  return raw.replace(/\\n/g, '\n');
}

export default async function handler(req: any, res: any) {
  const urls: SitemapUrl[] = [...STATIC_PAGES];

  try {
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.VITE_FIREBASE_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = parsePrivateKey(
      process.env.VITE_FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY
    );

    if (!projectId || !clientEmail || !privateKey) {
      console.error('[sitemap] Missing Firebase Admin credentials:', {
        hasProjectId: !!projectId,
        hasClientEmail: !!clientEmail,
        hasPrivateKey: !!privateKey,
      });
      throw new Error('Missing Firebase Admin credentials');
    }

    if (getApps().length === 0) {
      initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
    }

    const db = getFirestore();

    // Fetch categories
    let categoriesErrors = 0;
    try {
      let categoriesSnap = await db.collection('categories').where('active', '==', true).get();
      if (categoriesSnap.empty) {
        categoriesSnap = await db.collection('categories').get();
      }
      for (const doc of categoriesSnap.docs) {
        const data = doc.data();
        const slug = data.slug;
        if (!slug || typeof slug !== 'string' || slug.trim() === '') continue;
        urls.push({
          loc: `${DOMAIN}/collections/${encodeURIComponent(slug)}`,
          lastmod: formatDate(data.updatedAt || data.createdAt),
          changefreq: 'weekly',
          priority: '0.8',
        });
      }
    } catch (err: any) {
      categoriesErrors++;
      console.error('[sitemap] Failed to fetch categories:', err.message);
    }

    // Fetch active products
    let productsErrors = 0;
    try {
      let productsSnap = await db.collection('products').where('active', '==', true).get();
      if (productsSnap.empty) {
        productsSnap = await db.collection('products').get();
      }
      for (const doc of productsSnap.docs) {
        const data = doc.data();
        const slug = data.slug;
        if (!slug || typeof slug !== 'string' || slug.trim() === '') continue;
        if (data.active === false) continue;
        if (data.status === 'draft' || data.published === false) continue;
        urls.push({
          loc: `${DOMAIN}/products/${encodeURIComponent(slug)}`,
          lastmod: formatDate(data.updatedAt || data.createdAt),
          changefreq: 'weekly',
          priority: '0.7',
        });
      }
    } catch (err: any) {
      productsErrors++;
      console.error('[sitemap] Failed to fetch products:', err.message);
    }

    const xml = buildXml(urls);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(xml);

  } catch (error: any) {
    console.error('[sitemap] Fatal error:', error.message);
    const xml = buildXml(urls);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).send(xml);
  }
}
