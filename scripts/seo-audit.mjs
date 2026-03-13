/**
 * PakCart — SEO Indexability Audit Helper
 *
 * Audits all public routes for SEO basics:
 *  - Title present
 *  - Meta description present
 *  - Canonical present
 *  - robots meta correct (index,follow for public; noindex for private)
 *  - Structured data (JSON-LD) present where expected
 *  - Route included in sitemap if indexable
 *
 * Usage (from project root):
 *   node scripts/seo-audit.mjs
 *
 * Requirements: npm install node-fetch (or Node 18+ native fetch)
 */

const DOMAIN = "https://pakcart.store";
const SITEMAP_URL = `${DOMAIN}/sitemap.xml`;

const PUBLIC_ROUTES = [
  { path: "/", label: "Homepage", expectSchema: true, expectStructuredData: ["WebSite", "Organization"] },
  { path: "/products", label: "Products Index", expectSchema: false },
  { path: "/categories", label: "Categories Index", expectSchema: false },
  { path: "/new-arrivals", label: "New Arrivals", expectSchema: false },
  { path: "/about", label: "About Page", expectSchema: false },
  { path: "/contact", label: "Contact Page", expectSchema: false },
  { path: "/privacy", label: "Privacy Policy", expectSchema: false },
  { path: "/terms", label: "Terms of Service", expectSchema: false },
];

const PRIVATE_ROUTES = [
  { path: "/cart", label: "Cart" },
  { path: "/checkout", label: "Checkout" },
  { path: "/auth/login", label: "Login" },
  { path: "/auth/signup", label: "Signup" },
  { path: "/profile", label: "Profile" },
  { path: "/orders", label: "My Orders" },
  { path: "/thank-you", label: "Thank You" },
  { path: "/admin", label: "Admin Dashboard" },
];

function extractMeta(html, name) {
  const patterns = [
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, "i"),
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) return m[1];
  }
  return null;
}

function extractProperty(html, property) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i"),
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) return m[1];
  }
  return null;
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]+)<\/title>/i);
  return m ? m[1].trim() : null;
}

function extractCanonical(html) {
  const m = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
    || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  return m ? m[1] : null;
}

function extractRobots(html) {
  return extractMeta(html, "robots");
}

function hasJsonLd(html) {
  return html.includes('type="application/ld+json"') || html.includes("type='application/ld+json'");
}

function extractSitemapUrls(xml) {
  const matches = xml.match(/<loc>([^<]+)<\/loc>/g) || [];
  return matches.map(m => m.replace(/<\/?loc>/g, "").trim());
}

async function fetchPage(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "PakCart-SEO-Audit/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    const html = await res.text();
    return { ok: true, status: res.status, html };
  } catch (err) {
    return { ok: false, status: 0, html: "", error: err.message };
  }
}

async function fetchSitemap() {
  try {
    const res = await fetch(SITEMAP_URL, {
      headers: { "User-Agent": "PakCart-SEO-Audit/1.0" },
      signal: AbortSignal.timeout(15000),
    });
    const xml = await res.text();
    return extractSitemapUrls(xml);
  } catch (err) {
    console.warn(`  ⚠ Could not fetch sitemap: ${err.message}`);
    return [];
  }
}

function pass(msg) { return `  ✅ ${msg}`; }
function fail(msg) { return `  ❌ ${msg}`; }
function warn(msg) { return `  ⚠️  ${msg}`; }

async function auditPublicRoute(route, sitemapUrls) {
  const url = `${DOMAIN}${route.path}`;
  const { ok, status, html, error } = await fetchPage(url);
  const issues = [];
  const passes = [];

  if (!ok || status < 200 || status >= 400) {
    return {
      route: route.path,
      label: route.label,
      status,
      error: error || `HTTP ${status}`,
      issues: [`Route returned ${status}`],
      passes: [],
      inSitemap: sitemapUrls.includes(url) || sitemapUrls.includes(url + "/"),
    };
  }

  const title = extractTitle(html);
  const description = extractMeta(html, "description");
  const canonical = extractCanonical(html);
  const robots = extractRobots(html);
  const hasLD = hasJsonLd(html);
  const inSitemap = sitemapUrls.includes(url) || sitemapUrls.includes(url + "/");
  const ogTitle = extractProperty(html, "og:title");
  const ogDescription = extractProperty(html, "og:description");
  const ogImage = extractProperty(html, "og:image");

  title ? passes.push(pass(`Title: "${title.substring(0, 60)}${title.length > 60 ? "..." : ""}"`)) : issues.push(fail("Missing <title>"));
  description ? passes.push(pass(`Meta description: "${description.substring(0, 80)}..."`)) : issues.push(fail("Missing meta description"));
  canonical ? passes.push(pass(`Canonical: ${canonical}`)) : issues.push(fail("Missing canonical tag"));

  if (robots) {
    if (robots.includes("index")) {
      passes.push(pass(`Robots: ${robots}`));
    } else {
      issues.push(fail(`Robots is "${robots}" — public page should be index,follow`));
    }
  } else {
    issues.push(warn("No robots meta found (defaults to index)"));
  }

  if (route.expectSchema) {
    hasLD ? passes.push(pass("Structured data (JSON-LD) present")) : issues.push(fail("Missing structured data (JSON-LD) — expected for this page"));
  } else {
    if (hasLD) passes.push(pass("Structured data (JSON-LD) present"));
  }

  ogTitle ? passes.push(pass("og:title present")) : issues.push(warn("Missing og:title"));
  ogDescription ? passes.push(pass("og:description present")) : issues.push(warn("Missing og:description"));
  ogImage ? passes.push(pass("og:image present")) : issues.push(warn("Missing og:image"));

  inSitemap
    ? passes.push(pass("Included in sitemap.xml"))
    : issues.push(fail(`Not found in sitemap.xml (expected: ${url})`));

  return { route: route.path, label: route.label, status, title, description, canonical, robots, hasLD, inSitemap, issues, passes };
}

