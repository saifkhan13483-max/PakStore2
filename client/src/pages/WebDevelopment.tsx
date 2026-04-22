import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Code2, ShieldCheck, Server, Mail as MailIcon, Search, Wallet, Clock, CheckCircle2, Globe, ExternalLink, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const WebDevelopment = () => {
  const features = [
    { icon: Code2, title: "Pure Custom Coding", desc: "No Shopify, no WordPress dependency. Fully hand-coded websites built from scratch." },
    { icon: Wallet, title: "One-Time Payment", desc: "No monthly subscription fees. Pay once and own your website forever." },
    { icon: Server, title: "Lifetime Free Hosting", desc: "Fast and reliable hosting included for life — no recurring hosting bills." },
    { icon: MailIcon, title: "Free Business Emails", desc: "Lifetime free professional emails like contact@yourdomain for your business." },
    { icon: ShieldCheck, title: "Admin Panel Included", desc: "Full admin dashboard to manage products, orders, customers and content." },
    { icon: Search, title: "SEO Friendly", desc: "Built with SEO best practices so your store ranks well on Google." },
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

  return (
    <div className="bg-background">
      <Helmet>
        <title>Custom eCommerce Web Development in Pakistan | PakCart</title>
        <meta
          name="description"
          content="Get a fully custom-coded eCommerce website with admin panel, lifetime free hosting and business emails — one-time payment, no Shopify or WordPress subscriptions."
        />
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#FFF9E5] to-background border-b">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <p className="text-sm font-medium tracking-wide text-[#D4A017] uppercase">
              Assalam-o-Alaikum
            </p>
            <h1
              className="font-display text-3xl md:text-5xl font-bold leading-tight"
              data-testid="text-webdev-title"
            >
              Custom eCommerce Websites — Built With Pure Code
            </h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              Main ek professional web developer hoon. Specially custom eCommerce
              websites develop karta hoon — Shopify ya WordPress par depend kiye
              baghair, pure coding ke zariye. Iska sab se bara faida yeh hai ke
              aap ko Shopify waghera ki monthly subscription fees nahi deni
              parti.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href="https://wa.me/923188055850"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-whatsapp-webdev"
              >
                <Button size="lg" className="bg-[#D4A017] hover:bg-[#b8890f] text-white">
                  <Phone className="h-4 w-4 mr-2" />
                  WhatsApp — +92 318 8055850
                </Button>
              </a>
              <a
                href="https://pakcart.store"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-demo-pakcart"
              >
                <Button size="lg" variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  See Live Demo — pakcart.store
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Pitch */}
      <section className="container mx-auto px-4 py-14">
        <div className="max-w-3xl mx-auto space-y-5 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold">
            Aap ko kya milega?
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Main aap ko fully functional eCommerce website banake doon ga — jis
            mein admin panel, lifetime free aur fast hosting, aur tamam zaroori
            features shamil hon ge. Aur yeh sab sirf{" "}
            <span className="font-semibold text-foreground">one-time payment</span>{" "}
            par hoga.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
          {features.map((f) => (
            <Card
              key={f.title}
              className="hover-elevate"
              data-testid={`card-feature-${f.title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <CardContent className="p-6 space-y-3">
                <div className="h-11 w-11 rounded-lg bg-[#FFF9E5] text-[#D4A017] flex items-center justify-center">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* What's included */}
      <section className="bg-muted/30 border-y">
        <div className="container mx-auto px-4 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start max-w-5xl mx-auto">
            <div className="space-y-4">
              <h2 className="font-display text-2xl md:text-3xl font-bold">
                Package Mein Kya Shamil Hai?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Sirf ek mahine mein, main aap ke liye fully professional,
                ready-to-use, aur SEO-friendly eCommerce website tayar kar doon
                ga — saath mein lifetime free hosting aur business emails bhi.
              </p>
              <div className="flex items-center gap-3 pt-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-[#D4A017]" />
                <span>Delivery time: 1 month</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Globe className="h-4 w-4 text-[#D4A017]" />
                <span>Live example: pakcart.store</span>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {includes.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-sm"
                      data-testid={`text-include-${idx}`}
                    >
                      <CheckCircle2 className="h-5 w-5 text-[#D4A017] shrink-0 mt-0.5" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <h2 className="font-display text-2xl md:text-3xl font-bold">
            eCommerce website banwana chahte hain?
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Agar aap apne business ke liye ek professional eCommerce website
            banwana chahte hain, to mujh se rabta karein. Main aap ko ek mahine
            mein ready-to-use website bana ke doon ga.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="https://wa.me/923188055850"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-whatsapp-cta"
            >
              <Button size="lg" className="bg-[#D4A017] hover:bg-[#b8890f] text-white">
                <Phone className="h-4 w-4 mr-2" />
                Contact on WhatsApp
              </Button>
            </a>
            <Link href="/contact" data-testid="link-contact-page">
              <Button size="lg" variant="outline">
                <MailIcon className="h-4 w-4 mr-2" />
                Contact Form
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WebDevelopment;
