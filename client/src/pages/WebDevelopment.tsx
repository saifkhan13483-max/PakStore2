import { Link } from "wouter";
import SEO from "@/components/SEO";
import {
  Code2,
  ShieldCheck,
  Server,
  Mail as MailIcon,
  Search,
  Wallet,
  Clock,
  CheckCircle2,
  Globe,
  ExternalLink,
  Phone,
  Sparkles,
  Rocket,
  LayoutDashboard,
  Smartphone,
  ArrowRight,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const WebDevelopment = () => {
  const features = [
    {
      icon: Code2,
      title: "Pure Custom Coding",
      desc: "No Shopify, no WordPress dependency. Fully hand-coded websites built from scratch.",
    },
    {
      icon: Wallet,
      title: "One-Time Payment",
      desc: "No monthly subscription fees. Pay once and own your website forever.",
    },
    {
      icon: Server,
      title: "Lifetime Free Hosting",
      desc: "Fast and reliable hosting included for life — no recurring hosting bills.",
    },
    {
      icon: MailIcon,
      title: "Free Business Emails",
      desc: "Lifetime free professional emails like contact@yourdomain for your business.",
    },
    {
      icon: LayoutDashboard,
      title: "Admin Panel Included",
      desc: "Full admin dashboard to manage products, orders, customers and content.",
    },
    {
      icon: Search,
      title: "SEO Friendly",
      desc: "Built with SEO best practices so your store ranks well on Google.",
    },
    {
      icon: Smartphone,
      title: "Mobile Responsive",
      desc: "Looks beautiful on every device — phone, tablet and desktop.",
    },
    {
      icon: Rocket,
      title: "Fast & Optimized",
      desc: "Optimized code and assets so your store loads in a flash.",
    },
  ];

  const includes = [
    "Fully functional eCommerce website",
    "Powerful admin panel to manage everything",
    "Lifetime free fast hosting",
    "Lifetime free business emails (contact@yourdomain)",
    "Mobile responsive modern design",
    "SEO friendly structure",
    "Ready-to-use within 1 month",
    "All essential eCommerce features included",
  ];

  const steps = [
    {
      n: "01",
      title: "Discuss Your Idea",
      desc: "WhatsApp par baat karein — apne business aur requirements share karein.",
    },
    {
      n: "02",
      title: "Design & Development",
      desc: "Hum aap ke liye website ko pure code mein design aur develop karte hain.",
    },
    {
      n: "03",
      title: "Launch in 1 Month",
      desc: "Hosting, business emails aur admin panel ke saath website live ho jaati hai.",
    },
  ];

  const plan = {
    name: "Standard",
    price: "45,000",
    tagline: "Most popular for growing brands",
    features: [
      "Unlimited products",
      "Premium custom design",
      "Full admin panel + analytics",
      "Lifetime free fast hosting",
      "3 free business emails",
      "Advanced SEO + sitemap",
      "WhatsApp & order notifications",
      "Delivery in 1 month",
    ],
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://pakcart.store/web-development#service",
    "name": "Custom eCommerce Web Development",
    "serviceType": "eCommerce Website Development",
    "provider": {
      "@type": "Organization",
      "@id": "https://pakcart.store/#organization",
      "name": "PakCart",
      "url": "https://pakcart.store",
      "telephone": "+92-318-8055850",
      "areaServed": { "@type": "Country", "name": "Pakistan" },
    },
    "areaServed": { "@type": "Country", "name": "Pakistan" },
    "url": "https://pakcart.store/web-development",
    "description":
      "Custom-coded eCommerce websites for Pakistani businesses — one-time payment, no Shopify or WordPress subscriptions, lifetime free hosting and business emails, full admin panel, SEO-friendly, mobile responsive, ready in 1 month.",
    "offers": {
      "@type": "Offer",
      "price": "45000",
      "priceCurrency": "PKR",
      "availability": "https://schema.org/InStock",
      "url": "https://pakcart.store/web-development",
      "name": "Standard eCommerce Website Package",
      "description":
        "Unlimited products, premium custom design, full admin panel + analytics, lifetime free fast hosting, 3 free business emails, advanced SEO + sitemap, WhatsApp & order notifications, 1-month delivery.",
    },
  };

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Web Development", url: "/web-development" },
  ];

  const faqs = [
    {
      question: "Kitne din mein website ready ho jaati hai?",
      answer:
        "Sirf 1 month mein aap ki fully working eCommerce website ready ho jaati hai — admin panel, hosting aur business emails ke saath.",
    },
    {
      question: "Kya yeh one-time payment hai ya monthly?",
      answer:
        "100% one-time payment. Koi monthly subscription nahi, koi hidden charges nahi. Hosting aur business emails bhi lifetime free hain.",
    },
    {
      question: "Kya Shopify ya WordPress use hota hai?",
      answer:
        "Nahi. Hum pure custom code mein website develop karte hain — isi liye aap ko monthly platform fees nahi deni parti aur website fast & SEO-friendly hoti hai.",
    },
    {
      question: "Maximum kitne products add kar sakte hain?",
      answer:
        "Unlimited products. Aap apne admin panel se jitne products chahein add kar sakte hain.",
    },
    {
      question: "Custom requirements ho to?",
      answer:
        "WhatsApp +92 318 8055850 par message karein — hum aap ke business ke liye tailored quote dete hain.",
    },
  ];

  return (
    <div className="bg-background">
      <SEO
        title="Custom eCommerce Web Development in Pakistan"
        description="Get a fully custom-coded eCommerce website with admin panel, lifetime free hosting and business emails — one-time Rs 45,000, no Shopify or WordPress subscriptions, ready in 1 month."
        keywords="ecommerce website development pakistan, custom website pakistan, online store development, web developer pakistan, ecommerce store builder, no shopify website, no wordpress website, pakcart web development"
        url="/web-development"
        type="website"
        schema={serviceSchema}
        breadcrumbs={breadcrumbs}
        faqs={faqs}
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div
          aria-hidden
          className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-secondary/20 blur-3xl"
        />

        <div className="container relative mx-auto px-4 py-14 sm:py-20 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-5 sm:space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card/70 backdrop-blur px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Assalam-o-Alaikum
            </span>
            <h1
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight"
              data-testid="text-webdev-title"
            >
              Custom eCommerce Websites
              <span className="block text-secondary">Built With Pure Code</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Hum professional web developers hain. Specially custom eCommerce
              websites develop karte hain — Shopify ya WordPress par depend kiye
              baghair, pure coding ke zariye. Iska sab se bara faida yeh hai ke
              aap ko Shopify waghera ki monthly subscription fees nahi deni
              parti.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
              <a
                href="https://wa.me/923188055850"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-whatsapp-webdev"
                className="w-full sm:w-auto"
              >
                <Button
                  size="lg"
                  className="w-full sm:w-auto shadow-lg shadow-primary/20"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  WhatsApp — +92 318 8055850
                </Button>
              </a>
              <a
                href="https://pakcart.store"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-demo-pakcart"
                className="w-full sm:w-auto"
              >
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  See Live Demo
                </Button>
              </a>
            </div>

            {/* Trust strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-8 max-w-2xl mx-auto">
              {[
                { k: "1 Month", v: "Delivery" },
                { k: "One-Time", v: "Payment" },
                { k: "Lifetime", v: "Free Hosting" },
                { k: "100%", v: "Custom Code" },
              ].map((s) => (
                <div
                  key={s.v}
                  className="rounded-lg border bg-card/70 backdrop-blur px-3 py-3 text-center"
                >
                  <div className="font-display font-bold text-base sm:text-lg text-foreground">
                    {s.k}
                  </div>
                  <div className="text-[11px] sm:text-xs text-muted-foreground">
                    {s.v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="container mx-auto px-4 py-14 sm:py-20">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold">
            Aap ko kya milega?
          </h2>
          <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
            Fully functional eCommerce website with admin panel, lifetime free
            hosting and emails — sab kuch ek{" "}
            <span className="font-semibold text-foreground">one-time payment</span>{" "}
            par.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mt-10">
          {features.map((f) => (
            <Card
              key={f.title}
              className="hover-elevate h-full"
              data-testid={`card-feature-${f.title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <CardContent className="p-5 sm:p-6 space-y-3 h-full">
                <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-base sm:text-lg leading-snug">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="bg-muted/40 border-y">
        <div className="container mx-auto px-4 py-14 sm:py-20">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold">
              Kaam kaise hota hai?
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Simple aur transparent process — sirf 3 steps mein aap ki website
              ready.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-10 max-w-5xl mx-auto">
            {steps.map((s) => (
              <Card key={s.n} className="relative h-full">
                <CardContent className="p-6 space-y-3">
                  <div className="font-display text-3xl sm:text-4xl font-bold text-primary/30">
                    {s.n}
                  </div>
                  <h3 className="font-semibold text-lg">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {s.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="container mx-auto px-4 py-14 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-5xl mx-auto">
          <div className="space-y-4 order-2 lg:order-1">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary/15 px-3 py-1 text-xs font-medium text-secondary-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-secondary" />
              Complete Package
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
              Package Mein Kya Shamil Hai?
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              Sirf ek mahine mein, hum aap ke liye fully professional,
              ready-to-use, aur SEO-friendly eCommerce website tayar kar dete
              hain — saath mein lifetime free hosting aur business emails bhi.
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4 text-secondary" />
                Delivery: 1 month
              </span>
              <span className="inline-flex items-center gap-2">
                <Globe className="h-4 w-4 text-secondary" />
                Live demo: pakcart.store
              </span>
            </div>
          </div>

          <Card className="order-1 lg:order-2 shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <ul className="space-y-3">
                {includes.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-sm sm:text-base"
                    data-testid={`text-include-${idx}`}
                  >
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-muted/40 border-y" id="pricing">
        <div className="container mx-auto px-4 py-14 sm:py-20">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card px-3 py-1 text-xs font-medium text-primary">
              <Wallet className="h-3.5 w-3.5" />
              Pricing Plans
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold">
              Simple, One-Time Pricing
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Koi monthly fees nahi, koi hidden charges nahi. Apne business ke
              liye perfect plan choose karein.
            </p>
          </div>

          <div className="mt-12 max-w-md mx-auto">
            <Card
              className="relative border-primary border-2 shadow-xl"
              data-testid={`card-plan-${plan.name.toLowerCase()}`}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-xs font-semibold shadow">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  Most Popular
                </span>
              </div>
              <CardContent className="p-6 sm:p-8 flex flex-col">
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-xl">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {plan.tagline}
                  </p>
                </div>

                <div className="mt-5 pb-5 border-b">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-medium text-muted-foreground">
                      Rs.
                    </span>
                    <span
                      className="font-display text-4xl sm:text-5xl font-bold text-foreground"
                      data-testid={`text-price-${plan.name.toLowerCase()}`}
                    >
                      {plan.price}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    One-time payment
                  </p>
                </div>

                <ul className="space-y-3 py-5">
                  {plan.features.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm"
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="https://wa.me/923188055850"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`link-plan-${plan.name.toLowerCase()}`}
                >
                  <Button className="w-full" size="lg">
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-xs sm:text-sm text-muted-foreground mt-8">
            Custom requirements? <a href="https://wa.me/923188055850" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">WhatsApp karein</a> for a tailored quote.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pt-14 sm:pt-20 pb-14 sm:pb-20">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--primary-hover))] text-primary-foreground">
          <div
            aria-hidden
            className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-secondary/30 blur-2xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
          />
          <div className="relative px-5 py-10 sm:px-10 sm:py-14 text-center max-w-3xl mx-auto space-y-5">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
              eCommerce website banwana chahte hain?
            </h2>
            <p className="text-primary-foreground/90 leading-relaxed text-sm sm:text-base max-w-2xl mx-auto">
              Apne business ke liye ek professional, fast aur SEO-friendly
              website chahiye? Abhi rabta karein — hum ek mahine mein
              ready-to-use website bana ke dete hain.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
              <a
                href="https://wa.me/923188055850"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-whatsapp-cta"
                className="w-full sm:w-auto"
              >
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Contact on WhatsApp
                </Button>
              </a>
              <Link
                href="/contact"
                data-testid="link-contact-page"
                className="w-full sm:w-auto"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent text-primary-foreground border-primary-foreground/60 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  Contact Form
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WebDevelopment;
