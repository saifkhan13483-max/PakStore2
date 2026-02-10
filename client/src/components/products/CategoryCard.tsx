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
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-500" />
            <div className="relative z-10 p-6 text-white text-center sm:text-left">
              <div className="overflow-hidden">
                <h3 className="font-display text-3xl sm:text-4xl font-bold mb-3 drop-shadow-lg transform transition-transform duration-500 group-hover:translate-y-[-2px]">
                  {name}
                </h3>
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
