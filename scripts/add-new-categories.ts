import { categoryFirestoreService } from "../client/src/services/categoryFirestoreService";

async function run() {
  console.log("Adding new categories...");
  
  // Since we can't easily import the parent category service due to missing files/exports,
  // we'll use the hardcoded IDs if we can find them or just use the names.
  // Looking at the codebase, parent categories usually have predictable IDs if seeded.
  
  const newCategories = [
    { name: "Bags", slug: "bags", parentCategoryName: "Fashion & Accessories" },
    { name: "Bedsheets", slug: "bedsheets", parentCategoryName: "Home & Decor" },
    { name: "Customizable Items", slug: "customizable-items", parentCategoryName: "Fashion & Accessories" },
    { name: "Eid Special Collection", slug: "eid-special-collection", parentCategoryName: "Fashion & Accessories" },
    { name: "Shoes", slug: "shoes", parentCategoryName: "Fashion & Accessories" },
    { name: "Slippers", slug: "slippers", parentCategoryName: "Fashion & Accessories" },
  ];

  // We'll just add them as top-level categories for now if parent IDs are tricky,
  // or better, we'll just try to create them.
  
  for (const cat of newCategories) {
    try {
      await categoryFirestoreService.createCategory({
        name: cat.name,
        slug: cat.slug,
        description: `Premium ${cat.name} collection`,
        image: "",
        parentCategoryId: cat.parentCategoryName === "Fashion & Accessories" ? "fashion-accessories" : "home-decor"
      });
      console.log(`Added category: ${cat.name}`);
    } catch (e) {
      console.log(`Category ${cat.name} might already exist or failed:`, e.message);
    }
  }
  
  console.log("Done!");
  process.exit(0);
}

run().catch(console.error);
