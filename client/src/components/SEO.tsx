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
  brand?: string;
  sku?: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  productData?: ProductSchemaProps;
  schema?: Record<string, any>;
  breadcrumbs?: BreadcrumbItem[];
  faqs?: FAQItem[];
  robots?: string;
  isHomePage?: boolean;
}

const SITE_URL = "https://pakcart.store";
const SITE_NAME = "PakCart";

function getAbsoluteUrl(url: string): string {
  if (!url) return `${SITE_URL}/og-image.png`;
  if (url.startsWith("http")) return url;
  return `${SITE_URL}${url.startsWith("/") ? url : "/" + url}`;
}

function getCleanCanonical(url: string): string {
  if (!url) return SITE_URL;
  try {
    const urlObj = new URL(url.startsWith("http") ? url : `${SITE_URL}${url.startsWith("/") ? url : "/" + url}`);
    const clean = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
    return clean.endsWith("/") && clean !== `${SITE_URL}/` ? clean.slice(0, -1) : clean;
  } catch {
    const withoutQuery = url.split("?")[0].split("#")[0];
    if (withoutQuery.startsWith("http")) return withoutQuery;
    return `${SITE_URL}${withoutQuery.startsWith("/") ? withoutQuery : "/" + withoutQuery}`;
  }
}

function getPriceValidUntil(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split("T")[0];
}

export default function SEO({
  title,
  description,
  keywords,
  image = "/og-image.png",
  url = typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}` : SITE_URL,
  type = "website",
  productData,
  schema,
  breadcrumbs,
  faqs,
  robots = "index,follow",
  isHomePage = false,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | #1 Online Shopping in Pakistan`;
  const defaultDescription = "Shop the best artisanal products and daily essentials at PakCart. Quality items delivered to your doorstep across Pakistan.";
  const absoluteImage = getAbsoluteUrl(image);
  const canonicalUrl = getCleanCanonical(url);

  const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": getAbsoluteUrl(item.url)
    }))
  } : null;

  const faqSchema = faqs && faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  const productSchema = schema ? schema : productData ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": productData.name,
    "description": productData.description,
    "image": productData.image.map(getAbsoluteUrl).filter(Boolean),
    "url": canonicalUrl,
    ...(productData.brand ? { "brand": { "@type": "Brand", "name": productData.brand } } : {}),
    ...(productData.sku ? { "sku": productData.sku } : {}),
    "countryOfOrigin": {
      "@type": "Country",
      "name": "Pakistan"
    },
    "offers": {
      "@type": "Offer",
      "@id": `${canonicalUrl}#offer`,
      "url": canonicalUrl,
      "priceCurrency": productData.priceCurrency || "PKR",
      "price": productData.price.toString(),
      "priceValidUntil": getPriceValidUntil(),
      "availability": productData.availability || (productData.inStock !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"),
      "itemCondition": "https://schema.org/NewCondition",
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "PK"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "businessDays": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
          },
          "cutoffTime": "17:00:00+05:00",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 0,
            "maxValue": 1,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 2,
            "maxValue": 5,
            "unitCode": "DAY"
          }
        }
      },
      "seller": {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        "name": SITE_NAME
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "PK",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 7,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn"
      }
    },
    ...(productData.rating && productData.reviewCount ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": productData.rating,
        "reviewCount": productData.reviewCount,
        "bestRating": "5",
        "worstRating": "1"
      }
    } : {})
  } : isHomePage ? {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        "url": SITE_URL,
        "name": SITE_NAME,
        "inLanguage": "en-PK",
        "description": description || defaultDescription,
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${SITE_URL}/products?search={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        "name": SITE_NAME,
        "url": SITE_URL,
        "logo": {
          "@type": "ImageObject",
          "@id": `${SITE_URL}/#logo`,
          "url": `${SITE_URL}/favicon.png`,
          "contentUrl": `${SITE_URL}/favicon.png`,
          "caption": SITE_NAME
        },
        "description": description || defaultDescription,
        "areaServed": {
          "@type": "Country",
          "name": "Pakistan"
        },
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "PK"
        },
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "contactType": "Customer Service",
            "email": "support@pakcart.store",
            "telephone": "+923188055850",
            "availableLanguage": ["English", "Urdu"],
            "areaServed": "PK"
          }
        ]
      }
    ]
  } : {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    "name": SITE_NAME,
    "url": SITE_URL,
    "logo": {
      "@type": "ImageObject",
      "url": `${SITE_URL}/favicon.png`,
      "caption": SITE_NAME
    },
    "description": defaultDescription,
    "areaServed": {
      "@type": "Country",
      "name": "Pakistan"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "PK"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "email": "support@pakcart.store",
      "telephone": "+923188055850"
    }
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robots} />

      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title || SITE_NAME} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_PK" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@pakcartstore" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={absoluteImage} />

      <script type="application/ld+json">
        {JSON.stringify(productSchema)}
      </script>

      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}

      {faqSchema && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}
    </Helmet>
  );
}
