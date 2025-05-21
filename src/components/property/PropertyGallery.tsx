// frontend/src/components/property/PropertyGallery.tsx
import React, { useState, useEffect } from 'react';

interface PropertyImage {
  id: number;
  url: string;
  is_primary?: boolean;
}

interface PropertyGalleryProps {
  images: PropertyImage[];
  title: string;
}

const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images, title }) => {
  const [activeImage, setActiveImage] = useState<number>(0);
  const [showFullscreen, setShowFullscreen] = useState<boolean>(false);
  
  // Default image if none provided
  const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzg4OCIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  
  useEffect(() => {
    console.log("PropertyGallery received images:", images);
  }, [images]);
  
  // Sort images to ensure primary image is first
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return 0;
  });
  
  // If no images provided, use default
  const galleryImages = sortedImages.length > 0 
    ? sortedImages 
    : [{ id: 0, url: defaultImage, is_primary: true }];
  
  const handlePrev = () => {
    setActiveImage((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };
  
  const handleNext = () => {
    setActiveImage((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };
  
  const handleThumbnailClick = (index: number) => {
    setActiveImage(index);
  };
  
  const toggleFullscreen = () => {
    setShowFullscreen(!showFullscreen);
  };
  
  return (
    <>
      <div className="relative bg-gray-100 rounded-lg overflow-hidden">
        <div className="aspect-w-16 aspect-h-9 relative">
          <img
            src={galleryImages[activeImage]?.url}
            alt={`${title} - Image ${activeImage + 1}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              const img = e.currentTarget;
              const url = img.src;
              console.error(`Error loading image: ${url}`);
              
              // Try adding /uploads prefix if not already present and not a data URL
              if (!url.startsWith('data:') && !url.startsWith('/uploads/')) {
                const newUrl = `/uploads/${url}`;
                console.log(`Attempting to correct URL from ${url} to ${newUrl}`);
                img.src = newUrl;
                
                // Add a second error handler for the corrected URL
                img.onerror = () => {
                  console.error(`Still failed with corrected URL: ${newUrl}, using fallback`);
                  img.src = defaultImage;
                  img.onerror = null; // Prevent infinite error loops
                };
              } else {
                // Use the fallback image
                img.src = defaultImage;
              }
            }}
          />
          
          {/* Image navigation buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 text-gray-800 hover:bg-opacity-100 focus:outline-none"
            aria-label="Previous image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 text-gray-800 hover:bg-opacity-100 focus:outline-none"
            aria-label="Next image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="absolute bottom-2 right-2 bg-white bg-opacity-80 rounded-full p-2 text-gray-800 hover:bg-opacity-100 focus:outline-none"
            aria-label="Toggle fullscreen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
          </button>
          
          {/* Image counter */}
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-sm px-2 py-1 rounded">
            {activeImage + 1}/{galleryImages.length}
          </div>
        </div>
        
        {/* Thumbnails */}
        {galleryImages.length > 1 && (
          <div className="flex overflow-x-auto space-x-2 p-2">
            {galleryImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => handleThumbnailClick(index)}
                className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden ${
                  activeImage === index ? 'ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const img = e.currentTarget;
                    const url = img.src;
                    console.error(`Error loading thumbnail: ${url}`);
                    
                    // Try adding /uploads prefix if not already present
                    if (!url.startsWith('data:') && !url.startsWith('/uploads/')) {
                      const newUrl = `/uploads/${url}`;
                      console.log(`Attempting to correct thumbnail URL from ${url} to ${newUrl}`);
                      img.src = newUrl;
                      
                      // Add a second error handler for the corrected URL
                      img.onerror = () => {
                        console.error(`Still failed with corrected URL: ${newUrl}`);
                        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjwvc3ZnPg==';
                        img.onerror = null; // Prevent infinite error loops
                      };
                    } else {
                      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjwvc3ZnPg==';
                    }
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Fullscreen modal */}
      {showFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <div className="relative w-full h-full">
            <img
              src={galleryImages[activeImage]?.url}
              alt={`${title} - Image ${activeImage + 1}`}
              className="max-w-full max-h-full m-auto object-contain"
              onError={(e) => {
                const img = e.currentTarget;
                const url = img.src;
                console.error(`Error loading fullscreen image: ${url}`);
                
                // Try adding /uploads prefix if not already present
                if (!url.startsWith('data:') && !url.startsWith('/uploads/')) {
                  const newUrl = `/uploads/${url}`;
                  console.log(`Attempting to correct fullscreen URL from ${url} to ${newUrl}`);
                  img.src = newUrl;
                  
                  // Add a second error handler for the corrected URL
                  img.onerror = () => {
                    console.error(`Still failed with corrected URL: ${newUrl}`);
                    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsc2Fucy1zZXJpZiIgZm9udC1zaXplPSIzMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2VlZSIgZHk9Ii4zZW0iPk5vIEltYWdlIEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';
                    img.onerror = null; // Prevent infinite error loops
                  };
                } else {
                  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsc2Fucy1zZXJpZiIgZm9udC1zaXplPSIzMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2VlZSIgZHk9Ii4zZW0iPk5vIEltYWdlIEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';
                }
              }}
            />
            
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 bg-white bg-opacity-80 rounded-full p-2 text-gray-800 hover:bg-opacity-100 focus:outline-none"
              aria-label="Close fullscreen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-3 text-gray-800 hover:bg-opacity-100 focus:outline-none"
              aria-label="Previous image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-3 text-gray-800 hover:bg-opacity-100 focus:outline-none"
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Image counter */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded">
              {activeImage + 1}/{galleryImages.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyGallery;