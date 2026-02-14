import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCy6W_iVKhOuawX5kLtq_arxsVfnxbfg94",
  authDomain: "pakstore-45ec7.firebaseapp.com",
  projectId: "pakstore-45ec7",
  storageBucket: "pakstore-45ec7.firebasestorage.app",
  appId: "1:427945652323:web:14ba66302d404561d7c856",
};

async function countAdmins() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('isAdmin', '==', true));
  
  const querySnapshot = await getDocs(q);
  
  console.log(`COUNT_RESULT: Total admins found: ${querySnapshot.size}`);
  querySnapshot.forEach(doc => {
    const data = doc.data();
    console.log(`- ${data.email} (${data.role || 'no role set'})`);
  });
}

countAdmins().catch(err => {
  console.log(`COUNT_RESULT: ERROR: ${err.message}`);
});
