import { type Product } from "@shared/schema";

// Mock data for Phase 1 - simulating database content
export const mockProducts: Product[] = [
  {
    id: 1,
    name: "Hand-Embroidered Pashmina Shawl",
    slug: "pashmina-shawl-royal-blue",
    description: "Authentic Kashmiri Pashmina with intricate needlework.",
    longDescription: "Experience the luxury of a genuine handcrafted Pashmina shawl. Each piece takes over 3 weeks to complete, featuring traditional paisley motifs embroidered by master artisans. The wool is sourced ethically from the Himalayas, ensuring warmth and unparalleled softness. Perfect for formal gatherings or as a cherished gift.",
    price: 45000,
    originalPrice: 55000,
    images: [
      "https://images.unsplash.com/photo-1598556808803-a496b834927b?w=800&q=80", // Shawl/Fabric texture
      "https://images.unsplash.com/photo-1629196914375-f7e48f477b6d?w=800&q=80"  // Detailed fabric
    ],
    category: "Clothing",
    inStock: true,
    features: ["100% Pure Wool", "Hand Embroidered", "Dry Clean Only"],
    specifications: { "Dimensions": "40x80 inches", "Origin": "Kashmir", "Weight": "250g" }
  },
  {
    id: 2,
    name: "Multani Khussa - Golden Noir",
    slug: "multani-khussa-gold",
    description: "Traditional leather footwear with gold thread work.",
    longDescription: "Step into tradition with our Multani Khussa. Crafted from premium vegetable-tanned leather and adorned with tilla (gold thread) work, these shoes mold to your feet for exceptional comfort. The vibrant patterns reflect the rich heritage of Southern Punjab.",
    price: 3500,
    originalPrice: 4200,
    images: [
      "https://images.unsplash.com/photo-1560343076-8d42950d22ef?w=800&q=80", // Leather shoes
      "https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?w=800&q=80"  // Footwear detail
    ],
    category: "Footwear",
    inStock: true,
    features: ["Genuine Leather", "Hand-stitched", "Memory Foam Insole"],
    specifications: { "Size": "EU 36-44", "Color": "Black/Gold", "Sole": "Leather" }
  },
  {
    id: 3,
    name: "Premium Basmati Rice - Royal Harvest",
    slug: "basmati-rice-royal-5kg",
    description: "Extra long grain aged aromatic rice.",
    longDescription: "Our Royal Harvest Basmati is aged for 2 years to ensure the grains elongate to twice their size upon cooking. Grown in the fertile plains of Punjab, this rice offers a distinct aroma and fluffy texture that is essential for the perfect Biryani or Pulao.",
    price: 2800,
    originalPrice: null,
    images: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80", // Rice
      "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&q=80"  // Uncooked rice
    ],
    category: "Grocery",
    inStock: true,
    features: ["Aged 2 Years", "Extra Long Grain", "Gluten Free"],
    specifications: { "Weight": "5kg", "Crop Year": "2023", "Type": "Super Kernel" }
  },
  {
    id: 4,
    name: "Ajrak Block Print Bed Set",
    slug: "ajrak-bed-set-king",
    description: "King size bedsheet with traditional Sindhi Ajrak geometric patterns.",
    longDescription: "Transform your bedroom with the historic geometric patterns of Sindh. This Ajrak block print set involves a rigorous 14-stage dyeing process using natural indigo and madder dyes. Includes one king-size sheet and two pillowcases.",
    price: 6500,
    originalPrice: 8000,
    images: [
      "https://images.unsplash.com/photo-1522771753014-df7091c196dd?w=800&q=80", // Bedding
      "https://images.unsplash.com/photo-1616627547584-bf28ceeec79c?w=800&q=80"  // Fabric pattern
    ],
    category: "Home Decor",
    inStock: true,
    features: ["100% Cotton", "Natural Dyes", "400 Thread Count"],
    specifications: { "Size": "King (108x108 inches)", "Includes": "1 Sheet, 2 Pillowcases", "Care": "Machine Wash Cold" }
  },
  {
    id: 5,
    name: "Himalayan Pink Salt Lamp",
    slug: "salt-lamp-natural",
    description: "Natural air purifier handcrafted from Khewra salt mines.",
    longDescription: "Bring a warm, soothing glow to your space with our authentic Himalayan Pink Salt Lamp. Mined from the Khewra Salt Mine in Pakistan, these lamps are believed to release negative ions that purify the air and promote relaxation.",
    price: 1800,
    originalPrice: 2500,
    images: [
      "https://images.unsplash.com/photo-1515516089376-88db1e26d463?w=800&q=80", // Lamp/Light
      "https://images.unsplash.com/photo-1540932296774-3243896b7173?w=800&q=80"  // Ambience
    ],
    category: "Home Decor",
    inStock: true,
    features: ["Natural Ionizer", "Dimmable Switch", "Wooden Base"],
    specifications: { "Weight": "3-5kg", "Height": "8-10 inches", "Bulb": "15W Included" }
  },
  {
    id: 6,
    name: "Peshawari Chappal - Charcoal",
    slug: "peshawari-chappal-charcoal",
    description: "Classic sturdy footwear with tire sole for durability.",
    longDescription: "A modern take on the classic Peshawari Chappal. Featuring premium charcoal leather and a durable tire rubber sole, this footwear combines rugged durability with traditional style. Ideal for pairing with Shalwar Kameez.",
    price: 4500,
    originalPrice: null,
    images: [
      "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=800&q=80", // Men's footwear
      "https://images.unsplash.com/photo-1603487742131-4160ec88a032?w=800&q=80"  // Leather detail
    ],
    category: "Footwear",
    inStock: false,
    features: ["Tire Rubber Sole", "Double Stitching", "Adjustable Strap"],
    specifications: { "Material": "Cow Leather", "Origin": "Peshawar", "Warranty": "6 Months" }
  }
];
