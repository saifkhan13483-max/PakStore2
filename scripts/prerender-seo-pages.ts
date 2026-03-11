#!/usr/bin/env node

/**
 * Pre-render Script for PakCart SEO Pages
 *
 * Generates static HTML snapshots of public pages for improved Googlebot indexability.
 * This script headlessly visits each URL, waits for window.__SEO_PAGE_READY__ = true,
 * then saves the fully-rendered HTML to the dist/ output directory.
 *
 * ============================================================
 * DEPENDENCY REQUIREMENT — Read before running
 * ============================================================
 * This script requires puppeteer. Install it before running:
 *
 *   npm install --save-dev puppeteer
 *
 * Do NOT add puppeteer to production dependencies — it is only
 * needed at build time. Confirm with the project owner before
 * adding to package.json.
 * ============================================================
 *
 * Usage (run from project root after `npm run build`):
 *   npx ts-node scripts/prerender-seo-pages.ts
 *   OR: npx tsx scripts/prerender-seo-pages.ts
 *
 * For CI/CD: add this step after the build step in your pipeline.
 * ============================================================
 */

import * as fs from "fs";
import * as path from "path";

const DOMAIN = process.env.PRERENDER_BASE_URL || "http://localhost:5000";
const DIST_DIR = path.join(process.cwd(), "dist");
const TIMEOUT_MS = 15000;

// Static routes to always pre-render
const STATIC_ROUTES = [
  "/",
  "/categories",
  "/products",
  "/new-arrivals",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
];

interface PublicRoute {
  path: string;
  outputFile: string;
}

async function fetchDynamicRoutes(): Promise<PublicRoute[]> {
  const routes: PublicRoute[] = [];

  try {
    const { initializeApp, getApps, cert } = await import("firebase-admin/app");
    const { getFirestore } = await import("firebase-admin/firestore");

    const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.VITE_FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.VITE_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Missing Firebase Admin env vars");
    }

    if (getApps().length === 0) {
      initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
    }

    const db = getFirestore();

    let catSnap = await db.collection("categories").where("active", "==", true).get();
    if (catSnap.empty) catSnap = await db.collection("categories").get();
    for (const doc of catSnap.docs) {
      const slug = doc.data().slug;
      if (slug) routes.push({ path: `/collections/${slug}`, outputFile: `collections/${slug}.html` });
    }

    let prodSnap = await db.collection("products").where("active", "==", true).get();
    if (prodSnap.empty) prodSnap = await db.collection("products").get();
    for (const doc of prodSnap.docs) {
      const slug = doc.data().slug;
      if (slug) routes.push({ path: `/products/${slug}`, outputFile: `products/${slug}.html` });
    }

    console.log(`✓ Found ${routes.length} dynamic routes from Firestore`);
  } catch (err: any) {
    console.warn("⚠ Could not fetch dynamic routes from Firestore:", err.message);
  }

  return routes;
}

async function prerenderRoutes(routes: PublicRoute[]): Promise<void> {
  // Dynamic import so the script still loads even if puppeteer is not installed
  let puppeteer: any;
  try {
    puppeteer = await import("puppeteer");
  } catch {
    console.error(
      "\n❌ puppeteer is not installed.\n" +
        "   Run: npm install --save-dev puppeteer\n" +
        "   Then re-run this script.\n"
    );
    process.exit(1);
  }

  const browser = await puppeteer.default.launch({ headless: true, args: ["--no-sandbox"] });

  for (const route of routes) {
    const url = `${DOMAIN}${route.path}`;
    const outputPath = path.join(DIST_DIR, route.outputFile);

    try {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "networkidle2", timeout: TIMEOUT_MS });

      // Wait for SEO ready signal (set by product/category pages after data loads)
      await page.waitForFunction("window.__SEO_PAGE_READY__ === true", { timeout: TIMEOUT_MS }).catch(() => {
        console.warn(`  ⚠ __SEO_PAGE_READY__ not set for ${route.path} — using current HTML`);
      });

      const html = await page.content();

      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(outputPath, html, "utf-8");
      console.log(`  ✓ Pre-rendered: ${route.path}`);
      await page.close();
    } catch (err: any) {
      console.error(`  ✗ Failed to pre-render ${route.path}:`, err.message);
    }
  }

  await browser.close();
}

async function main(): Promise<void> {
  console.log("Starting pre-render for PakCart SEO pages...");
  console.log(`Base URL: ${DOMAIN}`);
  console.log(`Output dir: ${DIST_DIR}\n`);

  if (!fs.existsSync(DIST_DIR)) {
    console.error(`❌ dist/ directory not found. Run 'npm run build' first.`);
    process.exit(1);
  }

  // Build all routes to prerender
  const staticRoutes: PublicRoute[] = STATIC_ROUTES.map((p) => ({
    path: p,
    outputFile: p === "/" ? "index.html" : `${p.replace(/^\//, "")}.html`,
  }));

  const dynamicRoutes = await fetchDynamicRoutes();
  const allRoutes = [...staticRoutes, ...dynamicRoutes];

  console.log(`\nPre-rendering ${allRoutes.length} total pages...\n`);
  await prerenderRoutes(allRoutes);
  console.log("\n✅ Pre-render complete.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
