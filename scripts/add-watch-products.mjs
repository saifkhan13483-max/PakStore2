import admin from 'firebase-admin';

const db = admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID }).firestore();

const products = [
  {
    slug: 'rolex-submariner-gmt-master-2-style-date-watch',
    name: 'Rolex Submariner GMT‑Master II Style Date Watch – Heavy Steel Lock & Rubber Strap',
    description: 'Upgrade your wrist game with this Rolex Submariner GMT‑Master II style men\'s watch, featuring a premium black dial, rotating bezel, heavy steel master lock clasp, and durable rubber strap. A luxury look with solid everyday performance and comfort.',
    price: 2050,
    profit: 500,
    images: ['https://res.cloudinary.com/demo/image/fetch/w_400,h_400,c_fill/https://via.placeholder.com/400?text=Rolex+Watch'],
    categoryId: 'watches',
    inStock: true,
    active: true,
    stock: 100
  },
  {
    slug: 'ladies-aura-floral-ceramic-watch-eid-collection',
    name: 'Ladies Aura Floral Ceramic Watch – Eid Collection, Lightweight Quartz',
    description: 'Celebrate Eid in style with the Ladies Aura Floral Ceramic Watch, featuring colourful printed ceramic designs, lightweight comfort, reliable quartz movement, and a secure butterfly lock.',
    price: 800,
    profit: 200,
    images: ['https://res.cloudinary.com/demo/image/fetch/w_400,h_400,c_fill/https://via.placeholder.com/400?text=Ceramic+Watch'],
    categoryId: 'watches',
    inStock: true,
    active: true,
    stock: 150
  }
];

async function addProducts() {
  try {
    console.log('Adding products to Firebase...');
    const categoriesRef = db.collection('categories');
    const watchesCat = await categoriesRef.doc('watches').get();
    if (!watchesCat.exists) {
      await categoriesRef.doc('watches').set({id: 'watches', slug: 'watches', name: 'Watches', description: 'Premium watches', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()});
    }
    const productsRef = db.collection('products');
    for (const product of products) {
      await productsRef.doc(product.slug).set({...product, id: product.slug, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), rating: 0, reviewCount: 0});
      console.log(`✓ Added: ${product.name}`);
    }
    console.log('Success!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

addProducts().then(() => process.exit(0)).catch(() => process.exit(1));
