import { useEffect, useState } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  QueryConstraint, 
  DocumentData,
  FirestoreError
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

/**
 * Hook for real-time updates of a single Firestore document.
 * Integrates with TanStack Query for caching.
 */
export function useRealtimeDocument<T>(
  collectionName: string,
  documentId: string,
  schema: z.ZodSchema<T>,
  queryKey: any[]
) {
  const queryClient = useQueryClient();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<FirestoreError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!documentId) return;

    const docRef = doc(db, collectionName, documentId);
    
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          try {
            const documentData = { id: snapshot.id, ...snapshot.data() } as T;
            const validatedData = schema.parse(documentData);
            
            // Sync with TanStack Query cache
            queryClient.setQueryData(queryKey, validatedData);
            setData(validatedData);
          } catch (err) {
            console.error(`Validation error in real-time document ${collectionName}/${documentId}:`, err);
          }
        } else {
          setData(null);
          queryClient.setQueryData(queryKey, null);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error(`Firestore real-time error for ${collectionName}/${documentId}:`, err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, documentId, queryClient, JSON.stringify(queryKey)]);

  return { data, error, isLoading };
}

/**
 * Hook for real-time updates of a Firestore collection.
 * Integrates with TanStack Query for caching.
 */
export function useRealtimeCollection<T>(
  collectionName: string,
  schema: z.ZodSchema<T>,
  queryKey: any[],
  constraints: QueryConstraint[] = []
) {
  const queryClient = useQueryClient();
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<FirestoreError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const documents = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as T[];
          
          const validatedData = documents.map(doc => {
            try {
              return schema.parse(doc);
            } catch (err) {
              console.error(`Validation error for document ${doc.id} in ${collectionName}:`, err);
              // Return a partial object or skip if validation fails to prevent the whole collection from failing
              return doc as unknown as T;
            }
          });
          
          // Sync with TanStack Query cache
          queryClient.setQueryData(queryKey, validatedData);
          setData(validatedData);
        } catch (err) {
          console.error(`Validation error in real-time collection ${collectionName}:`, err);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error(`Firestore real-time error for collection ${collectionName}:`, err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, queryClient, JSON.stringify(queryKey), constraints.length]);

  return { data, error, isLoading };
}
