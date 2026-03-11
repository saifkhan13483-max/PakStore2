/**
 * PakCart — Build-time SEO HTML Generator
 *
 * Generates pre-rendered HTML files for all public pages.
 * Works WITHOUT puppeteer by injecting SEO data directly into
 * the Vite-built index.html shell.
 *
 * For each public route this script:
 *  1. Fetches real product/category data from Firestore (client SDK)
 *  2. Builds a full <head> block: title, meta description, canonical,
 *     robots, og:*, structured data (JSON-LD)
 *  3. Injects a visible <h1> + content into the page body so crawlers
 *     see meaningful text even before JS hydrates
 *  4. Writes the result to dist/<route>/index.html
 *
 * Usage (run from project root after npm run build):
 *   node scripts/generate-seo-html.mjs
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "../dist");
const DOMAIN = "https://pakcart.store";
const TODAY = new Date().toISOString().split("T")[0];

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

function esc(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatPrice(price) {
  return `Rs. ${Number(price || 0).toLocaleString("en-PK")}`;
}

function buildHead({ title, description, canonical, robots = "index,follow", image, schema }) {
  const fullTitle = title ? `${title} | PakCart` : "PakCart – Online Shopping Pakistan";
  const img = image || `${DOMAIN}/og-image.png`;
  return {
    title: fullTitle,
    meta: `
  <meta name="description" content="${esc(description)}" />
  <meta name="robots" content="${robots}" />
  <link rel="canonical" href="${esc(canonical)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${esc(canonical)}" />
  <meta property="og:title" content="${esc(fullTitle)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:image" content="${esc(img)}" />
  <meta property="og:site_name" content="PakCart" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(fullTitle)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${esc(img)}" />
  ${schema ? `<script type="application/ld+json">${JSON.stringify(schema)}</script>` : ""}`.trim(),
  };
}

function buildBodyContent(content) {
  return content;
}

function injectIntoShell(shell, head, bodyContent) {
  let result = shell;
  // Replace the existing <title> with the route-specific title
  result = result.replace(/<title>[^<]*<\/title>/, `<title>${head.title}</title>`);
  // Inject meta/canonical/og/schema tags right before </head>
  result = result.replace("</head>", `${head.meta}\n</head>`);
  // Inject visible SEO content INSIDE #root — React replaces this on hydration (proper SSR pattern)
  result = result.replace(
    /(<div id="root">)(<\/div>)?/,
    `$1<div id="seo-content" style="font-family:system-ui,sans-serif;padding:16px;color:#111">${bodyContent}</div></div>`
  );
  return result;
}

function writeHtml(routePath, html) {
  let outDir;
  if (routePath === "/") {
    outDir = DIST;
  } else {
    outDir = path.join(DIST, routePath.replace(/^\//, ""));
  }
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "index.html");
  fs.writeFileSync(outFile, html, "utf-8");
  return outFile;
}

// ─── Static Pages ────────────────────────────────────────────────────────────

const STATIC_PAGES = [
  {
    route: "/",
    title: "Online Shopping in Pakistan – Women's Bags, Watches, Slippers & Bedsheets",
    description:
      "Shop affordable women's handbags, men's watches, slippers, bedsheets, and kids bags online in Pakistan. Free delivery on orders over Rs. 10,000.",
    h1: "Online Shopping in Pakistan",
    body: "<p>Welcome to PakCart – your trusted online store for women's bags, men's watches, slippers, bedsheets, and kids accessories. Free delivery across Pakistan on orders over Rs. 10,000.</p>",
    schema: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "PakCart",
      url: DOMAIN,
      potentialAction: { "@type": "SearchAction", target: `${DOMAIN}/products?q={search_term_string}`, "query-input": "required name=search_term_string" },
    },
  },
  {
    route: "/categories",
    title: "Shop by Category – Bags, Watches, Slippers, Bedsheets",
    description: "Browse all product categories at PakCart. Find women's bags, men's watches, slippers, bedsheets, and more.",
    h1: "Shop by Category",
    body: "<p>Explore our full range of categories including women's bags, men's watches, slippers, bedsheets, and kids accessories.</p>",
  },
  {
    route: "/products",
    title: "All Products – Shop Online in Pakistan",
    description: "Browse all products at PakCart. Affordable fashion accessories, footwear and home essentials delivered across Pakistan.",
    h1: "All Products",
    body: "<p>Browse our complete collection of products including bags, watches, slippers, bedsheets, and more. Fast delivery across Pakistan.</p>",
  },
  {
    route: "/new-arrivals",
    title: "New Arrivals – Latest Products at PakCart",
    description: "Discover the latest arrivals at PakCart. New bags, watches, slippers, and bedsheets added regularly.",
    h1: "New Arrivals",
    body: "<p>Check out our newest products — fresh stock of bags, watches, slippers, and bedsheets arriving regularly at PakCart.</p>",
  },
  {
    route: "/about",
    title: "About PakCart – Our Story",
    description: "Learn about PakCart, Pakistan's trusted online store for artisanal goods and daily essentials.",
    h1: "About PakCart",
    body: "<p>PakCart is a premium Pakistani e-commerce store offering curated fashion accessories, footwear, and home essentials with fast nationwide delivery.</p>",
  },
  {
    route: "/contact",
    title: "Contact PakCart – Get in Touch",
    description: "Contact PakCart for support, inquiries, or feedback. We're here to help with your order.",
    h1: "Contact Us",
    body: "<p>Get in touch with PakCart for any questions, order support, or feedback. Our customer service team is available to assist you.</p>",
  },
  {
    route: "/privacy",
    title: "Privacy Policy – PakCart",
    description: "Read PakCart's privacy policy to understand how we collect, use, and protect your personal information.",
    h1: "Privacy Policy",
    body: "<p>This privacy policy explains how PakCart collects and uses your personal information when you shop on our platform.</p>",
  },
  {
    route: "/terms",
    title: "Terms of Service – PakCart",
    description: "Read PakCart's terms of service for information about your rights and responsibilities as a customer.",
    h1: "Terms of Service",
    body: "<p>These terms of service govern your use of PakCart's website and services. Please read them carefully before making a purchase.</p>",
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(DIST)) {
    console.error("❌ dist/ not found — run npm run build first");
    process.exit(1);
  }

  // Always read from shell-original.html so repeat runs don't accumulate injected tags.
  // If it doesn't exist (first ever run), create it from index.html now (before any writes).
  const shellOrigPath = path.join(DIST, "shell-original.html");
  const indexPath = path.join(DIST, "index.html");
  if (!fs.existsSync(shellOrigPath)) {
    fs.copyFileSync(indexPath, shellOrigPath);
    console.log("📋 Saved shell-original.html from clean build");
  }
  const shell = fs.readFileSync(shellOrigPath, "utf-8");
  const results = [];

  // ── Static pages ────────────────────────────────────────────────────────────
  for (const page of STATIC_PAGES) {
    const canonical = `${DOMAIN}${page.route}`;
    const head = buildHead({ title: page.title, description: page.description, canonical, schema: page.schema });
    const body = buildBodyContent(`<h1>${esc(page.h1)}</h1>${page.body}`);
    const html = injectIntoShell(shell, head, body);
    const file = writeHtml(page.route, html);
    results.push({ route: page.route, file, title: page.title });
    console.log(`✓ ${page.route}`);
  }

  // ── Dynamic pages from Firebase ─────────────────────────────────────────────
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // Collections / categories
  const catSnap = await getDocs(collection(db, "categories"));
  let catCount = 0;
  for (const doc of catSnap.docs) {
    const d = doc.data();
    if (!d.slug) continue;

    const canonical = `${DOMAIN}/collections/${d.slug}`;
    const title = `${d.name || d.slug} – Shop Online at PakCart`;
    const description = d.description
      ? d.description.slice(0, 160)
      : `Shop ${d.name || d.slug} at PakCart. Browse our curated selection with fast delivery across Pakistan.`;

    const schema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: d.name || d.slug,
      description,
      url: canonical,
      provider: { "@type": "Organization", name: "PakCart", url: DOMAIN },
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: DOMAIN },
        { "@type": "ListItem", position: 2, name: "Categories", item: `${DOMAIN}/categories` },
        { "@type": "ListItem", position: 3, name: d.name || d.slug, item: canonical },
      ],
    };

    const headObj = buildHead({ title, description, canonical, schema });
    headObj.meta += `\n<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`;

    const body = buildBodyContent(
      `<nav aria-label="Breadcrumb"><ol><li><a href="${DOMAIN}">Home</a></li><li><a href="${DOMAIN}/categories">Categories</a></li><li>${esc(d.name || d.slug)}</li></ol></nav>` +
      `<h1>${esc(d.name || d.slug)}</h1>` +
      `<p>${esc(description)}</p>`
    );

    const html = injectIntoShell(shell, headObj, body);
    const file = writeHtml(`/collections/${d.slug}`, html);
    results.push({ route: `/collections/${d.slug}`, file, title });
    console.log(`✓ /collections/${d.slug}`);
    catCount++;
  }
  console.log(`   → ${catCount} collection pages`);

  // Products
  const prodSnap = await getDocs(collection(db, "products"));
  let prodCount = 0;
  for (const doc of prodSnap.docs) {
    const d = doc.data();
    if (!d.slug) continue;
    if (d.active === false) continue;

    const canonical = `${DOMAIN}/products/${d.slug}`;
    const price = Number(d.price || d.variants?.[0]?.price || 0);
    const title = `${d.name || d.slug} – Buy Online in Pakistan`;
    const rawDesc = d.description || d.shortDescription || "";
    const description = rawDesc
      ? rawDesc.replace(/<[^>]+>/g, "").slice(0, 160)
      : `Buy ${d.name || d.slug} online in Pakistan at PakCart. ${price ? `Price: ${formatPrice(price)} PKR.` : ""} Fast delivery nationwide.`;

    const images = Array.isArray(d.images) ? d.images.filter(Boolean) : d.image ? [d.image] : [];

    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: d.name || d.slug,
      description,
      url: canonical,
      ...(images.length ? { image: images.slice(0, 3) } : {}),
      offers: {
        "@type": "Offer",
        url: canonical,
        priceCurrency: "PKR",
        price: price.toString(),
        availability: d.stock > 0 || d.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        seller: { "@type": "Organization", name: "PakCart" },
      },
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: DOMAIN },
        { "@type": "ListItem", position: 2, name: "Products", item: `${DOMAIN}/products` },
        { "@type": "ListItem", position: 3, name: d.name || d.slug, item: canonical },
      ],
    };

    const headObj = buildHead({ title, description, canonical, image: images[0], schema });
    headObj.meta += `\n<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`;

    const body = buildBodyContent(
      `<nav aria-label="Breadcrumb"><ol><li><a href="${DOMAIN}">Home</a></li><li><a href="${DOMAIN}/products">Products</a></li><li>${esc(d.name || d.slug)}</li></ol></nav>` +
      `<h1>${esc(d.name || d.slug)}</h1>` +
      `${price ? `<p><strong>Price: ${esc(formatPrice(price))} PKR</strong></p>` : ""}` +
      `<p>${esc(description)}</p>` +
      `${images[0] ? `<img src="${esc(images[0])}" alt="${esc(d.name || d.slug)}" />` : ""}`
    );

    const html = injectIntoShell(shell, headObj, body);
    const file = writeHtml(`/products/${d.slug}`, html);
    results.push({ route: `/products/${d.slug}`, file, title });
    console.log(`✓ /products/${d.slug}`);
    prodCount++;
  }
  console.log(`   → ${prodCount} product pages`);

  console.log(`\n✅ Pre-render complete: ${results.length} pages written to dist/`);
  console.log(`   Static: ${STATIC_PAGES.length}, Collections: ${catCount}, Products: ${prodCount}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
