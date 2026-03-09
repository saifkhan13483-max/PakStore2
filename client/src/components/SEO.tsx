import { Helmet } from "react-helmet-async";

interface ProductSchemaProps {
  name: string;
  description: string;
  image: string[];
  price: number;
  priceCurrency?: string;
  availability?: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
}

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  productData?: ProductSchemaProps;
}

function getAbsoluteUrl(url: string): string {
  if (!url) return "https://pakcart.store/og-image.png";
  if (url.startsWith("http")) return url;
  return `https://pakcart.store${url.startsWith("/") ? url : "/" + url}`;
}

export default function SEO({ 
  title, 
  description, 
  keywords, 
  image = "/og-image.png", 
  url = typeof window !== "undefined" ? window.location.href : "https://pakcart.store",
  type = "website",
  productData
}: SEOProps) {
  const siteName = "PakCart";
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDescription = "Shop the best artisanal products and daily essentials at PakCart. Quality items delivered to your doorstep in Pakistan.";
  const absoluteImage = getAbsoluteUrl(image);
  const absoluteUrl = url.startsWith("http") ? url : `https://pakcart.store${url.startsWith("/") ? url : "/" + url}`;

  const productSchema = productData ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": productData.name,
    "description": productData.description,
    "image": productData.image.map(getAbsoluteUrl).filter(Boolean),
    "url": absoluteUrl,
    "offers": {
      "@type": "Offer",
      "url": absoluteUrl,
      "priceCurrency": productData.priceCurrency || "PKR",
      "price": productData.price.toString(),
      "availability": productData.availability || (productData.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"),
      "seller": {
        "@type": "Organization",
        "name": siteName
      }
    },
    ...(productData.rating && productData.reviewCount ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": productData.rating,
        "reviewCount": productData.reviewCount
      }
    } : {})
  } : {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteName,
    "url": "https://pakcart.store",
    "logo": "https://pakcart.store/logo.png",
    "description": defaultDescription
  };

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="utf-8" />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={absoluteUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={absoluteUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={absoluteUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={absoluteImage} />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(productSchema)}
      </script>
    </Helmet>
  );
}
