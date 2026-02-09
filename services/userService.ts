import { db } from "../config/firebase";

const USERS_COLLECTION = "users";

export const createUser = async (userData: any) => {
  const docRef = await db.collection(USERS_COLLECTION).add(userData);
  return { id: docRef.id, ...userData };
};

export const getUserById = async (userId: string) => {
  const doc = await db.collection(USERS_COLLECTION).doc(userId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

export const updateUser = async (userId: string, updateData: any) => {
  await db.collection(USERS_COLLECTION).doc(userId).update(updateData);
  return { id: userId, ...updateData };
};

export const deleteUser = async (userId: string) => {
  await db.collection(USERS_COLLECTION).doc(userId).delete();
  return { id: userId };
};

export const getAllUsers = async (limit: number = 10, offset: any = null) => {
  let query = db.collection(USERS_COLLECTION).limit(limit);
  
  if (offset) {
    query = query.startAfter(offset);
  }

  const snapshot = await query.get();
  const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const lastVisible = snapshot.docs[snapshot.docs.length - 1];

  return {
    users,
    nextOffset: lastVisible || null
  };
};
