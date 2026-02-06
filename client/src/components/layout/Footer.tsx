import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from "lucide-react";
import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-primary/5 border-t border-primary/10 pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-display text-2xl font-bold text-primary">
              Noor<span className="text-secondary">Bazaar</span>
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Bringing the finest craftsmanship of Pakistan to your doorstep. Authentic, premium, and ethically sourced.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="text-primary hover:text-secondary transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-primary hover:text-secondary transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="text-primary hover:text-secondary transition-colors"><Twitter className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-6">Shop</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/products" className="text-muted-foreground hover:text-primary transition-colors">All Products</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-6">Support</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-6">Contact</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="h-5 w-5 text-secondary shrink-0" />
                <span>123 Liberty Market, Gulberg III, Lahore, Pakistan</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-5 w-5 text-secondary shrink-0" />
                <span>+92 300 1234567</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-5 w-5 text-secondary shrink-0" />
                <span>hello@noorbazaar.pk</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} NoorBazaar. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
