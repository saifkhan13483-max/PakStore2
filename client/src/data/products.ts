import { type Product } from "@shared/schema";
import watchBlack from "@/assets/watch-black.png";
import watchSilver from "@/assets/watch-silver.png";

// Mock data for Phase 1 - simulating database content
export const mockProducts: Product[] = [
  {
    id: "watch-1",
    slug: "d-lon-model-6-mens-push-lock-belt",
    name: "D’Lon Model 6 Men’s Push-Lock Belt",
    description: "D’Lon Model 6 men’s belt — stylish, high-quality, and available in multiple colours.",
    longDescription: "Features a durable push-lock buckle and excellent craftsmanship, all at an affordable price. Box not included.",
    price: 1000,
    originalPrice: 1499,
    images: [watchBlack, watchSilver],
    categoryId: "watches-cat",
    inStock: true,
    active: true,
    rating: "0.0",
    reviewCount: 0,
    features: ["Durable push-lock buckle", "Excellent craftsmanship", "Multiple colors available"],
    specifications: {
      model: "Model 6",
      type: "Men's Push-Lock Belt"
    },
    variants: [
      {
        id: "v1",
        name: "Color",
        options: [
          {
            id: "opt-silver",
            value: "Silver",
            image: watchSilver
          },
          {
            id: "opt-black",
            value: "Black",
            image: watchBlack
          }
        ]
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "bluks-1",
    slug: "bluks-bx-301-power-bank-20000mah",
    name: "BLUKS BX-301 Power Bank 20000mAh",
    description: "FULL 20000 MAH WITH FAST CHARGING (ONE YEAR WARRANTY)",
    longDescription: "Never run out of power again with the BLUKS BX-301 Power Bank.",
    price: 4300,
    originalPrice: 5500,
    images: ["/images/bluks-bx-301.webp"],
    categoryId: "1",
    inStock: true,
    active: true,
    rating: "4.8",
    reviewCount: 124,
    features: ["20000mAh Capacity", "Fast Charging Support", "One Year Warranty"],
    specifications: {
      capacity: "20000mAh",
      charging: "22.5W",
      warranty: "1 Year"
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const products = mockProducts;
