// frontend/src/components/property/BatchPropertyImagesLoader.tsx
import React, { useState, useEffect } from 'react';

/**
 * This component efficiently loads images for multiple properties in batches
 * to avoid overwhelming the server with too many requests at once.
 */
interface BatchPropertyImagesLoaderProps {
  propertyIds: number[];
  onImagesLoaded: (imagesMap: Record<number, any[]>) => void;
  batchSize?: number;
  batchDelay?: number;
}

const BatchPropertyImagesLoader: React.FC<BatchPropertyImagesLoaderProps> = ({
  propertyIds,
  onImagesLoaded,
  batchSize = 3,
  batchDelay = 300
}) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imagesMap, setImagesMap] = useState<Record<number, any[]>>({});

  useEffect(() => {
    if (!propertyIds || propertyIds.length === 0) {
      return;
    }

    const loadImagesInBatches = async () => {
      setLoading(true);
      const totalProperties = propertyIds.length;
      let loadedCount = 0;
      const results: Record<number, any[]> = {};

      // Process properties in batches
      for (let i = 0; i < totalProperties; i += batchSize) {
        const batch = propertyIds.slice(i, i + batchSize);
        
        // Load each property's images in parallel within the batch
        await Promise.all(batch.map(async (propertyId) => {
          try {
            const response = await fetch(`/api/debug/list-property-images/${propertyId}`);
            const data = await response.json();
            
            if (data.exists && data.files && data.files.length > 0) {
              console.log(`Batch loader: Found ${data.files.length} images for property ${propertyId}`);
              
              const images = data.files.map((file: any, index: number) => ({
                id: index + 1,
                property_id: propertyId,
                path: `properties/${propertyId}/${file.filename}`,
                url: `/uploads/properties/${propertyId}/${file.filename}`,
                is_primary: index === 0,
                last_modified: file.last_modified
              }));
              
              results[propertyId] = images;
            } else {
              results[propertyId] = [];
            }
          } catch (err) {
            console.error(`Batch loader: Error loading images for property ${propertyId}:`, err);
            results[propertyId] = [];
          }
          
          loadedCount++;
          setProgress(Math.floor((loadedCount / totalProperties) * 100));
        }));
        
        // Add delay between batches to avoid overwhelming the server
        if (i + batchSize < totalProperties) {
          await new Promise(resolve => setTimeout(resolve, batchDelay));
        }
      }
      
      setImagesMap(results);
      setLoading(false);
      onImagesLoaded(results);
    };

    loadImagesInBatches();
  }, [propertyIds, batchSize, batchDelay, onImagesLoaded]);

  // This component doesn't render anything visible - it just loads data
  // You can add a progress indicator if needed
  return loading ? (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-md p-2 z-50">
      <div className="text-xs text-gray-600">Loading property images: {progress}%</div>
      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
        <div 
          className="bg-blue-600 h-1 rounded-full transition-all duration-300 ease-in-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  ) : null;
};

export default BatchPropertyImagesLoader;