import { storage } from "./storage";

async function seed() {
  console.log("Clearing existing categories...");
  await storage.clearCategories();

  const data = [
    {
      parent: "Electronics & Gadgets",
      slug: "electronics-gadgets",
      children: [
        "Mobile Accessories",
        "Smart Watches",
        "Earbuds & Headphones",
        "Power Banks & Chargers",
        "Home Gadgets",
      ],
    },
    {
      parent: "Home & Kitchen",
      slug: "home-kitchen",
      children: [
        "Kitchen Tools",
        "Storage & Organization",
        "Cleaning Products",
        "Home Decor",
        "LED Lights",
      ],
    },
    {
      parent: "Fashion & Accessories",
      slug: "fashion-accessories",
      children: [
        "Men’s Clothing",
        "Women’s Clothing",
        "Watches",
        "Sunglasses",
        "Wallets & Belts",
      ],
    },
  ];

  for (const item of data) {
    console.log(`Creating parent category: ${item.parent}`);
    const parent = await storage.createParentCategory({
      name: item.parent,
      slug: item.slug,
    });

    for (const childName of item.children) {
      const childSlug = childName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      console.log(`  Creating child category: ${childName}`);
      await storage.createCategory({
        name: childName,
        slug: childSlug,
        parentId: parent.id,
      });
    }
  }

  console.log("Seeding completed!");
}

seed().catch(console.error);
