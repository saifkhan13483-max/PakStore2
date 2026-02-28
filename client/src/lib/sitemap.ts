import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";

export interface SitemapItem {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

export const sitemapService = {
  async generateSitemap() {
    const domain = "https://pakcart.store";
    const items: SitemapItem[] = [
      { loc: `${domain}/`, changefreq: "daily", priority: 1.0 },
      { loc: `${domain}/products`, changefreq: "daily", priority: 0.9 },
      { loc: `${domain}/categories`, changefreq: "weekly", priority: 0.8 },
      { loc: `${domain}/new-arrivals`, changefreq: "weekly", priority: 0.8 },
      { loc: `${domain}/about`, changefreq: "monthly", priority: 0.5 },
      { loc: `${domain}/contact`, changefreq: "monthly", priority: 0.5 },
      { loc: `${domain}/privacy`, changefreq: "yearly", priority: 0.3 },
      { loc: `${domain}/terms`, changefreq: "yearly", priority: 0.3 },
    ];

    try {
      // Fetch Categories
      const categoriesSnap = await getDocs(collection(db, "categories"));
      categoriesSnap.forEach((doc) => {
        const data = doc.data();
        items.push({
          loc: `${domain}/products?category=${doc.id}`,
          changefreq: "weekly",
          priority: 0.8,
        });
      });

      // Fetch Products
      const productsSnap = await getDocs(query(collection(db, "products"), orderBy("updatedAt", "desc")));
      productsSnap.forEach((doc) => {
        const data = doc.data();
        const lastmod = data.updatedAt?.toDate 
          ? data.updatedAt.toDate().toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];
          
        items.push({
          loc: `${domain}/products/${data.slug}`,
          lastmod,
          changefreq: "weekly",
          priority: 0.7,
        });
      });

      return this.buildXml(items);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      return this.buildXml(items); // Return static parts at least
    }
  },

  buildXml(items: SitemapItem[]) {
    const xmlItems = items.map(item => `
  <url>
    <loc>${item.loc}</loc>
    ${item.lastmod ? `<lastmod>${item.lastmod}</lastmod>` : ""}
    <changefreq>${item.changefreq || "weekly"}</changefreq>
    <priority>${item.priority || 0.5}</priority>
  </url>`).join("");

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlItems}
</urlset>`;
  }
};
