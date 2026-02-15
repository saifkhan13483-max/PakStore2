import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCy6W_iVKhOuawX5kLtq_arxsVfnxbfg94",
  authDomain: "pakstore-45ec7.firebaseapp.com",
  projectId: "pakstore-45ec7",
  storageBucket: "pakstore-45ec7.firebasestorage.app",
  appId: "1:427945652323:web:14ba66302d404561d7c856",
};

async function promoteAdmin(email) {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', email));
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    console.log(`No user found in Firestore with email: ${email}. They may need to sign in first.`);
    return;
  }
  
  for (const userDoc of querySnapshot.docs) {
    await updateDoc(doc(db, 'users', userDoc.id), {
      role: 'admin',
      isAdmin: true,
      updatedAt: new Date()
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
});
