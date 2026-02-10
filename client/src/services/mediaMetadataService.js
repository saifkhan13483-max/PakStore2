import { db } from "../lib/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from "firebase/firestore";

/**
 * Save Cloudinary media metadata to Firestore
 * @param {string} userId - ID of the user who uploaded the media
 * @param {object} cloudinaryData - Response data from Cloudinary API
 * @param {object} customMetadata - Additional metadata (tags, descriptions, etc.)
 */
export const saveMediaMetadata = async (userId, cloudinaryData, customMetadata = {}) => {
  try {
    const mediaRef = collection(db, "media");
    const docData = {
      userId,
      cloudinaryPublicId: cloudinaryData.public_id,
      cloudinaryUrl: cloudinaryData.secure_url,
      uploadedAt: serverTimestamp(),
      fileType: cloudinaryData.resource_type || (cloudinaryData.format ? 'image' : 'unknown'),
      fileSize: cloudinaryData.bytes || 0,
      dimensions: {
        width: cloudinaryData.width || 0,
        height: cloudinaryData.height || 0
      },
      format: cloudinaryData.format || 'unknown',
      ...customMetadata
    };
    
    const docRef = await addDoc(mediaRef, docData);
    return { id: docRef.id, ...docData };
  } catch (error) {
    console.error("Error saving media metadata:", error);
    throw error;
  }
};

/**
 * Retrieve user's uploaded media
 * @param {string} userId - User ID to filter by
 */
export const getMediaByUser = async (userId) => {
  try {
    const mediaRef = collection(db, "media");
    const q = query(mediaRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching user media:", error);
    throw error;
  }
};

/**
 * Update existing media metadata
 * @param {string} mediaId - Firestore document ID
 * @param {object} updates - Fields to update
 */
export const updateMediaMetadata = async (mediaId, updates) => {
  try {
    const docRef = doc(db, "media", mediaId);
    await updateDoc(docRef, updates);
    return true;
  } catch (error) {
    console.error("Error updating media metadata:", error);
    throw error;
  }
};

/**
 * Delete media metadata from Firestore
 * Note: This does not delete the file from Cloudinary
 * @param {string} mediaId - Firestore document ID
 */
export const deleteMediaMetadata = async (mediaId) => {
  try {
    const docRef = doc(db, "media", mediaId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting media metadata:", error);
    throw error;
  }
};

/**
 * Search media with filters
 * @param {string} userId - User ID context
 * @param {object} filters - Filter criteria (e.g., { fileType: 'image' })
 */
export const searchMedia = async (userId, filters = {}) => {
  try {
    const mediaRef = collection(db, "media");
    let q = query(mediaRef, where("userId", "==", userId));
    
    // Simple filter implementation
    // Firestore has limitations on multiple 'where' clauses without indexes
    // For complex searches, client-side filtering might be needed or specific indexes
    const querySnapshot = await getDocs(q);
    let results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Apply additional filters client-side for flexibility
    if (Object.keys(filters).length > 0) {
      results = results.filter(item => {
        return Object.entries(filters).every(([key, value]) => item[key] === value);
      });
    }
    
    return results;
  } catch (error) {
    console.error("Error searching media:", error);
    throw error;
  }
};
