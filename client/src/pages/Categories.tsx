import { motion } from "framer-motion";
import { useCategories } from "@/hooks/use-categories";
import { CategoryCard } from "@/components/products/CategoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import SEO from "@/components/SEO";
import { getOptimizedImageUrl } from "@/lib/cloudinary";

// Fallback images from Home.tsx for known slugs if needed, 
// though CategoryCard uses the image passed to it.
import electronicsImage from "@assets/800b13d6-d66a-4bd3-a094-d8b8ccb22df6_(1)_1770740841232.png";
import homeKitchenImage from "@assets/ChatGPT_Image_Feb_10,_2026,_09_21_50_PM_(1)_1770740841233.png";
import fashionImage from "@assets/ChatGPT_Image_Feb_10,_2026,_09_19_08_PM_(1)_1770740841232.png";

const CATEGORY_IMAGES: Record<string, string> = {
  "electronics-gadgets": electronicsImage,
  "home-kitchen": homeKitchenImage,
  "fashion-accessories": fashionImage,
};

export default function Categories() {
  const { categories, parentCategories, isLoading } = useCategories();

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="All Categories" 
        description="Browse our wide range of product categories at PakCart."
      />

      <div className="container mx-auto px-4 py-16 sm:py-24">
        <header className="max-w-3xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-4 block">Our Collections</span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight">Browse by Category</h1>
            <div className="h-1 w-20 bg-secondary mx-auto mb-8 rounded-full" />
            <p className="text-lg text-muted-foreground leading-relaxed">
              Find exactly what you're looking for by exploring our curated collections of premium Pakistani products.
            </p>
          </motion.div>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-20">
            {parentCategories.length > 0 ? (
              parentCategories.map((parent) => {
                const subCats = categories.filter(c => c.parentCategoryId === parent.id);
                if (subCats.length === 0) return null;

                return (
                  <section key={parent.id} className="space-y-8">
                    <div className="flex items-center gap-4">
                      <h2 className="text-2xl font-bold font-display">{parent.name}</h2>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {subCats.map((category, index) => (
                        <motion.div
                          key={category.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                          <CategoryCard 
                            name={category.name}
                            slug={category.slug}
                            image={category.image || CATEGORY_IMAGES[category.slug] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800"}
                            count={0} // Count isn't easily available from useCategories hook directly without extra logic
                          />
                        </motion.div>
                      ))}
                    </div>
                  </section>
                );
              })
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <CategoryCard 
                      name={category.name}
                      slug={category.slug}
                      image={category.image || CATEGORY_IMAGES[category.slug] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800"}
                      count={0}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
