import logoImg from "@/assets/logo.png";
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, Globe, Heart } from "lucide-react";
import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Company Information */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <img src={logoImg} alt="PakCart" className="h-12 w-auto" />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Bringing the finest craftsmanship of Pakistan to your doorstep. Authentic, premium, and ethically sourced Pakistani artisanal products.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="p-2 rounded-full bg-secondary/10 text-secondary hover:bg-secondary hover:text-white transition-all duration-300" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-secondary/10 text-secondary hover:bg-secondary hover:text-white transition-all duration-300" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-secondary/10 text-secondary hover:bg-secondary hover:text-white transition-all duration-300" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-lg">Quick Links</h4>
            <nav className="flex flex-col gap-3">
              <Link href="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors">Shop All Products</Link>
              <Link href="/categories" className="text-sm text-muted-foreground hover:text-primary transition-colors">Categories</Link>
              <Link href="/offers" className="text-sm text-muted-foreground hover:text-primary transition-colors">Special Offers</Link>
              <Link href="/new-arrivals" className="text-sm text-muted-foreground hover:text-primary transition-colors">New Arrivals</Link>
            </nav>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-lg">Customer Service</h4>
            <nav className="flex flex-col gap-3">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link>
              <Link href="/shipping" className="text-sm text-muted-foreground hover:text-primary transition-colors">Shipping Information</Link>
              <Link href="/returns" className="text-sm text-muted-foreground hover:text-primary transition-colors">Returns & Exchanges</Link>
              <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">FAQs</Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms & Conditions</Link>
            </nav>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-lg">Contact Us</h4>
                <ul className="space-y-4 text-sm">
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="h-5 w-5 text-secondary shrink-0" />
                    <span>+92 300 1234567</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="h-5 w-5 text-secondary shrink-0" />
                    <span>hello@pakcart.store</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <Globe className="h-5 w-5 text-secondary shrink-0" />
                    <span>www.pakcart.store</span>
                  </li>
                </ul>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} PakCart. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>in Pakistan</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
