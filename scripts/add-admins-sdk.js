const admin = require('firebase-admin');

// Using the provided environment variables for initialization
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    })
  });
}

const db = admin.firestore();

async function promoteAdmin(email) {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('email', '==', email).get();
  
  if (snapshot.empty) {
    console.log(`No user found in Firestore with email: ${email}. They may need to sign in first.`);
    return;
  }
  
  for (const userDoc of snapshot.docs) {
    await userDoc.ref.update({
      role: 'admin',
      isAdmin: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`Successfully promoted ${email} to admin in Firestore.`);
  }
}

const emails = ['saifkhan16382@gmail.com', 'ch.ayan.arain786@gmail.com'];

async function run() {
  for (const email of emails) {
    await promoteAdmin(email);
  }
}

run().catch(err => {
  console.log(`ERROR: ${err.message}`);
  process.exit(1);
});
