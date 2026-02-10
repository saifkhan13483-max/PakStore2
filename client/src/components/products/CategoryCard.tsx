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
          <CardContent className="p-0 relative aspect-[16/9] sm:aspect-[4/3] flex flex-col justify-end">
            <img 
              src={image} 
              alt={name} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:via-black/50 transition-colors duration-500" />
            <div className="relative z-10 p-6 text-white">
              <div className="overflow-hidden">
                <h3 className="font-display text-2xl sm:text-3xl font-bold mb-3 transform transition-transform duration-500 group-hover:translate-y-[-2px]">
                  {name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-[2px] w-6 bg-secondary rounded-full" />
                <p className="text-sm sm:text-base font-bold tracking-wider uppercase text-secondary">
                  {count} PRODUCTS
                </p>
              </div>
            </div>
            
            {/* Professional glass effect corner */}
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
               <div className="w-12 h-12 rounded-full border-2 border-white/30" />
            </div>

            {/* Subtle border overlay for professional finish */}
            <div className="absolute inset-0 border border-white/10 rounded-2xl pointer-events-none" />
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
