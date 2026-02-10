import { Link } from "wouter";
import { ArrowRight, Star, Truck, ShieldCheck, Clock } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { CategoryCard } from "@/components/products/CategoryCard";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-image.jpg";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { useQuery } from "@tanstack/react-query";
import { productFirestoreService } from "@/services/productFirestoreService";

export default function Home() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products", { limit: 4 }],
    queryFn: () => productFirestoreService.getAllProducts({ limit: 4 }).then(res => res.products),
  });

  // Featured products
  const featuredProducts = products || [];

  return (
    <div className="min-h-screen flex flex-col font-body">
      <SEO 
        title="Home" 
        description="Shop the best products at PakCart. Quality items delivered to your door in Pakistan."
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          {/* Background with overlay */}
          <div className="absolute inset-0 z-0">
             {/* Abstract luxury texture background */}
            <img 
              src={getOptimizedImageUrl(heroImage, { width: 1200, quality: 'auto:eco' })} 
              alt="PakCart Hero" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
            {/* Added a subtle overlay to make the text pop even more against the background */}
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="container relative z-10 px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
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
                <span className="text-[#2a7e2c]">Shop the</span> <span className="text-secondary italic">Best Deals</span> <span className="text-[#2a7e2c]">in Pakistan</span>
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
        <section className="py-16 sm:py-24 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="font-display text-4xl sm:text-5xl font-bold mb-6 tracking-tight">Shop by Category</h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Discover our curated collection of electronics, home essentials, and fashion accessories.
              </p>
            </div>
            
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 max-w-4xl mx-auto">
              <CategoryCard 
                name="Electronics" 
                slug="electronics-gadgets" 
                count={5} 
                image="https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800"
              />
              <CategoryCard 
                name="Home & Kitchen" 
                slug="home-kitchen" 
                count={5} 
                image="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800"
              />
              <CategoryCard 
                name="Fashion" 
                slug="fashion-accessories" 
                count={5} 
                image="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=800"
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
    </div>
  );
}
