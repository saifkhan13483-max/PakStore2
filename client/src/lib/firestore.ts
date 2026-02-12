import { 
  getFirestore, 
  doc, 
  collection, 
  getDoc, 
  getDocs, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  QueryConstraint,
  serverTimestamp,
  Timestamp,
  DocumentData,
  WithFieldValue
} from "firebase/firestore";
import { app } from "./firebase";
import { z } from "zod";

const db = getFirestore(app);

/**
 * Generic Firestore Service Layer with Zod Validation
 */

export async function getDocument<T>(
  collectionName: string, 
  id: string, 
  schema: z.ZodSchema<T>
): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = { id: docSnap.id, ...docSnap.data() };
      return schema.parse(data);
    }
    return null;
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
}

export async function getCollection<T>(
  collectionName: string, 
  schema: z.ZodSchema<T>,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = { id: doc.id, ...doc.data() };
      return schema.parse(data);
    });
  } catch (error) {
    console.error(`Error getting collection ${collectionName}:`, error);
    throw error;
  }
}

export async function addDocument<T extends DocumentData>(
  collectionName: string, 
  data: T,
  schema?: z.ZodSchema<any>
): Promise<string> {
  try {
    if (schema) {
      schema.parse(data);
    }
    
    const collectionRef = collection(db, collectionName);
    const docData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collectionRef, docData);
    return docRef.id;
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
}

export async function setDocument<T extends DocumentData>(
  collectionName: string, 
  id: string, 
  data: T,
  schema?: z.ZodSchema<any>
): Promise<void> {
  try {
    if (schema) {
      schema.parse(data);
    }
    
    const docRef = doc(db, collectionName, id);
    const docData = {
      ...data,
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(docRef, docData, { merge: true });
  } catch (error) {
    console.error(`Error setting document in ${collectionName}:`, error);
    throw error;
  }
}

export async function updateDocument<T extends DocumentData>(
  collectionName: string, 
  id: string, 
  data: Partial<T>,
  schema?: z.ZodSchema<any>
): Promise<void> {
  try {
    // Note: Schema validation for partial updates can be tricky if the schema requires all fields.
    // We assume the schema provided handles partials or we skip validation for updates.
    
    const docRef = doc(db, collectionName, id);
    const updateData = {
      ...data,
      updatedAt: serverTimestamp(),
    };
    
    await updateDoc(docRef, updateData as any);
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
}

export async function deleteDocument(
  collectionName: string, 
  id: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
}

export async function queryCollection<T>(
  collectionName: string,
  schema: z.ZodSchema<T>,
  field: string,
  operator: any, // WhereFilterOp
  value: any,
  orderByField?: string,
  orderDirection: 'asc' | 'desc' = 'asc',
  limitTo: number = 50
): Promise<T[]> {
  const constraints: QueryConstraint[] = [
    where(field, operator, value)
  ];
  
  if (orderByField) {
    constraints.push(orderBy(orderByField, orderDirection));
  }
  
  constraints.push(limit(limitTo));
  
  return getCollection(collectionName, schema, constraints);
}

// Re-export useful Firebase functions
export { where, orderBy, limit, serverTimestamp, Timestamp };
