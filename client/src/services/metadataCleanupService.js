import { db } from "../config/firebase";
import { doc, updateDoc, collection, query, where, getDocs, deleteDoc, Timestamp } from "firebase/firestore";

/**
 * Service to manage metadata cleanup since client-side deletion from Cloudinary is restricted.
 * This implements a "soft delete" strategy in Firestore.
 */

/**
 * Mark media as deleted in Firestore (Soft Delete).
 * @param {string} mediaId - The Firestore document ID of the media.
 * @returns {Promise<void>}
 */
export const markMediaAsDeleted = async (mediaId) => {
  try {
    const mediaRef = doc(db, "media", mediaId);
    await updateDoc(mediaRef, {
      status: "deleted",
      deletedAt: Timestamp.now(),
      isOrphaned: true
    });
  } catch (error) {
    console.error("Error marking media as deleted:", error);
    throw error;
  }
};

/**
 * Retrieve media marked for deletion for a specific user.
 * @param {string} userId - The user's ID.
 * @returns {Promise<Array>} List of orphaned media metadata.
 */
export const getOrphanedMedia = async (userId) => {
  try {
    const mediaRef = collection(db, "media");
    const q = query(
      mediaRef, 
      where("userId", "==", userId), 
      where("status", "==", "deleted")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching orphaned media:", error);
    throw error;
  }
};

/**
 * Remove deleted media metadata from Firestore.
 * This only cleans up Firestore records, not Cloudinary files.
 * @param {string} userId - The user's ID.
 * @returns {Promise<void>}
 */
export const cleanupUserMedia = async (userId) => {
  try {
    const orphanedMedia = await getOrphanedMedia(userId);
    const deletePromises = orphanedMedia.map(media => 
      deleteDoc(doc(db, "media", media.id))
    );
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error cleaning up user media metadata:", error);
    throw error;
  }
};

/**
 * Schedule a future cleanup by marking a deletion date.
 * @param {string} mediaId - The media ID.
 * @param {number} daysFromNow - Number of days to wait before actual cleanup.
 * @returns {Promise<void>}
 */
export const scheduleCleanup = async (mediaId, daysFromNow = 30) => {
  try {
    const mediaRef = doc(db, "media", mediaId);
    const cleanupDate = new Date();
    cleanupDate.setDate(cleanupDate.getDate() + daysFromNow);
    
    await updateDoc(mediaRef, {
      status: "pending_cleanup",
      cleanupScheduledAt: Timestamp.fromDate(cleanupDate)
    });
  } catch (error) {
    console.error("Error scheduling cleanup:", error);
    throw error;
  }
};
