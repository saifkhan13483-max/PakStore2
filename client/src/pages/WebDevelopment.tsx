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
  X,
  Check,
  Users,
  BadgeCheck,
  Zap,
  TrendingDown,
  Tag,
  Timer,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
      icon: Phone,
      title: "Baat Karein",
      desc: "WhatsApp par apna idea share karein — kya sell karna chahte hain, konsa design pasand hai. Hum free mein guide karte hain.",
    },
    {
      n: "02",
      icon: Code2,
      title: "Hum Banate Hain",
      desc: "Hum aap ka website pure custom code mein design aur develop karte hain — bilkul aap ki zaroorat ke mutabiq.",
    },
    {
      n: "03",
      icon: Rocket,
      title: "Live Ho Jao",
      desc: "1 mahine mein aap ka website live ho jaata hai — hosting, business emails aur admin panel ke saath.",
    },
  ];

  const plans = [
    {
      name: "Standard",
      price: "38,000",
      originalPrice: "45,000",
      worldwideUsd: "$1,500 – $5,000",
      worldwidePkr: "4,20,000 – 14,00,000",
      tagline: "Most popular for growing brands",
      badge: "Most Popular",
      offerLabel: "Save Rs. 7,000",
      highlighted: true,
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
    },
    {
      name: "AI Pro",
      price: "99,000",
      originalPrice: "125,000",
      worldwideUsd: "$5,000 – $15,000",
      worldwidePkr: "14,00,000 – 42,00,000",
      tagline: "Smart store powered by AI",
      badge: "AI Powered",
      offerLabel: "Save Rs. 26,000",
      highlighted: false,
      features: [
        "Everything in Standard, plus:",
        "AI product recommendations",
        "AI chatbot for 24/7 customer support",
        "AI-powered smart search",
        "AI-generated product descriptions",
        "AI image enhancement & background removal",
        "AI sales insights & analytics",
        "Personalized shopping experience",
      ],
    },
  ];

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

  const trustStats = [
    { k: "1 Month", v: "Delivery" },
    { k: "One-Time", v: "Payment" },
    { k: "Lifetime", v: "Free Hosting" },
    { k: "100%", v: "Custom Code" },
  ];

  const whyUs = [
    {
      icon: BadgeCheck,
      title: "Koi Hidden Fees Nahi",
      desc: "Ek baar payment — phir koi monthly ya yearly fee nahi. Website aap ki, hosting aap ki, emails aap ke.",
    },
    {
      icon: Zap,
      title: "Super Fast Website",
      desc: "Custom code ki wajah se website bohat fast load hoti hai — jo Google ranking aur customer experience dono ke liye behtar hai.",
    },
    {
      icon: Users,
      title: "Pakistan-Focused Team",
      desc: "Hum Pakistan mein hain, aap ki language samajhte hain, aur aap ke business ki zarooraten jaante hain.",
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
              Pakistan ka #1 Custom eCommerce Development
            </span>
            <h1
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight"
              data-testid="text-webdev-title"
            >
              Apna Online Store
              <span className="block text-secondary line-through opacity-50 text-2xl sm:text-3xl md:text-4xl">Rs 45,000</span>
              <span className="block text-secondary">Sirf Rs 38,000 Mein 🎉</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Shopify ya WordPress ki monthly fees se chutkara payen. Hum aap ke liye
              fully custom, fast aur SEO-friendly eCommerce website banate hain —
              lifetime free hosting aur business emails ke saath. Sirf ek baar payment.
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
                  className="w-full sm:w-auto shadow-lg shadow-primary/20 gap-2"
                >
                  <SiWhatsapp className="h-4 w-4" />
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
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Live Demo Dekhein
                </Button>
              </a>
            </div>

            {/* Trust strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-8 max-w-2xl mx-auto">
              {trustStats.map((s) => (
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

      {/* Live Demo Banner */}
      <section className="bg-secondary/10 border-b">
        <div className="container mx-auto px-4 py-5 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-9 h-9 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <Globe className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Hamara khud ka store dekhein — yahi aap ke liye banate hain</p>
                <p className="text-xs text-muted-foreground">pakcart.store — live example of our custom eCommerce work</p>
              </div>
            </div>
            <a
              href="https://pakcart.store"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-full sm:w-auto"
            >
              <Button variant="secondary" size="sm" className="w-full sm:w-auto gap-2">
                <ExternalLink className="h-3.5 w-3.5" />
                Open Live Demo
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-8 sm:mb-10">
          <h2 className="font-display text-2xl sm:text-3xl font-bold">
            Hum Kyun Behtar Hain?
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Sirf website nahi — aap ko ek complete, long-term solution milta hai.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {whyUs.map((w) => (
            <div
              key={w.title}
              className="flex flex-col items-center text-center p-5 rounded-xl border bg-card shadow-sm gap-3"
            >
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                <w.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base">{w.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="bg-muted/40 border-y">
        <div className="container mx-auto px-4 py-14 sm:py-20">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold">
              Aap Ko Kya Milega?
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
        </div>
      </section>

      {/* Process */}
      <section className="container mx-auto px-4 py-14 sm:py-20">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold">
            Kaam Kaise Hota Hai?
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Sirf 3 simple steps — aur aap ka store live.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-10 max-w-5xl mx-auto">
          {steps.map((s, idx) => (
            <Card key={s.n} className="relative h-full">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-3 mb-1">
                  <div className="font-display text-3xl sm:text-4xl font-bold text-primary/20">
                    {s.n}
                  </div>
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <s.icon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>
              </CardContent>
              {idx < steps.length - 1 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="h-5 w-5 text-muted-foreground/40" />
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Comparison: Others vs PakCart */}
      <section className="bg-muted/40 border-y">
        <div className="container mx-auto px-4 py-14 sm:py-20">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card px-3 py-1 text-xs font-medium text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Comparison
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold">
              Others vs PakCart
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Shopify, WordPress aur Wix ke muqable PakCart kyun behtar aur sasta hai — ek nazar mein.
            </p>
          </div>

          <div className="mt-10 max-w-5xl mx-auto">
            {(() => {
              const rows = [
                {
                  label: "Payment Model",
                  others: "Monthly subscription (forever)",
                  pakcart: "One-time payment, lifetime ownership",
                },
                {
                  label: "Hosting Cost",
                  others: "Paid monthly / yearly",
                  pakcart: "Lifetime free fast hosting",
                },
                {
                  label: "Business Emails",
                  others: "Extra paid (per mailbox / month)",
                  pakcart: "Lifetime free business emails",
                },
                {
                  label: "Customization",
                  others: "Limited to themes & plugins",
                  pakcart: "Unlimited — built to your exact needs",
                },
                {
                  label: "Speed & Performance",
                  others: "Slow due to heavy themes & plugins",
                  pakcart: "Fast & optimized hand-coded site",
                },
                {
                  label: "SEO Control",
                  others: "Restricted by platform structure",
                  pakcart: "Full SEO control + sitemap built-in",
                },
                {
                  label: "Plugin Dependency",
                  others: "Needs many paid plugins",
                  pakcart: "Zero plugins — everything built-in",
                },
                {
                  label: "Transaction Fees",
                  others: "Extra fees on each sale",
                  pakcart: "No transaction fees, ever",
                },
                {
                  label: "Long-Term Cost",
                  others: "Keeps growing every month",
                  pakcart: "Pay once — save lakhs over the years",
                },
              ];

              return (
                <Card
                  className="overflow-hidden shadow-sm"
                  data-testid="card-comparison"
                >
                  {/* Header row */}
                  <div className="grid grid-cols-3 bg-muted/60 border-b">
                    <div className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Feature
                    </div>
                    <div className="px-3 sm:px-6 py-4 text-center border-l">
                      <div className="font-display font-semibold text-sm sm:text-base text-foreground">
                        Others
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                        Shopify · WordPress · Wix
                      </div>
                    </div>
                    <div className="px-3 sm:px-6 py-4 text-center border-l bg-primary/5">
                      <div className="font-display font-semibold text-sm sm:text-base text-primary">
                        PakCart
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                        Custom Web Development
                      </div>
                    </div>
                  </div>

                  {/* Rows */}
                  {rows.map((r, i) => (
                    <div
                      key={r.label}
                      className={`grid grid-cols-3 ${
                        i !== rows.length - 1 ? "border-b" : ""
                      }`}
                      data-testid={`row-comparison-${i}`}
                    >
                      <div className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-medium text-foreground flex items-center">
                        {r.label}
                      </div>
                      <div className="px-3 sm:px-6 py-4 border-l flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                        <X className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                        <span>{r.others}</span>
                      </div>
                      <div className="px-3 sm:px-6 py-4 border-l bg-primary/5 flex items-start gap-2 text-xs sm:text-sm text-foreground">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="font-medium">{r.pakcart}</span>
                      </div>
                    </div>
                  ))}
                </Card>
              );
            })()}

            <p className="text-center text-xs sm:text-sm text-muted-foreground mt-6">
              Saaf farq — kam kharcha, zyada control aur lifetime value.{" "}
              <a
                href="https://wa.me/923188055850"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
                data-testid="link-whatsapp-comparison"
              >
                WhatsApp karein
              </a>
              .
            </p>
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
            <a
              href="https://wa.me/923188055850"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block pt-2"
            >
              <Button className="gap-2">
                <SiWhatsapp className="h-4 w-4" />
                Get Started on WhatsApp
              </Button>
            </a>
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

          {/* Limited-Time Offer Banner */}
          <div className="mt-10 max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white px-5 py-4 sm:px-8 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div aria-hidden className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Timer className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm sm:text-base">🎉 Limited Time Offer — Abhi Order Karein!</p>
                  <p className="text-white/80 text-xs sm:text-sm">Special launch discount — original prices par wapas jaane se pehle book karein</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Tag className="h-4 w-4 text-yellow-300" />
                <span className="font-bold text-yellow-300 text-sm sm:text-base">Up to Rs. 26,000 OFF</span>
              </div>
            </div>
          </div>

          {/* Worldwide Price Comparison */}
          <div className="mt-6 max-w-4xl mx-auto">
            <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm sm:text-base text-foreground">Duniya mein yahi kaam kitne ka hota hai?</span>
                  <span className="ml-auto text-[10px] sm:text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">Worldwide Market Rate</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {plans.map((plan) => (
                    <div key={plan.name} className="flex flex-col gap-1.5 rounded-xl bg-background border p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-foreground">{plan.name} Store</span>
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">Worldwide:</span>
                        <span className="font-bold text-destructive text-sm">{plan.worldwideUsd} USD</span>
                        <span className="text-xs text-muted-foreground">≈ Rs. {plan.worldwidePkr}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">PakCart:</span>
                        <span className="font-bold text-primary text-sm">Rs. {plan.price}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 text-[10px] font-semibold px-2 py-0.5">
                          <TrendingDown className="h-2.5 w-2.5" />
                          90%+ Sasta
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground mt-3 text-center">
                  * Worldwide rates based on Upwork, Fiverr & agency market data (2024–25). PakCart gives you the same quality at a fraction of the cost.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid gap-6 md:gap-8 md:grid-cols-2 max-w-4xl mx-auto items-stretch">
            {plans.map((plan) => {
              const slug = plan.name.toLowerCase().replace(/\s+/g, "-");
              const isAi = plan.name === "AI Pro";
              return (
                <Card
                  key={plan.name}
                  className={`relative shadow-xl flex flex-col ${
                    plan.highlighted
                      ? "border-primary border-2"
                      : "border-secondary border-2"
                  }`}
                  data-testid={`card-plan-${slug}`}
                >
                  {/* Top badge */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shadow ${
                        plan.highlighted
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {isAi ? (
                        <Sparkles className="h-3.5 w-3.5" />
                      ) : (
                        <Star className="h-3.5 w-3.5 fill-current" />
                      )}
                      {plan.badge}
                    </span>
                  </div>

                  {/* Offer ribbon */}
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 shadow">
                      <Tag className="h-2.5 w-2.5" />
                      {plan.offerLabel}
                    </span>
                  </div>

                  <CardContent className="p-6 sm:p-8 flex flex-col flex-1">
                    <div className="space-y-1">
                      <h3 className="font-display font-bold text-xl">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {plan.tagline}
                      </p>
                    </div>

                    <div className="mt-5 pb-5 border-b">
                      {/* Original price crossed out */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-muted-foreground line-through">Rs. {plan.originalPrice}</span>
                        <span className="text-[10px] font-semibold text-red-500 bg-red-50 rounded px-1.5 py-0.5">Limited Offer</span>
                      </div>
                      {/* Discounted price */}
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-medium text-muted-foreground">
                          Rs.
                        </span>
                        <span
                          className="font-display text-4xl sm:text-5xl font-bold text-foreground"
                          data-testid={`text-price-${slug}`}
                        >
                          {plan.price}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        One-time payment — koi bhi recurring charge nahi
                      </p>
                      {/* Worldwide comparison mini */}
                      <div className="mt-3 rounded-lg bg-muted/60 px-3 py-2 flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-[11px] text-muted-foreground">Worldwide yahi kaam: <span className="font-semibold text-destructive">{plan.worldwideUsd} USD</span></span>
                      </div>
                    </div>

                    <ul className="space-y-3 py-5 flex-1">
                      {plan.features.map((f, i) => {
                        const isHeader = f.endsWith(":");
                        return (
                          <li
                            key={i}
                            className={`flex items-start gap-3 text-sm ${
                              isHeader ? "pt-1" : ""
                            }`}
                          >
                            {isHeader ? (
                              <Sparkles className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                            ) : (
                              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            )}
                            <span
                              className={
                                isHeader
                                  ? "text-foreground font-semibold"
                                  : "text-foreground"
                              }
                            >
                              {f}
                            </span>
                          </li>
                        );
                      })}
                    </ul>

                    <a
                      href="https://wa.me/923188055850"
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`link-plan-${slug}`}
                      className="mt-auto"
                    >
                      <Button
                        className="w-full gap-2"
                        size="lg"
                        variant={plan.highlighted ? "default" : "secondary"}
                      >
                        <SiWhatsapp className="h-4 w-4" />
                        Get Started
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <p className="text-center text-xs sm:text-sm text-muted-foreground mt-8">
            Custom requirements?{" "}
            <a
              href="https://wa.me/923188055850"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              WhatsApp karein
            </a>{" "}
            for a tailored quote.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-14 sm:py-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center space-y-3 mb-8 sm:mb-10">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold">
              Aksar Pooche Jaane Wale Sawalaat
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Koi sawal ho to WhatsApp par bhi pooch sakte hain.
            </p>
          </div>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border rounded-xl px-4 sm:px-5 shadow-sm"
                data-testid={`faq-item-${i}`}
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 text-xs sm:text-sm py-3 sm:py-4 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground pb-3 sm:pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pt-0 pb-14 sm:pb-20">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-[hsl(var(--primary-hover))] text-primary-foreground">
          {/* Background blobs */}
          <div aria-hidden className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-secondary/25 blur-3xl" />
          <div aria-hidden className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

          <div className="relative px-5 py-10 sm:px-10 sm:py-14 max-w-4xl mx-auto">

            {/* Top badge */}
            <div className="flex justify-center mb-5 sm:mb-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-4 py-1.5 text-xs font-semibold text-primary-foreground backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-secondary" />
                Free consultation — koi commitment nahi
              </span>
            </div>

            {/* Heading */}
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-3">
                Apna eCommerce Store Sirf{" "}
                <span className="text-secondary/50 line-through text-xl sm:text-2xl">Rs 45,000</span>{" "}
                <span className="text-secondary">Rs 38,000</span> Mein 🎉
              </h2>
              <p className="text-primary-foreground/80 leading-relaxed text-sm sm:text-base max-w-xl mx-auto">
                Limited time offer — ek baar payment karein, phir lifetime free hosting, free business emails,
                aur full admin panel. Koi monthly fees nahi, kabhi nahi.
              </p>
            </div>

            {/* Quick highlights row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-7 sm:mb-8 max-w-2xl mx-auto">
              {[
                { icon: Clock, label: "1 Month Delivery" },
                { icon: Wallet, label: "One-Time Payment" },
                { icon: Server, label: "Free Lifetime Hosting" },
                { icon: BadgeCheck, label: "No Hidden Fees" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-1.5 rounded-xl bg-white/10 border border-white/15 px-3 py-3 text-center backdrop-blur"
                >
                  <item.icon className="h-4 w-4 text-secondary" />
                  <span className="text-[11px] sm:text-xs font-medium text-primary-foreground/90 leading-tight">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
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
                  className="w-full sm:w-auto gap-2 shadow-lg shadow-black/20"
                >
                  <SiWhatsapp className="h-4 w-4" />
                  WhatsApp — +92 318 8055850
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
                  className="w-full sm:w-auto bg-transparent text-primary-foreground border-white/40 hover:bg-white/10 hover:text-primary-foreground gap-2"
                >
                  Contact Form
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Reassurance line */}
            <p className="text-center text-xs text-primary-foreground/50 mt-5">
              Free mein baat karein — koi advance payment ya commitment nahi
            </p>

          </div>
        </div>
      </section>
    </div>
  );
};

export default WebDevelopment;
