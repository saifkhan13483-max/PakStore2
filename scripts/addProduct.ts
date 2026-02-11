
import { storage } from "./server/storage.ts";

async function addProduct() {
  const categories = await storage.getCategories();
  let categoryId = "";
  
  if (categories.length > 0) {
    categoryId = categories[0].id;
  } else {
    // Create a default category if none exists
    const parentCategories = await storage.getParentCategories();
    let parentId = "";
    if (parentCategories.length > 0) {
      parentId = parentCategories[0].id;
    } else {
      const pc = await storage.createParentCategory({ name: "Electronics", slug: "electronics" });
      parentId = pc.id;
    }
    const cat = await storage.createCategory({ parentId, name: "Power Banks", slug: "power-banks" });
    categoryId = cat.id;
  }

  const product = await storage.createProduct({
    name: "BLUKS BX-301 Power Bank 20000mAh",
    slug: "bluks-bx-301-power-bank-20000mah",
    description: "FULL 20000 MAH WITH FAST CHARGING. (ONE YEAR WARRANTY). LIMITED QUANTITY.",
    price: 4300,
    categoryId: categoryId,
    image: "/src/assets/bluks-bx-301.webp",
    stock: 10,
    active: true,
    inStock: true,
    features: ["20000mAh Capacity", "Fast Charging", "One Year Warranty", "Limited Quantity"]
  });

  console.log("Product added successfully:", product);
  process.exit(0);
}

addProduct().catch(console.error);
