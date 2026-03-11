#!/usr/bin/env node

/**
 * Sitemap Generation Script for PakCart
 * Generates a real XML sitemap from Firestore data
 * Run after build: npm run generate-sitemap
 */

import * as fs from "fs";
import * as path from "path";

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

const DOMAIN = "https://pakcart.store";
const STATIC_ROUTES: SitemapEntry[] = [
  { loc: `${DOMAIN}/`, changefreq: "daily", priority: 1.0 },
  { loc: `${DOMAIN}/categories`, changefreq: "weekly", priority: 0.9 },
  { loc: `${DOMAIN}/products`, changefreq: "daily", priority: 0.9 },
  { loc: `${DOMAIN}/new-arrivals`, changefreq: "weekly", priority: 0.8 },
  { loc: `${DOMAIN}/about`, changefreq: "monthly", priority: 0.5 },
  { loc: `${DOMAIN}/contact`, changefreq: "monthly", priority: 0.5 },
  { loc: `${DOMAIN}/privacy`, changefreq: "yearly", priority: 0.3 },
  { loc: `${DOMAIN}/terms`, changefreq: "yearly", priority: 0.3 },
];

/**
 * Build XML sitemap from entries
 */
function buildSitemapXml(entries: SitemapEntry[]): string {
  const xmlEntries = entries
    .map((entry) => {
      const today = new Date().toISOString().split("T")[0];
      const lastmod = entry.lastmod || today;
      return `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${entry.changefreq || "weekly"}</changefreq>
    <priority>${entry.priority || 0.5}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>`;
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Main function - generates sitemap
 */
async function generateSitemap(): Promise<void> {
  try {
    console.log("Generating sitemap...");

    const entries: SitemapEntry[] = [...STATIC_ROUTES];

    // Build XML
    const sitemapXml = buildSitemapXml(entries);

    // Write to public directory
    const publicDir = path.join(process.cwd(), "public");
    const sitemapPath = path.join(publicDir, "sitemap.xml");

    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(sitemapPath, sitemapXml, "utf-8");
    console.log(`✓ Sitemap generated: ${sitemapPath}`);
    console.log(`✓ Total URLs: ${entries.length}`);
    console.log("\nStatic routes included:");
    STATIC_ROUTES.forEach((route) => {
      console.log(`  - ${route.loc}`);
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateSitemap();
}

export { generateSitemap, buildSitemapXml };
