import { storage } from "../server/storage";
import { type InsertProduct } from "../shared/schema";

async function seed() {
  const product: InsertProduct = {
    name: "BLUKS BX-301 Power Bank 20000mAh",
    slug: "bluks-bx-301-power-bank-20000mah",
    description: "FULL 20000 MAH WITH FAST CHARGING. (ONE YEAR WARRANTY). LIMITED QUANTITY.",
    longDescription: "Experience high-speed charging with the BLUKS BX-301 Power Bank. This powerful 20000mAh portable charger ensures your devices stay powered up all day long. Featuring fast charging technology and a robust build, it is the perfect companion for travel and daily use.",
    price: 4300,
    originalPrice: 5500,
    category: "Power Banks",
    images: ["https://images.unsplash.com/photo-1609592424089-98319e716867?q=80&w=800&auto=format&fit=crop"],
    inStock: true,
    features: [
      "20000mAh High Capacity",
      "Fast Charging Support",
      "One Year Warranty",
      "Limited Quantity",
      "Multiple USB Ports",
      "LED Power Indicator"
    ],
    specifications: {
      capacity: "20000mAh",
      warranty: "1 Year",
      type: "Lithium Polymer",
      input: "5V/2.1A",
      output: "5V/2.1A (Max)"
    }
  };

  try {
    console.log("Seeding BLUKS BX-301 Power Bank...");
    await storage.createProduct(product);
    console.log("Successfully seeded product!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding product:", error);
    process.exit(1);
  }
}

seed();
