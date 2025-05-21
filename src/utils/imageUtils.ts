// frontend/src/utils/imageUtils.ts
/**
 * Utility functions for handling images throughout the application
 */

/**
 * Format an image URL to ensure it has the correct prefix
 * @param url - The original image URL
 * @param defaultImage - The fallback image URL to use if none provided
 * @returns The properly formatted image URL
 */
export const formatImageUrl = (url: string | undefined, defaultImage: string = '/assets/images/property-placeholder.jpg'): string => {
  if (!url) {
    return defaultImage;
  }
  
  // If URL already starts with /uploads/ or http, use it as is
  if (url.startsWith('/uploads/') || url.startsWith('http')) {
    return url;
  }
  
  // Otherwise, add the /uploads/ prefix
  return `/uploads/${url}`;
};

/**
 * Check if an image URL is accessible by loading it
 * @param url - The image URL to check
 * @returns A promise that resolves to true if the image can be loaded, false otherwise
 */
export const isImageAccessible = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    
    // Add timestamp to avoid caching
    img.src = `${url}?t=${new Date().getTime()}`;
    
    // Set a timeout to avoid hanging
    setTimeout(() => resolve(false), 5000);
  });
};

/**
 * Process an array of property images to ensure the primary image is first
 * and all image paths are correctly formatted
 * @param images - Array of property image objects
 * @returns Processed array of images with correct paths
 */
export const processPropertyImages = (images: any[]): any[] => {
  if (!images || images.length === 0) {
    return [];
  }
  
  // Sort to ensure primary image is first
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return 0;
  });
  
  // Format all image URLs
  return sortedImages.map(img => ({
    ...img,
    url: formatImageUrl(img.path)
  }));
};

/**
 * Preload an image to ensure it's in the browser cache
 * @param url - The image URL to preload
 * @returns A promise that resolves when the image is loaded
 */
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${url}`));
    img.src = url;
  });
};

/**
 * Generate a preview URL for an uploaded file
 * @param file - The file to generate a preview for
 * @returns A data URL representing the file
 */
export const generatePreviewUrl = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
};