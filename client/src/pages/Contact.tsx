import SEO from "@/components/SEO";
import ContactForm from "@/components/contact/ContactForm";
import { Mail } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const contactPageSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": "https://pakcart.store/contact#webpage",
  "url": "https://pakcart.store/contact",
  "name": "Contact Us - PakCart",
  "description": "Get in touch with PakCart for any inquiries about our authentic Pakistani artisanal products. Email, phone, or use our contact form. We're here to help.",
  "inLanguage": "en-PK",
  "isPartOf": { "@id": "https://pakcart.store/#website" },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://pakcart.store/" },
      { "@type": "ListItem", "position": 2, "name": "Contact Us", "item": "https://pakcart.store/contact" }
    ]
  },
  "mainEntity": {
    "@type": "Organization",
    "@id": "https://pakcart.store/#organization",
    "name": "PakCart",
    "url": "https://pakcart.store",
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "email": "contact@pakcart.store",
        "telephone": "+923188055850",
        "availableLanguage": ["English", "Urdu"],
        "areaServed": "PK",
        "hoursAvailable": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "09:00",
          "closes": "18:00"
        }
      }
    ]
  }
};

export default function Contact() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Contact Us - Get in Touch with PakCart"
        description="Get in touch with PakCart for any inquiries about our authentic Pakistani artisanal products. Email, phone, or use our contact form. We're here to help."
        url="https://pakcart.store/contact"
        robots="index,follow"
        schema={contactPageSchema}
        breadcrumbs={[
          { name: "Home", url: "https://pakcart.store/" },
          { name: "Contact Us", url: "https://pakcart.store/contact" },
        ]}
      />

      <div className="max-w-7xl mx-auto">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Contact Us</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Get in Touch
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions about our products or your order? We're here to help. 
            Fill out the form below or reach us through our contact details.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full text-primary">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Email</p>
                    <p className="text-muted-foreground">contact@pakcart.store</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full text-primary">
                    <SiWhatsapp className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">WhatsApp</p>
                    <p className="text-muted-foreground">+92 318 8055850</p>
                    <p className="text-sm text-muted-foreground">Mon-Fri, 9am - 6pm PKT</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 p-8 rounded-xl border border-primary/10">
              <h3 className="text-lg font-bold mb-2">Build Your Own Store</h3>
              <p className="text-muted-foreground text-sm">
                Interested in launching your own professional e-commerce platform like this one? 
                Get in touch with us at <a href="mailto:saifkhan@pakcart.store" className="font-medium text-primary hover:underline">saifkhan@pakcart.store</a> to start your digital journey today.
              </p>
            </div>
          </div>

          <div className="max-w-md mx-auto lg:mx-0 w-full">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
