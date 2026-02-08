import { type Product } from "@shared/schema";

// Mock data for Phase 1 - simulating database content
export const mockProducts: Product[] = [
  {
    id: 5,
    slug: "bluks-bx-301-power-bank-20000mah",
    name: "BLUKS BX-301 Power Bank 20000mAh",
    description: "FULL 20000 MAH WITH FAST CHARGING (ONE YEAR WARRANTY)",
    longDescription: "Never run out of power again with the BLUKS BX-301 Power Bank. This powerhouse features a genuine 20000mAh high-density lithium polymer battery, engineered to deliver multiple full charges for your smartphones, tablets, and other USB devices. Equipped with advanced 22.5W fast charging technology, it powers up your gadgets in record time. The sleek, portable design fits perfectly in your bag, while the intelligent digital display provides real-time information on the remaining battery percentage. With dual USB outputs, you can charge two devices simultaneously without compromising speed. Built with multiple safety protections against overcharging and short circuits, and backed by a solid one-year warranty, the BX-301 is the ultimate reliable companion for travel, work, and everyday adventures.",
    price: 4300,
    originalPrice: 5500,
    images: ["/images/bluks-bx-301-power-bank-20000mah-pakistan-priceoye-va1cz-500x_1770554316337.webp", "/images/bluks-bx-301-power-bank-20000mah-pakistan-priceoye-h0xeo-500x_1770554316338.webp"],
    category: "Power Banks",
    inStock: true,
    features: ["20000mAh Capacity", "Fast Charging Support", "One Year Warranty", "Digital Display", "Dual USB Output"],
    specifications: {
      capacity: "20000mAh",
      charging: "Fast Charging (22.5W)",
      warranty: "1 Year",
      model: "BX-301"
    }
  }
];

export const products = mockProducts;
