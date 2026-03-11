#!/usr/bin/env node

/**
 * Sitemap Generation Script for PakCart
 *
 * Generates a complete XML sitemap by fetching real data from Firestore.
 * Writes output to client/public/sitemap.xml (included in Vite build output).
 *
 * Requirements:
 *   - VITE_FIREBASE_PROJECT_ID env var
 *   - VITE_FIREBASE_CLIENT_EMAIL env var
 *   - VITE_FIREBASE_PRIVATE_KEY env var
 *
 * Usage (run from project root):
 *   npx ts-node scripts/generate-sitemap.ts
 *   OR: npx tsx scripts/generate-sitemap.ts
 */

import * as fs from "fs";
import * as path from "path";

const DOMAIN = "https://pakcart.store";
const TODAY = new Date().toISOString().split("T")[0];

interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

const STATIC_ENTRIES: SitemapEntry[] = [
  { loc: `${DOMAIN}/`, lastmod: TODAY, changefreq: "daily", priority: "1.0" },
  { loc: `${DOMAIN}/products`, lastmod: TODAY, changefreq: "daily", priority: "0.9" },
  { loc: `${DOMAIN}/categories`, lastmod: TODAY, changefreq: "weekly", priority: "0.8" },
  { loc: `${DOMAIN}/new-arrivals`, lastmod: TODAY, changefreq: "weekly", priority: "0.8" },
  { loc: `${DOMAIN}/about`, lastmod: TODAY, changefreq: "monthly", priority: "0.5" },
  { loc: `${DOMAIN}/contact`, lastmod: TODAY, changefreq: "monthly", priority: "0.5" },
  { loc: `${DOMAIN}/privacy`, lastmod: TODAY, changefreq: "yearly", priority: "0.3" },
  { loc: `${DOMAIN}/terms`, lastmod: TODAY, changefreq: "yearly", priority: "0.3" },
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatFirestoreDate(date: any): string {
  if (!date) return TODAY;
  if (typeof date.toDate === "function") return date.toDate().toISOString().split("T")[0];
  return new Date(date).toISOString().split("T")[0];
}

function buildXml(entries: SitemapEntry[]): string {
  const urlsXml = entries
    .map(
      (e) => `  <url>
    <loc>${escapeXml(e.loc)}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;
}

async function generateSitemap(): Promise<void> {
  console.log("Generating sitemap for PakCart...");
  const entries: SitemapEntry[] = [...STATIC_ENTRIES];

  // Try to load Firebase Admin for dynamic data
  try {
    const { initializeApp, getApps, cert } = await import("firebase-admin/app");
    const { getFirestore } = await import("firebase-admin/firestore");

    const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.VITE_FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.VITE_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        "Missing Firebase Admin credentials. Set VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_CLIENT_EMAIL, VITE_FIREBASE_PRIVATE_KEY environment variables."
      );
    }

    if (getApps().length === 0) {
      initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
    }

    const db = getFirestore();

    // Fetch categories
    let catSnap = await db.collection("categories").where("active", "==", true).get();
    if (catSnap.empty) catSnap = await db.collection("categories").get();

    for (const doc of catSnap.docs) {
      const data = doc.data();
      if (!data.slug) continue;
      entries.push({
        loc: `${DOMAIN}/collections/${data.slug}`,
        lastmod: formatFirestoreDate(data.updatedAt),
        changefreq: "weekly",
        priority: "0.8",
      });
    }
    console.log(`✓ Added ${catSnap.size} category URLs`);

    // Fetch products
    let prodSnap = await db.collection("products").where("active", "==", true).get();
    if (prodSnap.empty) prodSnap = await db.collection("products").get();

    for (const doc of prodSnap.docs) {
      const data = doc.data();
      if (!data.slug) continue;
      entries.push({
        loc: `${DOMAIN}/products/${data.slug}`,
        lastmod: formatFirestoreDate(data.updatedAt),
        changefreq: "weekly",
        priority: "0.7",
      });
    }
    console.log(`✓ Added ${prodSnap.size} product URLs`);

  } catch (err: any) {
    console.warn("⚠ Firebase Admin not available. Generating static-only sitemap.");
    console.warn("  Reason:", err.message);
    console.warn(
      "  To include dynamic product/category URLs, set Firebase Admin credentials as environment variables."
    );
  }

  const xml = buildXml(entries);

  // Write to client/public (included in Vite build output → dist/)
  const clientPublicDir = path.join(process.cwd(), "client", "public");
  const clientSitemapPath = path.join(clientPublicDir, "sitemap.xml");
  if (!fs.existsSync(clientPublicDir)) fs.mkdirSync(clientPublicDir, { recursive: true });
  fs.writeFileSync(clientSitemapPath, xml, "utf-8");
  console.log(`✓ Sitemap written to: ${clientSitemapPath}`);
  console.log(`✓ Total URLs: ${entries.length}`);

  entries.forEach((e) => console.log(`  - ${e.loc}`));
}

generateSitemap().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

export { generateSitemap, buildXml };
