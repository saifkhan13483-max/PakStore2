// @ts-nocheck
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
  startAfter,
  QueryConstraint,
  serverTimestamp,
  Timestamp,
  DocumentData,
  WithFieldValue,
  FirestoreError,
  QueryDocumentSnapshot,
  enableIndexedDbPersistence
} from "firebase/firestore";
import { db } from "./firebase";
import { z } from "zod";

/**
 * Enable offline persistence for better user experience and reduced read operations
 */
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.warn('Firestore persistence failed: multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all of the features required to enable persistence
      console.warn('Firestore persistence failed: browser not supported');
    }
  });
} catch (e) {
  console.error("Error enabling Firestore persistence", e);
}

/**
 * Enhanced Firestore Service Layer with Zod Validation and Error Handling
 */

function handleFirestoreError(error: any, operation: string, collectionName: string): never {
  console.error(`Firestore Error [${operation}] on [${collectionName}]:`, error);
  
  if (error instanceof FirestoreError) {
    switch (error.code) {
      case 'permission-denied':
        throw new Error(`You don't have permission to perform this action in ${collectionName}.`);
      case 'unavailable':
        throw new Error("The service is currently unavailable. Your changes will be synced once you're back online.");
      case 'not-found':
        throw new Error(`The requested document in ${collectionName} was not found.`);
      default:
        throw new Error(`A database error occurred: ${error.message}`);
    }
  }
  
  if (error instanceof z.ZodError) {
    throw new Error(`Data validation failed: ${error.errors.map(e => e.message).join(', ')}`);
  }

  throw error;
}

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
    return handleFirestoreError(error, 'getDocument', collectionName);
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
    return handleFirestoreError(error, 'getCollection', collectionName);
  }
}

/**
 * Paginated collection retrieval to optimize read operations
 */
export async function getCollectionPaginated<T>(
  collectionName: string,
  schema: z.ZodSchema<T>,
  pageSize: number = 10,
  lastDoc: QueryDocumentSnapshot | null = null,
  additionalConstraints: QueryConstraint[] = []
): Promise<{ data: T[], lastDoc: QueryDocumentSnapshot | null }> {
  try {
    const collectionRef = collection(db, collectionName);
    const constraints = [...additionalConstraints, limit(pageSize)];
    
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }
    
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const data = querySnapshot.docs.map(doc => {
      const docData = { id: doc.id, ...doc.data() };
      return schema.parse(docData);
    });
    
    return {
      data,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null
    };
  } catch (error) {
    return handleFirestoreError(error, 'getCollectionPaginated', collectionName);
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
      createdAt: data.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collectionRef, docData);
    return docRef.id;
  } catch (error) {
    return handleFirestoreError(error, 'addDocument', collectionName);
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
    return handleFirestoreError(error, 'setDocument', collectionName);
  }
}

export async function updateDocument<T extends DocumentData>(
  collectionName: string, 
  id: string, 
  data: Partial<T>,
  schema?: z.ZodSchema<any>
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    const updateData = {
      ...data,
      updatedAt: serverTimestamp(),
    };
    
    await updateDoc(docRef, updateData as any);
  } catch (error) {
    return handleFirestoreError(error, 'updateDocument', collectionName);
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
    return handleFirestoreError(error, 'deleteDocument', collectionName);
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
export { where, orderBy, limit, startAfter, serverTimestamp, Timestamp };
