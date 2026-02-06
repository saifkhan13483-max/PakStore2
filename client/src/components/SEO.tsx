import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export default function SEO({ 
  title, 
  description, 
  keywords, 
  image = "/og-image.png", 
  url = window.location.href,
  type = "website"
}: SEOProps) {
  const siteName = "NoorBazaar";
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDescription = "Discover premium Pakistani artisanal products, from Kashmiri Pashminas to Multani Khussas. Quality items delivered to your doorstep.";

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": type === "product" ? "Product" : "Organization",
          "name": siteName,
          "url": "https://noorbazaar.pk",
          "logo": "https://noorbazaar.pk/logo.png",
          "description": defaultDescription,
          ...(type === "product" && {
            "name": title,
            "description": description,
          })
        })}
      </script>
    </Helmet>
  );
}
