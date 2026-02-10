import { db } from "../config/firebase";

const USERS_COLLECTION = "users";

export interface UserData {
  id?: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: Date;
  [key: string]: any;
}

/**
 * Create a new user in Firestore
 */
export const createUser = async (userData: UserData): Promise<UserData> => {
  const docRef = await db.collection(USERS_COLLECTION).add({
    ...userData,
    createdAt: new Date(),
  });
  return { id: docRef.id, ...userData };
};

/**
 * Get a user by ID from Firestore
 */
export const getUserById = async (userId: string): Promise<UserData | null> => {
  const doc = await db.collection(USERS_COLLECTION).doc(userId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as UserData;
};

/**
 * Update an existing user in Firestore
 */
export const updateUser = async (userId: string, updateData: Partial<UserData>): Promise<UserData> => {
  await db.collection(USERS_COLLECTION).doc(userId).update({
    ...updateData,
    updatedAt: new Date(),
  });
  // Use a type assertion to allow spreading Partial<UserData> into the returned UserData
  return { id: userId, ...updateData } as UserData;
};

/**
 * Delete a user from Firestore
 */
export const deleteUser = async (userId: string): Promise<{ id: string }> => {
  await db.collection(USERS_COLLECTION).doc(userId).delete();
  return { id: userId };
};

/**
 * Get all users with pagination
 */
export const getAllUsers = async (limit: number = 10, lastVisibleDocId?: string) => {
  let query = db.collection(USERS_COLLECTION).orderBy("createdAt", "desc").limit(limit);
  
  if (lastVisibleDocId) {
    const lastVisibleDoc = await db.collection(USERS_COLLECTION).doc(lastVisibleDocId).get();
    if (lastVisibleDoc.exists) {
      query = query.startAfter(lastVisibleDoc);
    }
  }

  const snapshot = await query.get();
  const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserData));
  const lastVisible = snapshot.docs[snapshot.docs.length - 1];

  return {
    users,
    nextOffset: lastVisible ? lastVisible.id : null
  };
};
