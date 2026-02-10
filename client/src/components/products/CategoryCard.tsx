import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { getOptimizedImageUrl } from "@/lib/cloudinary";

interface CategoryCardProps {
  name: string;
  image: string;
  count: number;
  slug: string;
}

export function CategoryCard({ name, image, count, slug }: CategoryCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="h-full"
    >
      <Link href={`/products?category=${slug}`}>
        <Card className="overflow-hidden cursor-pointer group hover-elevate border-none shadow-md h-full rounded-2xl relative">
          <CardContent className="p-0 relative aspect-[3/4]">
            <img
              src={getOptimizedImageUrl(image, { width: 600, height: 800, crop: 'fill' })}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white transform transition-transform duration-500 group-hover:translate-y-[-4px]">
              <div className="overflow-hidden">
                <h3 className="font-display text-xl sm:text-2xl font-bold mb-1 transform transition-transform duration-500 translate-y-0 group-hover:translate-y-[-2px]">{name}</h3>
              </div>
              <div className="flex items-center gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                <span className="h-[2px] w-4 bg-secondary rounded-full" />
                <p className="text-xs sm:text-sm font-medium tracking-wide uppercase text-secondary">{count} Products</p>
              </div>
            </div>
            
            {/* Subtle border overlay for professional finish */}
            <div className="absolute inset-0 border border-white/10 rounded-2xl pointer-events-none" />
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
