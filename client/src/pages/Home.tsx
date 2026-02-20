import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, Star, Truck, ShieldCheck, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { CategoryCard } from "@/components/products/CategoryCard";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import heroImage from "@/assets/hero-image.jpg";
import electronicsImage from "@assets/800b13d6-d66a-4bd3-a094-d8b8ccb22df6_(1)_1770740841232.png";
import homeKitchenImage from "@assets/ChatGPT_Image_Feb_10,_2026,_09_21_50_PM_(1)_1770740841233.png";
import fashionImage from "@assets/ChatGPT_Image_Feb_10,_2026,_09_19_08_PM_(1)_1770740841232.png";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { useProducts } from "@/hooks/use-products";

const HERO_SLIDES = [
  {
    id: 1,
    title: "Shop the Best Deals in Pakistan",
    subtitle: "Premium Quality Products",
    description: "Quality Products, Delivered to Your Door. Experience the finest selection of artisanal treasures and daily essentials.",
    image: heroImage,
    primaryBtn: { text: "Shop Now", link: "/products" },
    secondaryBtn: { text: "Our Story", link: "/about" },
    accentColor: "#2a7e2c"
  },
  {
    id: 2,
    title: "Latest Electronics & Gadgets",
    subtitle: "Innovation at Your Fingertips",
    description: "Explore the newest smartphones, laptops, and smart home devices with official warranty and nationwide delivery.",
    image: electronicsImage,
    primaryBtn: { text: "Explore Gadgets", link: "/products?category=electronics-gadgets" },
    secondaryBtn: { text: "Learn More", link: "/about" },
    accentColor: "#3b82f6"
  },
  {
    id: 3,
    title: "Elevate Your Home Decor",
    subtitle: "Artisanal Home Solutions",
    description: "Transform your living space with our hand-picked collection of modern furniture and artistic decorative pieces.",
    image: homeKitchenImage,
    primaryBtn: { text: "Shop Decor", link: "/products?category=home-kitchen" },
    secondaryBtn: { text: "View Catalog", link: "/products" },
    accentColor: "#f59e0b"
  },
  {
    id: 4,
    title: "Step Into Style & Luxury",
    subtitle: "Fashion & Accessories",
    description: "Discover the latest trends in luxury fashion and accessories designed to make you stand out from the crowd.",
    image: fashionImage,
    primaryBtn: { text: "Shop Fashion", link: "/products?category=fashion-accessories" },
    secondaryBtn: { text: "Trending Now", link: "/products" },
    accentColor: "#ec4899"
  }
];

export default function Home() {
  const { data: allProducts, isLoading: isAllProductsLoading } = useProducts();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const featuredProducts = useMemo(() => {
    return allProducts?.slice(0, 4) || [];
  }, [allProducts]);

  const newArrivals = useMemo(() => {
    return allProducts?.slice(0, 4) || [];
  }, [allProducts]);

  const isFeaturedLoading = isAllProductsLoading;
  const isNewArrivalsLoading = isAllProductsLoading;

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  return (
    <div className="min-h-screen flex flex-col font-body">
      <SEO 
        title="Home" 
        description="Shop the best products at PakCart. Quality items delivered to your door in Pakistan."
      />

      <main className="flex-1">
        {/* Hero Section with Custom Slider */}
        <section className="relative min-h-[60vh] sm:min-h-[70vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden bg-black">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 z-0"
            >
              <img 
                src={getOptimizedImageUrl(HERO_SLIDES[currentSlide].image, { width: 1920, quality: 'auto:best' })} 
                alt={HERO_SLIDES[currentSlide].title} 
                className="w-full h-full object-cover scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-transparent sm:from-black/90 sm:via-black/60" />
              <div className="absolute inset-0 bg-black/40 sm:bg-black/20" />
            </motion.div>
          </AnimatePresence>

          <div className="container relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-2xl text-white text-center sm:text-left mx-auto sm:mx-0"
              >
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-block px-4 py-1.5 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm text-[10px] sm:text-xs md:text-sm font-medium mb-4 sm:mb-6 uppercase tracking-widest shadow-lg"
                >
                  {HERO_SLIDES[currentSlide].subtitle}
                </motion.span>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-[1.1] tracking-tight"
                >
                  {currentSlide === 0 ? (
                    <>
                      <span className="text-[#4ade80]">Shop the</span> <span className="text-secondary italic">Best Deals</span> <span className="text-[#4ade80]">in Pakistan</span>
                    </>
                  ) : (
                    <span className="drop-shadow-2xl">{HERO_SLIDES[currentSlide].title}</span>
                  )}
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm sm:text-lg md:text-xl text-gray-200 mb-8 sm:mb-10 leading-relaxed max-w-lg mx-auto sm:mx-0 drop-shadow-md"
                >
                  {HERO_SLIDES[currentSlide].description}
                </motion.p>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-row gap-3 sm:gap-4 items-center sm:items-start"
                >
                  <Link href={HERO_SLIDES[currentSlide].primaryBtn.link} className="flex-1 sm:flex-none">
                    <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full px-6 sm:px-10 h-12 sm:h-14 text-sm sm:text-base font-bold w-full shadow-xl transition-transform hover:scale-105 active:scale-95 whitespace-nowrap">
                      {HERO_SLIDES[currentSlide].primaryBtn.text}
                    </Button>
                  </Link>
                  <Link href={HERO_SLIDES[currentSlide].secondaryBtn.link} className="flex-1 sm:flex-none">
                    <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/40 backdrop-blur-md hover:bg-white/20 rounded-full px-6 sm:px-10 h-12 sm:h-14 text-sm sm:text-base w-full transition-transform hover:scale-105 active:scale-95 whitespace-nowrap">
                      {HERO_SLIDES[currentSlide].secondaryBtn.text}
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slider Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4">
            <div className="flex gap-2">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1 rounded-full transition-all duration-500 shadow-sm ${idx === currentSlide ? 'w-8 bg-secondary' : 'w-1.5 bg-white/30 hover:bg-white/50'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={prevSlide}
                className="p-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white/20 transition-all shadow-lg group active:scale-90"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              </button>
              <button 
                onClick={nextSlide}
                className="p-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white/20 transition-all shadow-lg group active:scale-90"
                aria-label="Next slide"
              >
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-8 sm:py-12 border-b bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                  <Truck className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[10px] sm:text-sm">Free Delivery</h4>
                  <p className="text-[8px] sm:text-xs text-muted-foreground whitespace-nowrap">Orders over Rs. 5000</p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                  <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[10px] sm:text-sm">Secure Payment</h4>
                  <p className="text-[8px] sm:text-xs text-muted-foreground whitespace-nowrap">100% Protected</p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[10px] sm:text-sm">24/7 Support</h4>
                  <p className="text-[8px] sm:text-xs text-muted-foreground whitespace-nowrap">Always available</p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[10px] sm:text-sm">Top Rated</h4>
                  <p className="text-[8px] sm:text-xs text-muted-foreground whitespace-nowrap">50k+ Happy customers</p>
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
                  name="Home & Decor" 
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
      </main>
    </div>
  );
}
