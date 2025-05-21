// frontend/src/hooks/usePropertyImages.ts
import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch property images from the debug endpoint
 * @param propertyId - The ID of the property to fetch images for
 * @returns Object containing the fetched images and loading state
 */
export function usePropertyImages(propertyId: number | undefined) {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) {
      return;
    }

    const fetchImages = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try to fetch images from the debug endpoint
        const response = await fetch(`/api/debug/list-property-images/${propertyId}`);
        const data = await response.json();

        if (data.exists && data.files && data.files.length > 0) {
          console.log(`Found ${data.files.length} images for property ${propertyId} through debug endpoint`);
          
          // Create synthetic image objects from debug data
          const syntheticImages = data.files.map((file: any, index: number) => ({
            id: index + 1,
            property_id: propertyId,
            path: `properties/${propertyId}/${file.filename}`,
            url: `/uploads/properties/${propertyId}/${file.filename}`,
            is_primary: index === 0,
            uploaded_at: new Date(file.last_modified * 1000).toISOString()
          }));
          
          setImages(syntheticImages);
        } else {
          console.log(`No images found for property ${propertyId}`);
          setImages([]);
        }
      } catch (err) {
        console.error(`Error fetching images for property ${propertyId}:`, err);
        setError(`Failed to fetch images: ${err instanceof Error ? err.message : String(err)}`);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [propertyId]);

  return { images, loading, error };
}