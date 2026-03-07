const admin = require('firebase-admin');

// Initialize Firebase using environment variables or service account
try {
  // Try to use FIREBASE_CONFIG environment variable if available
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : require('../firebase-admin-key.json').catch(() => null);

  if (serviceAccount && serviceAccount.project_id) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
  } else {
    // Fallback: use application default credentials
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }
} catch (e) {
  console.log('Using Application Default Credentials...');
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

const products = [
  {
    slug: 'rolex-submariner-gmt-master-2-style-date-watch',
    name: 'Rolex Submariner GMT‑Master II Style Date Watch – Heavy Steel Lock & Rubber Strap',
    description: 'Upgrade your wrist game with this Rolex Submariner GMT‑Master II style men\'s watch, featuring a premium black dial, rotating bezel, heavy steel master lock clasp, and durable rubber strap. A luxury look with solid everyday performance and comfort.',
    longDescription: 'Bring luxury‑watch attitude to your everyday style with this Rolex Submariner GMT‑Master II style watch. Designed to mirror the bold, iconic diver aesthetic, it combines a sleek black dial, rotating timing bezel, and high‑polish steel case with a comfortable black rubber strap and heavy master‑lock clasp for a secure fit.\n\nThe detailed bezel markings, luminous indices, and date window give this timepiece a premium, functional feel, while the robust construction makes it suitable for daily wear. Whether you\'re dressing for the office, a night out, or a weekend trip, this watch delivers a strong first impression and a confident presence on the wrist.',
    price: 2050,
    profit: 500,
    images: ['https://res.cloudinary.com/demo/image/fetch/w_400,h_400,c_fill/https://via.placeholder.com/400?text=Rolex+Watch'],
    categoryId: 'watches',
    inStock: true,
    active: true,
    features: [
      'Luxury Submariner‑style black dial',
      'Heavy steel master‑lock clasp',
      'Comfortable, durable rubber strap',
      'Working rotating timing bezel',
      'Date display with magnifier window'
    ],
    stock: 100
  },
  {
    slug: 'ladies-aura-floral-ceramic-watch-eid-collection',
    name: 'Ladies Aura Floral Ceramic Watch – Eid Collection, Lightweight Quartz',
    description: 'Celebrate Eid in style with the Ladies Aura Floral Ceramic Watch, featuring colourful printed ceramic designs, lightweight comfort, reliable quartz movement, and a secure butterfly lock. A perfect festive gift with premium finishing and multiple vibrant colour options.',
    longDescription: 'Add a burst of colour and elegance to your Eid look with the Ladies Aura Floral Ceramic Watch – Eid Collection. Designed especially for women who love playful, standout accessories, this collection combines artistic ceramic patterns with everyday comfort and dependable performance.\n\nEach watch features a high‑quality ceramic strap printed with eye‑catching floral, leopard, camouflage and abstract designs. The smooth, lightweight build makes it perfect for all‑day wear, while the precise quartz movement keeps your time accurate for every Eid visit, gathering and celebration.',
    price: 800,
    profit: 200,
    images: ['https://res.cloudinary.com/demo/image/fetch/w_400,h_400,c_fill/https://via.placeholder.com/400?text=Ceramic+Watch'],
    categoryId: 'watches',
    inStock: true,
    active: true,
    variants: [
      {
        id: 'color',
        name: 'Color',
        options: [
          { id: 'rainbow-stripe', value: 'Rainbow Stripe' },
          { id: 'purple-butterflies', value: 'Purple Butterflies' },
          { id: 'zigzag-multicolour', value: 'Zigzag Multicolour' },
          { id: 'blue-floral', value: 'Blue Floral' },
          { id: 'blue-white-floral', value: 'Blue‑White Floral' },
          { id: 'leopard-print', value: 'Leopard Print' },
          { id: 'pink-floral', value: 'Pink Floral' },
          { id: 'green-camouflage', value: 'Green Camouflage' },
          { id: 'purple-marble-floral', value: 'Purple Marble Floral' },
          { id: 'orange-daisy-floral', value: 'Orange Daisy Floral' }
        ]
      }
    ],
    features: [
      'Lightweight printed ceramic bracelet',
      'Festive Eid special ladies design',
      'Reliable, low‑maintenance quartz movement',
      'Secure, comfortable butterfly lock clasp',
      'Multiple colours and patterns available'
    ],
    stock: 150
  }
];

async function addProducts() {
  try {
    console.log('Starting to add products...');
    
    const categoriesRef = db.collection('categories');
    const watchesCat = await categoriesRef.doc('watches').get();
    
    if (!watchesCat.exists) {
      console.log('Creating Watches category...');
      await categoriesRef.doc('watches').set({
        id: 'watches',
        slug: 'watches',
        name: 'Watches',
        description: 'Premium watches for men and women',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    const productsRef = db.collection('products');
    
    for (const product of products) {
      const docRef = productsRef.doc(product.slug);
      const docData = {
        ...product,
        id: product.slug,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rating: 0,
        reviewCount: 0
      };
      
      await docRef.set(docData);
      console.log(`✓ Added product: ${product.name}`);
    }
    
    console.log('Successfully added all products!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addProducts();
