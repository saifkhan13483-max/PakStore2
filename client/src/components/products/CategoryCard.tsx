import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface CategoryCardProps {
  name: string;
  image: string;
  count: number;
  slug: string;
}

export function CategoryCard({ name, image, count, slug }: CategoryCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/products?category=${slug}`}>
        <Card className="overflow-hidden cursor-pointer group hover-elevate border-none shadow-sm h-full">
          <CardContent className="p-0 relative aspect-[4/3]">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-3 sm:p-4 text-white">
              <h3 className="font-display text-sm sm:text-base font-bold mb-0.5">{name}</h3>
              <p className="text-[10px] sm:text-xs text-white/70">{count} Products</p>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
