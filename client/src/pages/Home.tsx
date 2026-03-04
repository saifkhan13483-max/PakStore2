import { useState, useMemo, useEffect, useRef } from "react";
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
import electronicsImage from "@assets/800b13d6-d66a-4bd3-a094-d8b8ccb22df6_(1)_1772464413257.png";
import homeKitchenImage from "@assets/ChatGPT_Image_Feb_10,_2026,_09_21_50_PM_(1)_1770740841233.png";
import fashionImage from "@assets/ChatGPT_Image_Feb_10,_2026,_09_19_08_PM_(1)_1770740841232.png";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { useProducts } from "@/hooks/use-products";
import { homepageSlideService } from "@/services/homepageSlideService";
import { type HomepageSlide } from "@shared/homepage-slide-schema";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const { data: allProducts, isLoading: isAllProductsLoading } = useProducts();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStart = useRef<number | null>(null);

  const { data: slides, isLoading: isHeroLoading } = useQuery<HomepageSlide[]>({
    queryKey: ["/api/homepage-slides", "active"],
    queryFn: () => homepageSlideService.getActiveSlides(),
  });

  const HERO_SLIDES = useMemo(() => {
    if (slides && slides.length > 0) {
      return slides;
    }
    return [];
  }, [slides]);

  useEffect(() => {
    if (HERO_SLIDES.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500); // Transitions automatically every 4-5 seconds
    return () => clearInterval(timer);
  }, [HERO_SLIDES.length, isPaused]);

  const featuredProducts = useMemo(() => {
    return allProducts?.filter(p => p.labels?.includes("Best Seller")).slice(0, 5) || [];
  }, [allProducts]);

  const likedProducts = useMemo(() => {
    return allProducts?.filter(p => p.labels?.includes("Liked")).slice(0, 5) || [];
  }, [allProducts]);

  const newArrivals = useMemo(() => {
    return allProducts?.slice(0, 5) || [];
  }, [allProducts]);

  const isFeaturedLoading = isAllProductsLoading;
  const isLikedLoading = isAllProductsLoading;
  const isNewArrivalsLoading = isAllProductsLoading;

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [HERO_SLIDES.length]);

  return (
    <div className="min-h-screen flex flex-col font-body overflow-x-hidden">
      <SEO 
        title="Home" 
        description="Shop the best products at PakCart. Quality items delivered to your door in Pakistan."
      />

      <main className="flex-1">
        {/* Hero Section with Custom Slider */}
        <section 
          className="relative w-full aspect-[1920/700] min-h-[250px] sm:min-h-[400px] overflow-hidden bg-black group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={(e) => { touchStart.current = e.touches[0].clientX }}
          onTouchEnd={(e) => {
            if (touchStart.current === null) return;
            const touchEnd = e.changedTouches[0].clientX;
            const diff = touchStart.current - touchEnd;
            if (Math.abs(diff) > 50) {
              if (diff > 0) nextSlide();
              else prevSlide();
            }
            touchStart.current = null;
          }}
          tabIndex={0}
        >
          {isHeroLoading ? (
            <Skeleton className="w-full h-full" />
          ) : HERO_SLIDES.length > 0 ? (
            <>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0"
            >
                  <picture>
                    {HERO_SLIDES[currentSlide].image_webp_url && (
                      <source srcSet={HERO_SLIDES[currentSlide].image_webp_url} type="image/webp" />
                    )}
                    <img 
                      src={HERO_SLIDES[currentSlide].image_url} 
                      alt={`Slide ${currentSlide + 1}`}
                      className="w-full h-full object-cover"
                      loading={currentSlide === 0 ? "eager" : "lazy"}
                    />
                  </picture>
                </motion.div>
              </AnimatePresence>

              {/* Slider Controls */}
              {HERO_SLIDES.length > 1 && (
                <>
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {HERO_SLIDES.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                  <div className="absolute inset-y-0 left-4 right-4 flex items-center justify-between pointer-events-none">
                    <button 
                      onClick={prevSlide}
                      className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all pointer-events-auto opacity-0 group-hover:opacity-100 hidden sm:block"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button 
                      onClick={nextSlide}
                      className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all pointer-events-auto opacity-0 group-hover:opacity-100 hidden sm:block"
                      aria-label="Next slide"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/50">
              No active slides available
            </div>
          )}
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
              <Link href="/new-arrivals">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white rounded-full transition-all duration-300">
                  Shop New Collection
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
              {isNewArrivalsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
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

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
              {isFeaturedLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
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

        {/* Liked Products Section */}
        {likedProducts.length > 0 && (
          <section className="py-20 bg-muted/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="font-display text-4xl font-bold text-foreground mb-2">Most Liked</h2>
                  <div className="h-1.5 w-16 bg-pink-500 rounded-full" />
                </motion.div>
                <Link href="/products">
                  <Button variant="outline" className="border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white rounded-full transition-all duration-300">
                    Explore Liked Items
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
                {isLikedLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="h-[300px] w-full rounded-2xl" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  ))
                ) : (
                  likedProducts?.map((product, index) => (
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
        )}
      </main>
    </div>
  );
}
