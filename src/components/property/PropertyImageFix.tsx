// frontend/src/components/property/PropertyImageFix.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../../config/constants';

interface PropertyImageFixProps {
  propertyId: number;
  onFixedImages?: (images: any[]) => void;
}

/**
 * This component is used as a fallback to fetch images directly from the debug endpoint
 * when the normal API doesn't return any images for a property.
 */
const PropertyImageFix: React.FC<PropertyImageFixProps> = ({ propertyId, onFixedImages }) => {
  const [isFixing, setIsFixing] = useState(false);
  const [fixResult, setFixResult] = useState<string | null>(null);
  const [fixedImages, setFixedImages] = useState<any[]>([]);

  useEffect(() => {
    if (propertyId) {
      fetchImagesDirectly();
    }
  }, [propertyId]);

  const fetchImagesDirectly = async () => {
    setIsFixing(true);
    try {
      // Try to fetch images from the debug endpoint
      const response = await fetch(`/api/debug/list-property-images/${propertyId}`);
      const data = await response.json();
      
      if (data.exists && data.files && data.files.length > 0) {
        console.log("PropertyImageFix: Found images through debug endpoint:", data.files);
        
        // Create synthetic image objects from debug data
        const syntheticImages = data.files.map((file: any, index: number) => ({
          id: index + 1,
          property_id: propertyId,
          path: `properties/${propertyId}/${file.filename}`,
          is_primary: index === 0,
          uploaded_at: new Date(file.last_modified * 1000).toISOString()
        }));
        
        setFixedImages(syntheticImages);
        setFixResult(`Fixed: Found ${syntheticImages.length} images`);
        
        // Call the callback with the fixed images
        if (onFixedImages) {
          onFixedImages(syntheticImages);
        }
      } else {
        setFixResult("No images found in the debug endpoint");
      }
    } catch (err) {
      console.error("Error fetching images from debug endpoint:", err);
      setFixResult(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsFixing(false);
    }
  };

  // Fix the database itself by adding the images to the property record
  const fixDatabase = async () => {
    if (fixedImages.length === 0) {
      return;
    }
    
    setIsFixing(true);
    try {
      // This would be a hypothetical endpoint to add the missing images to the property record
      // You would need to implement this endpoint on your backend
      const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/fix-images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images: fixedImages }),
      });
      
      if (response.ok) {
        setFixResult("Successfully added images to the property record in the database");
      } else {
        setFixResult(`Failed to update database: ${response.statusText}`);
      }
    } catch (err) {
      console.error("Error fixing property images in database:", err);
      setFixResult(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsFixing(false);
    }
  };

  if (!propertyId) {
    return null;
  }

  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-lg border text-sm">
      <h3 className="font-medium text-gray-700 mb-2">Image Fix Status</h3>
      
      {isFixing ? (
        <div className="text-blue-600">Fixing image references...</div>
      ) : fixResult ? (
        <div className={fixResult.startsWith("Error") ? "text-red-600" : "text-green-600"}>
          {fixResult}
        </div>
      ) : null}
      
      {fixedImages.length > 0 && (
        <div className="mt-2">
          <h4 className="font-medium text-gray-700 mb-1">Fixed Images:</h4>
          <ul className="list-disc list-inside">
            {fixedImages.map((img, index) => (
              <li key={index}>
                {img.path} {img.is_primary ? "(Primary)" : ""}
              </li>
            ))}
          </ul>
          
          {/* This button would be useful if you implement the database fix endpoint */}
          {/*
          <button
            onClick={fixDatabase}
            disabled={isFixing}
            className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            Fix Database Records
          </button>
          */}
        </div>
      )}
    </div>
  );
};

export default PropertyImageFix;