import { Link } from "wouter";
import { ArrowRight, Star, Truck, ShieldCheck, Clock } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { CategoryCard } from "@/components/products/CategoryCard";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/use-products";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function Home() {
  const { data: products, isLoading } = useProducts();

  // Featured products (take first 4)
  const featuredProducts = products?.slice(0, 4) || [];

  return (
    <div className="min-h-screen flex flex-col font-body">
      <SEO 
        title="Home" 
        description="Shop the best artisanal products in Pakistan at PakCart. From Kashmiri Pashminas to Multani Khussas, quality delivered to your door."
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background with overlay */}
          <div className="absolute inset-0 z-0">
             {/* Abstract luxury texture background */}
            <img 
              src="https://images.unsplash.com/photo-1548013146-72479768bada?w=1920&q=80" 
              alt="PakCart Hero" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            {/* Added a subtle overlay to make the text pop even more against the background */}
            <div className="absolute inset-0 bg-black/20" />
          </div>

          <div className="container relative z-10 px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl text-white"
            >
              <span className="inline-block px-4 py-1.5 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm text-sm font-medium mb-6">
                Premium Quality Products
              </span>
              <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Shop the <span className="text-secondary italic">Best Deals</span> in Pakistan
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-8 leading-relaxed max-w-lg">
                Quality Products, Delivered to Your Door. Experience the finest selection of artisanal treasures and daily essentials.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full px-8 h-12 sm:min-h-14 text-base sm:text-lg font-bold w-full sm:w-auto">
                    Shop Now
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/40 backdrop-blur-md hover:bg-white/20 rounded-full px-8 h-12 sm:min-h-14 text-base sm:text-lg w-full sm:w-auto">
                    Our Story
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-12 border-b bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-8">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Free Delivery</h4>
                  <p className="text-xs text-muted-foreground">Orders over Rs. 2000</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Secure Payment</h4>
                  <p className="text-xs text-muted-foreground">100% Protected</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">24/7 Support</h4>
                  <p className="text-xs text-muted-foreground">Always available</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Top Rated</h4>
                  <p className="text-xs text-muted-foreground">50k+ Happy customers</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Categories */}
        <section className="py-12 sm:py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Shop by Category</h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                Discover our diverse range of Pakistani artisanal products across multiple categories.
              </p>
            </div>
            
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              <CategoryCard 
                name="Apparel" 
                slug="Apparel" 
                count={1} 
                image="https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=800"
              />
              <CategoryCard 
                name="Home Decor" 
                slug="Home Decor" 
                count={1} 
                image="https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?auto=format&fit=crop&q=80&w=800"
              />
              <CategoryCard 
                name="Footwear" 
                slug="Footwear" 
                count={1} 
                image="https://images.unsplash.com/photo-1628149455678-16f37bc392f4?auto=format&fit=crop&q=80&w=800"
              />
              <CategoryCard 
                name="Food" 
                slug="Food" 
                count={1} 
                image="https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800"
              />
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="font-display text-4xl font-bold text-foreground mb-4">Best Sellers</h2>
                <p className="text-muted-foreground max-w-xl">
                  Discover our most coveted pieces, hand-picked for their exceptional quality and popularity.
                </p>
              </div>
              <Link href="/products">
                <Button variant="ghost" className="hidden md:flex gap-2 group">
                  View All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-[300px] w-full rounded-2xl" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                ))
              ) : (
                featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              )}
            </div>

            <div className="mt-12 text-center md:hidden">
              <Link href="/products">
                <Button size="lg" className="rounded-full w-full">
                  View All Products
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Newsletter / CTA */}
        <section className="py-16 sm:py-24 bg-primary text-white overflow-hidden relative">
          {/* Decorative pattern */}
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4 hidden sm:block">
            <svg width="600" height="600" viewBox="0 0 100 100">
               <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="currentColor" />
            </svg>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-3xl">
            <Star className="h-10 w-10 sm:h-12 sm:w-12 text-secondary mx-auto mb-6" />
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-6">Join the PakCart Family</h2>
            <p className="text-primary-foreground/80 text-base sm:text-lg mb-8 sm:mb-10">
              Subscribe to receive updates on new arrivals, exclusive artisan stories, and special offers.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="flex-1 px-5 py-3 sm:px-6 sm:py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-white/20 transition-all text-sm sm:text-base"
              />
              <Button type="submit" className="rounded-full px-8 py-5 sm:py-6 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold text-base sm:text-lg">
                Subscribe
              </Button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
