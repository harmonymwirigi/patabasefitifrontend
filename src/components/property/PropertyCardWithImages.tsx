// frontend/src/components/property/PropertyCardWithImages.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePropertyImages } from '../../hooks/usePropertyImages';

interface PropertyCardProps {
  id: number;
  title: string;
  address: string;
  city: string;
  rent_amount: number;
  bedrooms: number;
  bathrooms: number;
  property_type: string;
  image_url?: string;
  verification_status: string;
  availability_status: string;
}

const PropertyCardWithImages: React.FC<PropertyCardProps> = ({
  id,
  title,
  address,
  city,
  rent_amount,
  bedrooms,
  bathrooms,
  property_type,
  image_url,
  verification_status,
  availability_status,
}) => {
  const [finalImageUrl, setFinalImageUrl] = useState<string>('');
  
  // Use our custom hook to fetch images for this property
  const { images, loading: imagesLoading } = usePropertyImages(id);
  
  // Default image if none provided
  const defaultImage = '/assets/images/property-placeholder.jpg';
  
  // Format currency
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Set the best available image URL
  useEffect(() => {
    // Use the provided image_url if it exists
    if (image_url) {
      if (image_url.startsWith('/uploads/') || image_url.startsWith('http')) {
        setFinalImageUrl(image_url);
      } else {
        setFinalImageUrl(`/uploads/${image_url}`);
      }
      return;
    }
    
    // Otherwise, use the first image from our fetched images
    if (images && images.length > 0) {
      setFinalImageUrl(images[0].url);
      return;
    }
    
    // Default placeholder if nothing else is available
    setFinalImageUrl(defaultImage);
  }, [image_url, images, defaultImage, id]);
  
  // Handle image loading errors
  const handleImageError = () => {
    console.error(`Error loading image for property ${id}: ${finalImageUrl}`);
    
    // If we have other images from the hook, try the next one
    if (images.length > 1 && finalImageUrl === images[0].url) {
      console.log(`Trying next image for property ${id}`);
      setFinalImageUrl(images[1].url);
      return;
    }
    
    // If all else fails, use the default image
    setFinalImageUrl(defaultImage);
  };
  
  return (
    <Link to={`/properties/${id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="relative h-48 overflow-hidden">
          {imagesLoading ? (
            <div className="animate-pulse bg-gray-300 h-full w-full flex items-center justify-center">
              <p className="text-gray-500 text-sm">Loading...</p>
            </div>
          ) : (
            <img
              src={finalImageUrl}
              alt={title}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          )}
          
          {verification_status === 'verified' && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md">
              Verified
            </div>
          )}
          
          {availability_status !== 'available' && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-bold text-lg uppercase">
                {availability_status}
              </span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 truncate">{title}</h3>
          <p className="text-gray-600 text-sm mt-1 truncate">{address}, {city}</p>
          
          <div className="mt-3 flex justify-between items-center">
            <span className="text-blue-600 font-bold text-lg">
              {formatPrice(rent_amount)}
            </span>
            <span className="text-gray-500 text-sm">Per Month</span>
          </div>
          
          <div className="mt-3 flex items-center text-sm text-gray-500 border-t pt-3">
            <div className="flex items-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>{property_type}</span>
            </div>
            <div className="flex items-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{bedrooms} bed</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{bathrooms} bath</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCardWithImages;