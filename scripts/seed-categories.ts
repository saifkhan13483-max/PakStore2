
import { db } from "./server/db";
import { parentCategories, categories, products } from "./shared/schema";
import { eq } from "drizzle-orm";

async function resetAndSeed() {
  console.log("Starting category reset and seed...");

  try {
    // 1. Clear existing data (handling foreign keys)
    console.log("Deleting existing products and categories...");
    await db.delete(products);
    await db.delete(categories);
    await db.delete(parentCategories);

    // 2. Define data
    const seedData = [
      {
        name: "Electronics & Gadgets",
        slug: "electronics-gadgets",
        children: [
          { name: "Mobile Accessories", slug: "mobile-accessories" },
          { name: "Smart Watches", slug: "smart-watches" },
          { name: "Earbuds & Headphones", slug: "earbuds-headphones" },
          { name: "Power Banks & Chargers", slug: "power-banks-chargers" },
          { name: "Home Gadgets", slug: "home-gadgets" },
        ],
      },
      {
        name: "Home & Kitchen",
        slug: "home-kitchen",
        children: [
          { name: "Kitchen Tools", slug: "kitchen-tools" },
          { name: "Storage & Organization", slug: "storage-organization" },
          { name: "Cleaning Products", slug: "cleaning-products" },
          { name: "Home Decor", slug: "home-decor" },
          { name: "LED Lights", slug: "led-lights" },
        ],
      },
      {
        name: "Fashion & Accessories",
        slug: "fashion-accessories",
        children: [
          { name: "Men’s Clothing", slug: "mens-clothing" },
          { name: "Women’s Clothing", slug: "womens-clothing" },
          { name: "Watches", slug: "watches" },
          { name: "Sunglasses", slug: "sunglasses" },
          { name: "Wallets & Belts", slug: "wallets-belts" },
        ],
      },
    ];

    // 3. Insert into PostgreSQL
    for (const parent of seedData) {
      const [insertedParent] = await db
        .insert(parentCategories)
        .values({
          name: parent.name,
          slug: parent.slug,
        })
        .returning();

      console.log(`Inserted parent category: ${parent.name}`);

      for (const child of parent.children) {
        await db.insert(categories).values({
          name: child.name,
          slug: child.slug,
          parentId: insertedParent.id,
        });
        console.log(`  Inserted child category: ${child.name}`);
      }
    }

    console.log("Category reset and seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error during reset and seed:", error);
    process.exit(1);
  }
}

resetAndSeed();
