/**
 * Service for implementing client-side rate limiting and exponential backoff
 * to prevent abuse of Cloudinary uploads.
 */

const RATE_LIMIT_KEY = "cloudinary_upload_rate_limit";
const DAILY_LIMIT = 50;
const HOURLY_LIMIT = 15;

/**
 * Tracks and checks if the user has exceeded the client-side rate limit.
 * @returns {Object} { allowed: boolean, error?: string }
 */
export const checkRateLimit = () => {
  try {
    const now = Date.now();
    const data = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || '{"uploads": []}');
    
    // Clean up old entries (older than 24 hours)
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const recentUploads = data.uploads.filter(timestamp => timestamp > oneDayAgo);
    
    // Check hourly limit (last 60 mins)
    const oneHourAgo = now - 60 * 60 * 1000;
    const hourlyUploads = recentUploads.filter(timestamp => timestamp > oneHourAgo);
    
    if (hourlyUploads.length >= HOURLY_LIMIT) {
      return { 
        allowed: false, 
        error: "Too many uploads in a short time. Please wait a few minutes." 
      };
    }
    
    if (recentUploads.length >= DAILY_LIMIT) {
      return { 
        allowed: false, 
        error: "Daily upload limit reached. Please try again tomorrow." 
      };
    }
    
    return { allowed: true, currentData: recentUploads };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return { allowed: true }; // Fail open to not block users on storage errors
  }
};

/**
 * Records a successful upload to the local rate limit tracker.
 */
export const recordUpload = () => {
  try {
    const { currentData = [] } = checkRateLimit();
    const newData = {
      uploads: [...currentData, Date.now()]
    };
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(newData));
  } catch (error) {
    console.error("Failed to record upload:", error);
  }
};

/**
 * Implements exponential backoff for a function call.
 * @param {Function} fn - The async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @returns {Promise}
 */
export const withExponentialBackoff = async (fn, maxRetries = 3) => {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i === maxRetries) break;
      
      const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
      console.warn(`Upload failed, retrying in ${Math.round(delay)}ms...`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Simple upload queue to process uploads sequentially when needed.
 */
class UploadQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  async add(uploadFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ uploadFn, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const { uploadFn, resolve, reject } = this.queue.shift();
    
    try {
      const result = await withExponentialBackoff(uploadFn);
      recordUpload();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.processing = false;
      this.process();
    }
  }
}

export const uploadQueue = new UploadQueue();
