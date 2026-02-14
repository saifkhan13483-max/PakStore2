import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

async function promoteAdmin(email) {
  if (!process.env.VITE_FIREBASE_API_KEY) {
    console.error('Error: VITE_FIREBASE_API_KEY is not set.');
    return;
  }

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', email));
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    console.log(`No user found with email: ${email}`);
    console.log('If this user hasn\'t signed up yet, they will need to sign up first.');
    return;
  }
  
  for (const userDoc of querySnapshot.docs) {
    await updateDoc(doc(db, 'users', userDoc.id), {
      role: 'admin',
      isAdmin: true,
      updatedAt: new Date()
    });
    console.log(`Successfully promoted ${email} to admin.`);
  }
}

const targetEmail = 'ch.ayan.arain.786@gmail.com';
promoteAdmin(targetEmail).catch(console.error);