async function auditPrivateRoute(route) {
  const url = `${DOMAIN}${route.path}`;
  const { ok, status, html } = await fetchPage(url);

  if (!ok || status >= 400) {
    return { route: route.path, label: route.label, status, note: `HTTP ${status} — may be protected` };
  }

  const robots = extractRobots(html);
  const hasNoindex = robots && robots.includes("noindex");

  return {
    route: route.path,
    label: route.label,
    status,
    robots,
    hasNoindex,
    ok: hasNoindex,
    note: hasNoindex ? "noindex confirmed" : `robots="${robots || "index,follow (default)"}" — SHOULD be noindex`,
  };
}

async function main() {
  console.log("\n🔍 PakCart SEO Indexability Audit");
  console.log("=".repeat(60));
  console.log(`Domain: ${DOMAIN}`);
  console.log(`Date: ${new Date().toISOString().split("T")[0]}\n`);

  console.log("📡 Fetching sitemap...");
  const sitemapUrls = await fetchSitemap();
  console.log(`   Found ${sitemapUrls.length} URLs in sitemap\n`);

  // ── PUBLIC ROUTES ─────────────────────────────────────────
  console.log("=".repeat(60));
  console.log("PUBLIC ROUTES (should be indexable)");
  console.log("=".repeat(60));

  let totalIssues = 0;
  const results = [];

  for (const route of PUBLIC_ROUTES) {
    console.log(`\n▶ ${route.label} (${route.path})`);
    const result = await auditPublicRoute(route, sitemapUrls);
    results.push(result);

    if (result.error) {
      console.log(fail(`Route error: ${result.error}`));
      totalIssues++;
      continue;
    }

    result.passes.forEach(p => console.log(p));
    result.issues.forEach(i => { console.log(i); if (i.startsWith("  ❌")) totalIssues++; });
  }

  // ── PRIVATE ROUTES ────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  console.log("PRIVATE ROUTES (should be noindex)");
  console.log("=".repeat(60));

  for (const route of PRIVATE_ROUTES) {
    const result = await auditPrivateRoute(route);
    const icon = result.ok ? "✅" : result.status >= 400 ? "⚠️ " : "❌";
    console.log(`\n${icon} ${result.label} (${route.path}) → ${result.note}`);
    if (!result.ok && result.status < 400) totalIssues++;
  }

  // ── SITEMAP SUMMARY ───────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  console.log("SITEMAP SUMMARY");
  console.log("=".repeat(60));
  const productUrls = sitemapUrls.filter(u => u.includes("/products/")).length;
  const collectionUrls = sitemapUrls.filter(u => u.includes("/collections/")).length;
  const staticUrls = sitemapUrls.filter(u => !u.includes("/products/") && !u.includes("/collections/")).length;
  console.log(`  Total URLs: ${sitemapUrls.length}`);
  console.log(`  Static pages: ${staticUrls}`);
  console.log(`  Product pages: ${productUrls}`);
  console.log(`  Collection pages: ${collectionUrls}`);

  const EXCLUDE_FROM_SITEMAP = ["/cart", "/checkout", "/auth", "/profile", "/orders", "/admin", "/thank-you"];
  const badUrls = sitemapUrls.filter(u => EXCLUDE_FROM_SITEMAP.some(exc => u.replace(DOMAIN, "").startsWith(exc)));
  if (badUrls.length > 0) {
    console.log(fail(`${badUrls.length} private/disallowed URLs found in sitemap:`));
    badUrls.forEach(u => console.log(`     - ${u}`));
    totalIssues += badUrls.length;
  } else {
    console.log(pass("No private URLs found in sitemap"));
  }

  // ── FINAL SUMMARY ─────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  console.log("AUDIT COMPLETE");
  console.log("=".repeat(60));
  if (totalIssues === 0) {
    console.log("✅ All critical checks passed. Site appears well-configured for indexing.\n");
  } else {
    console.log(`❌ ${totalIssues} critical issue(s) found. Review the report above and fix before submitting to Search Console.\n`);
  }

  // ── POST-DEPLOY CHECKLIST ─────────────────────────────────
  console.log("POST-DEPLOY CHECKLIST");
  console.log("=".repeat(60));
  const checklist = [
    "Open https://pakcart.store/sitemap.xml — confirm product + collection URLs are present",
    "Open https://pakcart.store/robots.txt — confirm public pages are not blocked",
    "In Google Search Console → Sitemaps: resubmit https://pakcart.store/sitemap.xml",
    "In GSC → URL Inspection: test the homepage, /products, /categories, a /collections/:slug",
    "In GSC → URL Inspection: test 3–5 strong product pages and request indexing",
    "Validate Product schema at https://validator.schema.org",
    "Validate OG tags at https://developers.facebook.com/tools/debug",
    "Monitor Page Indexing report in GSC for 2–6 weeks",
    "Check Core Web Vitals report once indexed pages appear",
  ];
  checklist.forEach((item, i) => console.log(`  ${i + 1}. ${item}`));
  console.log("");
}

main().catch(err => {
  console.error("Audit failed:", err.message);
  process.exit(1);
});
