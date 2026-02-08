import { type Product } from "@shared/schema";

// Mock data for Phase 1 - simulating database content
export const mockProducts: Product[] = [
  {
    id: 5,
    slug: "bluks-bx-301-power-bank-20000mah",
    name: "BLUKS BX-301 Power Bank 20000mAh",
    description: "FULL 20000 MAH WITH FAST CHARGING (ONE YEAR WARRANTY)",
    longDescription: "BLUKS BX-301 Power Bank 20000mAh - FULL 20000 MAH WITH FAST CHARGING. Features high capacity, portable design, and reliable performance. Comes with a one-year warranty for peace of mind. LIMITED QUANTITY available.",
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
