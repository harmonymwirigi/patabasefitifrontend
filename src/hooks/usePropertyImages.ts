// frontend/src/hooks/usePropertyImages.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

/**
 * Custom hook to fetch and manage property images
 * @param {number} propertyId - The ID of the property
 * @returns {Object} - Images data and loading state
 */
export const usePropertyImages = (propertyId) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      if (!propertyId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // First try to use the debug endpoint to get images
        const debugResponse = await axios.get(`/api/debug/list-property-images/${propertyId}`);
        
        if (debugResponse.data.exists && debugResponse.data.files && debugResponse.data.files.length > 0) {
          // Transform the debug data into our expected format
          const imageData = debugResponse.data.files.map((file, index) => ({
            id: index + 1,
            property_id: propertyId,
            path: file.filename,
            url: file.url,
            is_primary: index === 0,
            uploaded_at: new Date(file.last_modified * 1000).toISOString()
          }));
          
          setImages(imageData);
          setLoading(false);
          return;
        }
        
        // If debug endpoint doesn't have images, try the property detail endpoint
        try {
          const response = await axios.get(`${API_BASE_URL}/properties/${propertyId}`);
          
          if (response.data && response.data.images && response.data.images.length > 0) {
            // Process image URLs to ensure they're properly formatted
            const processedImages = response.data.images.map(img => ({
              ...img,
              url: processImageUrl(img.path)
            }));
            
            setImages(processedImages);
          } else {
            setImages([]);
          }
        } catch (error) {
          console.error(`Error fetching property details for images: ${error}`);
          setImages([]);
        }
      } catch (err) {
        console.error(`Error fetching property images: ${err}`);
        setError(err.message || 'Failed to load images');
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [propertyId]);

  // Helper function to process image URLs
  const processImageUrl = (path) => {
    if (!path) return '';
    
    // If already has uploads prefix or is an absolute URL
    if (path.startsWith('/uploads/') || path.startsWith('http')) {
      return path;
    }
    
    // Add uploads prefix
    return `/uploads/${path}`;
  };

  return { images, loading, error };
};

export default usePropertyImages;