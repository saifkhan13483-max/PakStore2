import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyCy6W_iVKhOuawX5kLtq_arxsVfnxbfg94",
  authDomain: "pakstore-45ec7.firebaseapp.com",
  projectId: "pakstore-45ec7",
  storageBucket: "pakstore-45ec7.firebasestorage.app",
  messagingSenderId: "427945652323",
  appId: "1:427945652323:web:14ba66302d404561d7c856",
});
const db = getFirestore(app);

async function main() {
  const pids = process.argv.slice(2);
  for (const pid of pids) {
    const snap = await getDocs(query(collection(db, "comments"), where("productId", "==", pid)));
    const groups: Record<string, number> = {};
    snap.docs.forEach((d) => {
      const u = (d.data().userId as string) || "(none)";
      groups[u] = (groups[u] || 0) + 1;
    });
    console.log(`${pid}: total=${snap.size}, byUserId=${JSON.stringify(groups)}`);
  }
  process.exit(0);
}
main();
