import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const DOMAIN = "https://pakcart.store";
const TODAY = new Date().toISOString().split("T")[0];

const STATIC_PAGES = [
  { loc: `${DOMAIN}/`, changefreq: "daily", priority: "1.0" },
  { loc: `${DOMAIN}/products`, changefreq: "daily", priority: "0.9" },
  { loc: `${DOMAIN}/categories`, changefreq: "weekly", priority: "0.8" },
  { loc: `${DOMAIN}/new-arrivals`, changefreq: "weekly", priority: "0.8" },
  { loc: `${DOMAIN}/about`, changefreq: "monthly", priority: "0.5" },
  { loc: `${DOMAIN}/contact`, changefreq: "monthly", priority: "0.5" },
  { loc: `${DOMAIN}/privacy`, changefreq: "yearly", priority: "0.3" },
  { loc: `${DOMAIN}/terms`, changefreq: "yearly", priority: "0.3" },
];

function formatDate(ts) {
  if (!ts) return TODAY;
  if (typeof ts.toDate === "function") return ts.toDate().toISOString().split("T")[0];
  return new Date(ts).toISOString().split("T")[0];
}

function buildXml(entries) {
  const urls = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${e.loc}</loc>\n    <lastmod>${e.lastmod || TODAY}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

async function main() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const entries = STATIC_PAGES.map((p) => ({ ...p, lastmod: TODAY }));

  // Fetch categories
  const catSnap = await getDocs(collection(db, "categories"));
  let catCount = 0;
  catSnap.forEach((doc) => {
    const d = doc.data();
    if (!d.slug) return;
    entries.push({
      loc: `${DOMAIN}/collections/${d.slug}`,
      lastmod: formatDate(d.updatedAt),
      changefreq: "weekly",
      priority: "0.8",
    });
    catCount++;
  });
  console.log(`✓ ${catCount} categories`);

  // Fetch all active products
  const prodSnap = await getDocs(collection(db, "products"));
  let prodCount = 0;
  prodSnap.forEach((doc) => {
    const d = doc.data();
    if (!d.slug) return;
    if (d.active === false) return;
    entries.push({
      loc: `${DOMAIN}/products/${d.slug}`,
      lastmod: formatDate(d.updatedAt),
      changefreq: "weekly",
      priority: "0.7",
    });
    prodCount++;
  });
  console.log(`✓ ${prodCount} products`);
  console.log(`✓ ${entries.length} total URLs`);

  const xml = buildXml(entries);

  const paths = [
    path.join(__dirname, "../client/public/sitemap.xml"),
    path.join(__dirname, "../public/sitemap.xml"),
  ];

  for (const p of paths) {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, xml, "utf-8");
    console.log(`✓ Written: ${p}`);
  }

  console.log("\nDone! Redeploy your site to Vercel to apply the new sitemap.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
