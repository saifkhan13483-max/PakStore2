import { useState, useMemo } from "react";
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
import electronicsImage from "@assets/800b13d6-d66a-4bd3-a094-d8b8ccb22df6_(1)_1770740841232.png";
import homeKitchenImage from "@assets/ChatGPT_Image_Feb_10,_2026,_09_21_50_PM_(1)_1770740841233.png";
import fashionImage from "@assets/ChatGPT_Image_Feb_10,_2026,_09_19_08_PM_(1)_1770740841232.png";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { useProducts } from "@/hooks/use-products";

export default function Home() {
  const { data: allProducts, isLoading: isAllProductsLoading } = useProducts();

  const featuredProducts = useMemo(() => {
    return allProducts?.slice(0, 4) || [];
  }, [allProducts]);

  const newArrivals = useMemo(() => {
    return allProducts?.slice(0, 4) || [];
  }, [allProducts]);

  const isFeaturedLoading = isAllProductsLoading;
  const isNewArrivalsLoading = isAllProductsLoading;

  return (
    <div className="min-h-screen flex flex-col font-body">
      <SEO 
        title="Home" 
        description="Shop the best products at PakCart. Quality items delivered to your door in Pakistan."
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[45vh] sm:min-h-[60vh] flex items-center justify-center overflow-hidden">
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

          <div className="container relative z-10 px-4 sm:px-6 lg:px-8 py-8 lg:py-20">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl text-white"
            >
              <span className="inline-block px-4 py-1.5 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm text-[10px] sm:text-sm font-medium mb-4 sm:mb-6 uppercase tracking-wider">
                Premium Quality Products
              </span>
              <h1 className="font-display text-3xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
                <span className="text-[#2a7e2c]">Shop the</span> <span className="text-secondary italic">Best Deals</span> <span className="text-[#2a7e2c]">in Pakistan</span>
              </h1>
              <p className="text-sm sm:text-lg md:text-xl text-gray-200 mb-6 sm:mb-8 leading-relaxed max-w-lg">
                Quality Products, Delivered to Your Door. Experience the finest selection of artisanal treasures and daily essentials.
              </p>
              <div className="flex flex-row gap-3 sm:gap-4">
                <Link href="/products" className="flex-1">
                  <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full px-4 sm:px-8 h-12 sm:min-h-14 text-sm sm:text-lg font-bold w-full">
                    Shop Now
                  </Button>
                </Link>
                <Link href="/about" className="flex-1">
                  <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/40 backdrop-blur-md hover:bg-white/20 rounded-full px-4 sm:px-8 h-12 sm:min-h-14 text-sm sm:text-lg w-full">
                    Our Story
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-8 sm:py-12 border-b bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
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
        <section className="py-20 sm:py-28 bg-muted/20 overflow-hidden relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-4 block">Curated Collections</span>
                <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight text-foreground">Shop by Category</h2>
                <div className="h-1 w-20 bg-secondary mx-auto mb-8 rounded-full" />
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Explore our meticulously selected categories featuring artisanal craftsmanship and premium global brands tailored for your lifestyle.
                </p>
              </motion.div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <CategoryCard 
                  name="Electronics & Gadgets" 
                  slug="electronics-gadgets" 
                  count={5} 
                  image={electronicsImage}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <CategoryCard 
                  name="Home & Kitchen" 
                  slug="home-kitchen" 
                  count={5} 
                  image={homeKitchenImage}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <CategoryCard 
                  name="Fashion & Accessories" 
                  slug="fashion-accessories" 
                  count={5} 
                  image={fashionImage}
                />
              </motion.div>
            </div>
          </div>
          
          {/* Subtle background decoration */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
        </section>

        {/* New Arrivals */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-display text-4xl font-bold text-foreground mb-2">New Arrivals</h2>
                <div className="h-1.5 w-16 bg-secondary rounded-full" />
              </motion.div>
              <Link href="/products?sort=newest">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white rounded-full transition-all duration-300">
                  Shop New Collection
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {isNewArrivalsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-[300px] w-full rounded-2xl" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                ))
              ) : (
                newArrivals?.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))
              )}
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

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {isFeaturedLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-[300px] w-full rounded-2xl" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                ))
              ) : (
                featuredProducts?.map((product) => (
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
