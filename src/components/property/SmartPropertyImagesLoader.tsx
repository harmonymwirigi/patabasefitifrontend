// frontend/src/components/property/SmartPropertyImagesLoader.tsx
import React, { useState, useEffect } from 'react';
import { 
  getCachedImagesForProperties, 
  cachePropertyImages 
} from '../../utils/propertyImageCache';

interface SmartPropertyImagesLoaderProps {
  propertyIds: number[];
  onImagesLoaded: (imagesMap: Record<number, any[]>) => void;
  batchSize?: number;
  batchDelay?: number;
  showProgressBar?: boolean;
}

/**
 * A smarter property images loader that:
 * 1. First checks local cache
 * 2. Only loads missing images from the server
 * 3. Updates cache with new images
 * 4. Optionally shows progress (can be hidden)
 */
const SmartPropertyImagesLoader: React.FC<SmartPropertyImagesLoaderProps> = ({
  propertyIds,
  onImagesLoaded,
  batchSize = 5,
  batchDelay = 300,
  showProgressBar = false
}) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imagesMap, setImagesMap] = useState<Record<number, any[]>>({});

  useEffect(() => {
    if (!propertyIds || propertyIds.length === 0) {
      return;
    }

    const loadPropertyImages = async () => {
      // First check cache for all properties
      const cachedImages = getCachedImagesForProperties(propertyIds);
      
      // Initialize results with cached data
      const results: Record<number, any[]> = { ...cachedImages };
      
      // Determine which properties need to be loaded from server
      const uncachedPropertyIds = propertyIds.filter(id => !results[id]);
      
      if (uncachedPropertyIds.length === 0) {
        // All images were in cache, no need to load from server
        console.log('All property images loaded from cache');
        setImagesMap(results);
        onImagesLoaded(results);
        return;
      }
      
      // Load uncached images from server in batches
      setLoading(true);
      
      // Only show progress for uncached properties
      const totalToLoad = uncachedPropertyIds.length;
      let loadedCount = 0;
      
      // Process properties in batches
      for (let i = 0; i < uncachedPropertyIds.length; i += batchSize) {
        const batch = uncachedPropertyIds.slice(i, i + batchSize);
        
        // Load each property's images in parallel within the batch
        await Promise.all(batch.map(async (propertyId) => {
          try {
            const response = await fetch(`/api/debug/list-property-images/${propertyId}`);
            const data = await response.json();
            
            if (data.exists && data.files && data.files.length > 0) {
              console.log(`Loaded ${data.files.length} images for property ${propertyId} from server`);
              
              const images = data.files.map((file: any, index: number) => ({
                id: index + 1,
                property_id: propertyId,
                path: `properties/${propertyId}/${file.filename}`,
                url: `/uploads/properties/${propertyId}/${file.filename}`,
                is_primary: index === 0,
                last_modified: file.last_modified
              }));
              
              results[propertyId] = images;
              
              // Cache the images for future use
              cachePropertyImages(propertyId, images);
            } else {
              // Cache empty result to avoid future requests
              results[propertyId] = [];
              cachePropertyImages(propertyId, []);
            }
          } catch (err) {
            console.error(`Error loading images for property ${propertyId}:`, err);
            results[propertyId] = [];
          }
          
          loadedCount++;
          if (totalToLoad > 0) {
            setProgress(Math.floor((loadedCount / totalToLoad) * 100));
          }
        }));
        
        // Add delay between batches to avoid overwhelming the server
        if (i + batchSize < uncachedPropertyIds.length) {
          await new Promise(resolve => setTimeout(resolve, batchDelay));
        }
      }
      
      setImagesMap(results);
      setLoading(false);
      onImagesLoaded(results);
    };

    loadPropertyImages();
  }, [propertyIds, batchSize, batchDelay, onImagesLoaded]);

  // Only show progress bar if loading and explicitly enabled
  return (loading && showProgressBar) ? (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-md p-2 z-50 w-64 transition-opacity duration-300">
      <div className="flex justify-between items-center mb-1">
        <div className="text-xs text-gray-600">Loading property images</div>
        <div className="text-xs font-medium">{progress}%</div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1">
        <div 
          className="bg-blue-600 h-1 rounded-full transition-all duration-300 ease-in-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  ) : null;
};

export default SmartPropertyImagesLoader;