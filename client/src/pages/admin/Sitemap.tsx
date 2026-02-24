import { sitemapService } from "@/lib/sitemap";

export default function Sitemap() {
  // This component will handle the download or display of the sitemap
  // In a pure SPA, we usually generate it on the fly or via a build script
  const handleDownload = async () => {
    const xml = await sitemapService.generateSitemap();
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sitemap.xml";
    a.click();
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Sitemap Management</h1>
      <p className="mb-6">Generate and download the latest SEO-optimized sitemap for search engines.</p>
      <button 
        onClick={handleDownload}
        className="bg-primary text-white px-4 py-2 rounded"
      >
        Download sitemap.xml
      </button>
    </div>
  );
}
