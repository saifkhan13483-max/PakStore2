import { useEffect } from "react";
import SEO from "@/components/SEO";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const aboutPageSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": "https://pakcart.store/about#webpage",
  "url": "https://pakcart.store/about",
  "name": "About PakCart - Online Shopping in Pakistan",
  "description": "Learn about PakCart, Pakistan's premier destination for authentic artisanal products. Connecting local artisans with customers nationwide with fast delivery and quality guaranteed.",
  "inLanguage": "en-PK",
  "isPartOf": { "@id": "https://pakcart.store/#website" },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://pakcart.store/" },
      { "@type": "ListItem", "position": 2, "name": "Our Story", "item": "https://pakcart.store/about" }
    ]
  },
  "mainEntity": {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://pakcart.store/#organization",
    "name": "PakCart",
    "url": "https://pakcart.store",
    "logo": {
      "@type": "ImageObject",
      "url": "https://pakcart.store/favicon.png",
      "caption": "PakCart"
    },
    "description": "Pakistan's premier destination for bags & wallets, jewelry, shoes, slippers, stitched dresses, watches and tech gadgets.",
    "foundingDate": "2024",
    "areaServed": { "@type": "Country", "name": "Pakistan" },
    "address": { "@type": "PostalAddress", "addressCountry": "PK" },
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
};

export default function About() {
  useEffect(() => {
    (window as any).__SEO_PAGE_READY__ = true;
  }, []);

  return (
    <>
      <SEO
        title="About PakCart — Pakistan's Trusted Online Store for Artisanal Goods"
        description="Learn how PakCart connects trusted brands and suppliers with shoppers nationwide — handpicked bags & wallets, jewelry, shoes, slippers, stitched dresses, watches and tech gadgets, with Cash on Delivery and quality guaranteed."
        keywords="about pakcart, pakistani online store, artisanal shopping pakistan, trusted ecommerce pakistan"
        url="https://pakcart.store/about"
        robots="index,follow"
        schema={aboutPageSchema}
        breadcrumbs={[
          { name: "Home", url: "https://pakcart.store/" },
          { name: "Our Story", url: "https://pakcart.store/about" },
        ]}
      />
      <div className="container mx-auto px-4 py-12">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Our Story</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="max-w-4xl mx-auto prose prose-emerald dark:prose-invert">
          <h1 className="text-4xl font-serif text-emerald-900 mb-4">About PakCart</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Welcome to PakCart, Pakistan's premier destination for authentic artisanal products.
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-serif text-emerald-800">Our Mission</h2>
            <p>
              At PakCart, our mission is to preserve and promote the rich cultural heritage of Pakistan 
              by connecting local artisans with a global audience. We believe in sustainable commerce 
              that empowers communities while delivering exceptional quality to our customers.
            </p>
          </section>

          <section className="mb-12 grid md:grid-cols-2 gap-8">
            <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100">
              <h3 className="text-xl font-serif text-emerald-800 mb-3">Nationwide Delivery</h3>
              <p className="text-muted-foreground">
                We deliver our curated products to every corner of Pakistan, ensuring your favorite 
                artisanal pieces reach you safely and promptly.
              </p>
            </div>
            <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100">
              <h3 className="text-xl font-serif text-emerald-800 mb-3">Authentic Quality</h3>
              <p className="text-muted-foreground">
                Each product in our collection is handpicked and verified for authenticity, 
                guaranteeing you get the very best of Pakistani craftsmanship.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif text-emerald-800">Our Story</h2>
            <p>
              PakCart started with a simple idea: to bring the hidden treasures of Pakistan's bazaars 
              to the digital age. From the intricate weaves of Kashmiri shawls to the vibrant pottery 
              of Multan, we represent the soul of our nation's artistry.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
