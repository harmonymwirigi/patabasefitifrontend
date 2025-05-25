// File: frontend/src/components/property/PropertyGallery.tsx
// Modern, clean property gallery with smooth animations

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, Play, Pause } from 'lucide-react';

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
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);
  
  // Default placeholder image
  const defaultImage = {
    id: 0,
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmMGY0ZjgiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgZmlsbD0idXJsKCNnKSIvPjxjaXJjbGUgY3g9IjQwMCIgY3k9IjE4MCIgcj0iNDAiIGZpbGw9IiNkMWQ1ZGIiLz48cGF0aCBkPSJNMzAwIDMyMGwxMDAtMTAwIDUwIDUwIDEwMC0xMDB2MTUwSDMwMHoiIGZpbGw9IiNkMWQ1ZGIiLz48dGV4dCB4PSI1MCUiIHk9IjM4MCIgZm9udC1mYW1pbHk9InN5c3RlbS11aSwgLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmb250LXdlaWdodD0iNTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOWNhM2FmIiBkeT0iLjNlbSI+Tm8gSW1hZ2VzIEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=',
    is_primary: true
  };
  
  // Sort images to ensure primary image is first, fallback to default if empty
  const galleryImages = images.length > 0 
    ? [...images].sort((a, b) => {
        if (a.is_primary) return -1;
        if (b.is_primary) return 1;
        return 0;
      })
    : [defaultImage];
  
  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlay || galleryImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
    }, 4000);
    
    return () => clearInterval(interval);
  }, [isAutoPlay, galleryImages.length]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!showFullscreen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'Escape':
          setShowFullscreen(false);
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showFullscreen]);
  
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
  
  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay);
  };
  
  return (
    <>
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden group">
        {/* Main Image Container - Reduced height */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={galleryImages[activeImage]?.url}
            alt={`${title} - Image ${activeImage + 1}`}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              const img = e.currentTarget;
              const originalUrl = img.src;
              
              // Only try the fallback if it's not already a data URL
              if (!originalUrl.startsWith('data:')) {
                console.log(`Image failed to load: ${originalUrl}`);
                
                // Try different URL formats
                if (!originalUrl.includes('/uploads/')) {
                  const withUploads = `/uploads/${originalUrl}`;
                  console.log(`Trying with /uploads/ prefix: ${withUploads}`);
                  img.src = withUploads;
                  
                  // Set up another error handler for the corrected URL
                  img.onerror = () => {
                    console.log(`Still failed with uploads prefix, using placeholder`);
                    img.src = defaultImage.url;
                    img.onerror = null; // Prevent infinite loops
                  };
                } else {
                  // Already has uploads prefix, use placeholder
                  img.src = defaultImage.url;
                  img.onerror = null;
                }
              }
            }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          
          {/* Navigation Buttons */}
          {galleryImages.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-3 text-gray-800 hover:bg-white hover:scale-110 focus:outline-none transition-all duration-200 opacity-0 group-hover:opacity-100"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-3 text-gray-800 hover:bg-white hover:scale-110 focus:outline-none transition-all duration-200 opacity-0 group-hover:opacity-100"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          
          {/* Top Controls */}
          <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {galleryImages.length > 1 && (
              <button
                onClick={toggleAutoPlay}
                className="bg-black/60 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/80 focus:outline-none transition-colors"
                aria-label={isAutoPlay ? "Pause slideshow" : "Start slideshow"}
              >
                {isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            )}
            
            <button
              onClick={toggleFullscreen}
              className="bg-black/60 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/80 focus:outline-none transition-colors"
              aria-label="View fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
          
          {/* Image Counter */}
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full font-medium">
            {activeImage + 1} / {galleryImages.length}
          </div>
          
          {/* Dots Indicator */}
          {galleryImages.length > 1 && galleryImages.length <= 8 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
              {galleryImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    activeImage === index 
                      ? 'bg-white w-6' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Thumbnails */}
        {galleryImages.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <div className="flex overflow-x-auto space-x-3 scrollbar-hide">
              {galleryImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => handleThumbnailClick(index)}
                  className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden transition-all duration-200 ${
                    activeImage === index 
                      ? 'ring-2 ring-white opacity-100 scale-105' 
                      : 'opacity-60 hover:opacity-100 hover:scale-105'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const img = e.currentTarget;
                      const originalUrl = img.src;
                      
                      if (!originalUrl.startsWith('data:')) {
                        console.log(`Thumbnail failed to load: ${originalUrl}`);
                        
                        if (!originalUrl.includes('/uploads/')) {
                          const withUploads = `/uploads/${originalUrl}`;
                          img.src = withUploads;
                          
                          img.onerror = () => {
                            img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjwvc3ZnPg==';
                            img.onerror = null;
                          };
                        } else {
                          img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjwvc3ZnPg==';
                          img.onerror = null;
                        }
                      }
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={galleryImages[activeImage]?.url}
              alt={`${title} - Image ${activeImage + 1}`}
              className="max-w-full max-h-full object-contain"
              loading="lazy"
              onError={(e) => {
                const img = e.currentTarget;
                const originalUrl = img.src;
                
                if (!originalUrl.startsWith('data:')) {
                  console.log(`Fullscreen image failed to load: ${originalUrl}`);
                  
                  if (!originalUrl.includes('/uploads/')) {
                    const withUploads = `/uploads/${originalUrl}`;
                    img.src = withUploads;
                    
                    img.onerror = () => {
                      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2VlZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                      img.onerror = null;
                    };
                  } else {
                    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2VlZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                    img.onerror = null;
                  }
                }
              }}
            />
            
            {/* Close Button */}
            <button
              onClick={toggleFullscreen}
              className="absolute top-6 right-6 bg-black/60 backdrop-blur-sm rounded-full p-3 text-white hover:bg-black/80 focus:outline-none transition-colors z-10"
              aria-label="Close fullscreen"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Navigation in Fullscreen */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-black/60 backdrop-blur-sm rounded-full p-4 text-white hover:bg-black/80 focus:outline-none transition-colors z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                
                <button
                  onClick={handleNext}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-black/60 backdrop-blur-sm rounded-full p-4 text-white hover:bg-black/80 focus:outline-none transition-colors z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
            
            {/* Fullscreen Counter */}
            <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full font-medium z-10">
              {activeImage + 1} of {galleryImages.length}
            </div>
            
            {/* Fullscreen Controls */}
            <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
              {galleryImages.length > 1 && (
                <button
                  onClick={toggleAutoPlay}
                  className="bg-black/60 backdrop-blur-sm rounded-full p-3 text-white hover:bg-black/80 focus:outline-none transition-colors"
                  aria-label={isAutoPlay ? "Pause slideshow" : "Start slideshow"}
                >
                  {isAutoPlay ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
              )}
            </div>
            
            {/* Thumbnail Strip in Fullscreen */}
            {galleryImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 max-w-md w-full px-6 z-10">
                <div className="flex overflow-x-auto space-x-2 scrollbar-hide bg-black/40 backdrop-blur-sm rounded-full p-2">
                  {galleryImages.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => handleThumbnailClick(index)}
                      className={`flex-shrink-0 w-12 h-8 rounded overflow-hidden transition-all duration-200 ${
                        activeImage === index 
                          ? 'ring-2 ring-white opacity-100' 
                          : 'opacity-50 hover:opacity-75'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const img = e.currentTarget;
                          const originalUrl = img.src;
                          
                          if (!originalUrl.startsWith('data:')) {
                            if (!originalUrl.includes('/uploads/')) {
                              const withUploads = `/uploads/${originalUrl}`;
                              img.src = withUploads;
                              
                              img.onerror = () => {
                                img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZGRkIi8+PC9zdmc+';
                                img.onerror = null;
                              };
                            } else {
                              img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZGRkIi8+PC9zdmc+';
                              img.onerror = null;
                            }
                          }
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* CSS Styles */}
      <style>
        {`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </>
  );
};

export default PropertyGallery;