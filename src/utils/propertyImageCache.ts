// frontend/src/utils/propertyImageCache.ts
/**
 * Utility for caching property images locally to avoid repeated requests
 */

const CACHE_KEY = 'property_images_cache';
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds

interface CachedImage {
  id: number;
  property_id: number;
  path: string;
  url: string;
  is_primary: boolean;
}

interface CacheEntry {
  timestamp: number;
  images: CachedImage[];
}

interface ImageCache {
  [propertyId: number]: CacheEntry;
}

/**
 * Save images to local cache
 */
export const cachePropertyImages = (propertyId: number, images: any[]): void => {
  try {
    // Get existing cache
    const cacheString = localStorage.getItem(CACHE_KEY);
    const cache: ImageCache = cacheString ? JSON.parse(cacheString) : {};
    
    // Update cache with new images
    cache[propertyId] = {
      timestamp: Date.now(),
      images: images
    };
    
    // Save updated cache
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    
    console.log(`Cached ${images.length} images for property ${propertyId}`);
  } catch (error) {
    console.error('Error caching property images:', error);
  }
};

/**
 * Get cached images for a property if they exist and are not expired
 */
export const getCachedPropertyImages = (propertyId: number): CachedImage[] | null => {
  try {
    // Get existing cache
    const cacheString = localStorage.getItem(CACHE_KEY);
    if (!cacheString) return null;
    
    const cache: ImageCache = JSON.parse(cacheString);
    const cacheEntry = cache[propertyId];
    
    // Check if cache exists and is not expired
    if (cacheEntry && (Date.now() - cacheEntry.timestamp) < CACHE_EXPIRY) {
      console.log(`Using cached images for property ${propertyId}`);
      return cacheEntry.images;
    }
    
    return null;
  } catch (error) {
    console.error('Error retrieving cached property images:', error);
    return null;
  }
};

/**
 * Get multiple properties' images from cache
 */
export const getCachedImagesForProperties = (propertyIds: number[]): Record<number, CachedImage[]> => {
  const result: Record<number, CachedImage[]> = {};
  
  propertyIds.forEach(id => {
    const cachedImages = getCachedPropertyImages(id);
    if (cachedImages && cachedImages.length > 0) {
      result[id] = cachedImages;
    }
  });
  
  return result;
};

/**
 * Clean expired entries from the cache
 */
export const cleanupExpiredCache = (): void => {
  try {
    // Get existing cache
    const cacheString = localStorage.getItem(CACHE_KEY);
    if (!cacheString) return;
    
    const cache: ImageCache = JSON.parse(cacheString);
    let hasChanges = false;
    
    // Remove expired entries
    Object.keys(cache).forEach(propertyId => {
      if ((Date.now() - cache[parseInt(propertyId)].timestamp) > CACHE_EXPIRY) {
        delete cache[parseInt(propertyId)];
        hasChanges = true;
      }
    });
    
    // Save updated cache if changes were made
    if (hasChanges) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    }
  } catch (error) {
    console.error('Error cleaning up property image cache:', error);
  }
};

// Cleanup expired cache entries when the module is loaded
cleanupExpiredCache();