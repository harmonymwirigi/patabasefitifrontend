// frontend/src/components/property/PropertyCard.jsx (Fixed)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const PropertyCard = ({
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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [finalImageUrl, setFinalImageUrl] = useState('');
  
  // Default image if none provided
  const defaultImage = '/assets/images/property-placeholder.jpg';
  
  // Format currency
  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Try to fetch images from debug endpoint
  const tryFetchDebugImages = async () => {
    try {
      console.log(`Fetching debug images for property ${id}`);
      const response = await axios.get(`/api/debug/list-property-images/${id}`);
      
      if (response.data.exists && response.data.files && response.data.files.length > 0) {
        console.log(`Found ${response.data.files.length} debug images for property ${id}`);
        return response.data.files[0].url;
      } else {
        console.log(`No debug images found for property ${id}`);
      }
    } catch (error) {
      console.error(`Error fetching debug images for property ${id}:`, error);
    }
    return null;
  };
  
  // Process and set the image URL
  useEffect(() => {
    const setupImage = async () => {
      // If no image_url provided, try debug endpoint first
      if (!image_url) {
        console.log(`Property ${id}: No image URL provided, checking debug endpoint`);
        
        const debugImageUrl = await tryFetchDebugImages();
        if (debugImageUrl) {
          console.log(`Using debug image for property ${id}: ${debugImageUrl}`);
          setFinalImageUrl(debugImageUrl);
          return;
        }
        
        console.log(`Property ${id}: No debug images found, using default`);
        setFinalImageUrl(defaultImage);
        return;
      }
      
      // Process the provided image_url
      if (image_url.startsWith('/uploads/') || image_url.startsWith('http')) {
        console.log(`Property ${id}: Using provided image URL: ${image_url}`);
        setFinalImageUrl(image_url);
      } else {
        console.log(`Property ${id}: Adding /uploads/ prefix to image URL: ${image_url}`);
        setFinalImageUrl(`/uploads/${image_url}`);
      }
    };
    
    setupImage();
  }, [image_url, id]);
  
  // Handle image loading errors
  const handleImageError = async () => {
    console.error(`Error loading image for property ${id}: ${finalImageUrl}`);
    setImageError(true);
    
    // If error loading the image, try debug endpoint
    if (!imageLoaded && !finalImageUrl.startsWith(defaultImage)) {
      console.log(`Trying debug endpoint for property ${id} after image error`);
      const debugImageUrl = await tryFetchDebugImages();
      
      if (debugImageUrl) {
        console.log(`Using debug image after error: ${debugImageUrl}`);
        setFinalImageUrl(debugImageUrl);
        return;
      }
    }
    
    // If already tried debug or it failed, use default
    console.log(`Using default image for property ${id} after all attempts failed`);
    setFinalImageUrl(defaultImage);
  };
  
  return (
    <Link to={`/properties/${id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="relative h-48 overflow-hidden">
          {/* Show either the property image or the default fallback */}
          <img
            src={finalImageUrl}
            alt={title}
            className="w-full h-full object-cover"
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
          />
          
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

export default PropertyCard;