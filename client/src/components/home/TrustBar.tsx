import { motion } from "framer-motion";
import { Truck, ShieldCheck, Headphones, Star } from "lucide-react";

const trustItems = [
  {
    icon: Truck,
    title: "Free Delivery",
    description: "Free delivery on orders above Rs. 2000",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    description: "100% secure checkout guaranteed",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Round the clock customer support",
  },
  {
    icon: Star,
    title: "Top Rated",
    description: "Trusted by thousands of customers",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function TrustBar() {
  return (
    <section className="bg-white border-t border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {trustItems.map((item, index) => {
            const Icon = item.icon;
            const isLast = index === trustItems.length - 1;

            return (
              <motion.div
                key={item.title}
                variants={itemVariants}
                className={[
                  "flex flex-col items-center text-center px-4 py-4 lg:py-2 group",
                  "rounded-xl bg-green-50/50 m-2 lg:m-0 lg:bg-transparent lg:rounded-none",
                  !isLast ? "lg:border-r lg:border-gray-200" : "",
                ].join(" ")}
              >
                <div
                  className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center
                    transition-all duration-300
                    group-hover:bg-green-200 group-hover:scale-110"
                >
                  <Icon size={22} className="text-green-600" />
                </div>

                <h4 className="text-sm lg:text-base font-semibold text-gray-900 mt-3 transition-colors duration-300 group-hover:text-green-700">
                  {item.title}
                </h4>

                <p className="text-xs lg:text-sm text-gray-500 mt-1 leading-snug">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
