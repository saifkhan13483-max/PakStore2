import { Product } from '../types';

export const products: Product[] = [
  {
    id: "1",
    slug: "kashmiri-pashmina-shawl",
    name: "Hand-Woven Kashmiri Pashmina Shawl",
    description: "Authentic, pure wool pashmina shawl from the valleys of Kashmir.",
    longDescription: "This exquisite shawl is hand-woven by master artisans using the finest Grade A pashmina wool. Known for its incredible warmth and lightness, this timeless piece features traditional patterns and a soft emerald green hue with gold thread accents.",
    price: 45000,
    originalPrice: 55000,
    images: [
      "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&q=80&w=800"
    ],
    category: "Apparel",
    inStock: true,
    features: [
      "100% Pure Pashmina Wool",
      "Hand-loomed in Kashmir",
      "Intricate gold thread borders",
      "Eco-friendly natural dyes"
    ],
    specifications: {
      "Material": "Pure Pashmina",
      "Dimensions": "200cm x 100cm",
      "Weight": "200g",
      "Care": "Dry Clean Only"
    }
  },
  {
    id: "2",
    slug: "multani-blue-pottery-vase",
    name: "Multani Blue Pottery Decorative Vase",
    description: "Traditional hand-painted ceramic art from Multan.",
    longDescription: "Bring a touch of Multani heritage to your home with this stunning blue pottery vase. Each piece is meticulously hand-painted with cobalt blue floral patterns on a white base, a signature style that has been perfected over centuries.",
    price: 3500,
    originalPrice: 4200,
    images: [
      "https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?auto=format&fit=crop&q=80&w=800"
    ],
    category: "Home Decor",
    inStock: true,
    features: [
      "Hand-painted ceramics",
      "Lead-free glaze",
      "Authentic Multani Kashi Kari",
      "Unique floral patterns"
    ],
    specifications: {
      "Material": "Glazed Ceramic",
      "Height": "12 inches",
      "Origin": "Multan, Pakistan",
      "Technique": "Kashi Kari"
    }
  },
  {
    id: "3",
    slug: "peshawari-chappal-leather",
    name: "Classic Peshawar Chappal - Premium Leather",
    description: "Handcrafted traditional footwear with modern comfort.",
    longDescription: "The legendary Peshawari Chappal, reimagined with premium full-grain leather and a comfort-focused sole. Durable, stylish, and deeply rooted in Pakistani culture, these are perfect for both formal and casual wear.",
    price: 5500,
    originalPrice: 6500,
    images: [
      "https://images.unsplash.com/photo-1628149455678-16f37bc392f4?auto=format&fit=crop&q=80&w=800"
    ],
    category: "Footwear",
    inStock: true,
    features: [
      "Full-grain cow leather",
      "Hand-stitched construction",
      "Adjustable heel strap",
      "Durable rubber sole"
    ],
    specifications: {
      "Material": "Genuine Leather",
      "Color": "Classic Brown",
      "Sole": "Tyre Rubber",
      "Weight": "800g (pair)"
    }
  },
  {
    id: "4",
    slug: "premium-sidr-honey-kp",
    name: "Organic Premium Sidr Honey",
    description: "Rare and medicinal honey sourced from the Beri trees of KP.",
    longDescription: "Known as the 'Manuka of the East', our Sidr honey is harvested from the wild Sidr (Beri) trees in the Karak region of Khyber Pakhtunkhwa. It is cold-pressed, unprocessed, and packed with antioxidants and healing properties.",
    price: 8500,
    originalPrice: 9500,
    images: [
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800"
    ],
    category: "Food",
    inStock: true,
    features: [
      "100% Pure & Raw",
      "Medicinal Grade",
      "Sourced from KP wild forests",
      "No added preservatives"
    ],
    specifications: {
      "Type": "Monofloral Sidr",
      "Volume": "1kg",
      "Harvesting Period": "Autumn",
      "Shelf Life": "2 Years"
    }
  }
];
