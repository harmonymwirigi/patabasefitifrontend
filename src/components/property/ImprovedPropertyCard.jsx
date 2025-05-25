// frontend/src/components/property/ImprovedPropertyCard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config/constants';

const ImprovedPropertyCard = ({
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
  const [imageState, setImageState] = useState({
    url: '',
    loading: true,
    error: false,
    retries: 0,
  });
  
  // Default image if none provided
  const DEFAULT_IMAGE = '/assets/images/property-placeholder.jpg';
  
  // Format currency
  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Helper to check if an image URL is valid
  const isValidImageUrl = async (url) => {
    if (!url) return false;
    
    // Create an image object to test loading
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      
      // Set a timeout in case the image takes too long
      setTimeout(() => resolve(false), 5000);
    });
  };
  
  // Process image URL to ensure proper format
  const processImageUrl = (url) => {
    if (!url) return '';
    
    // If already has proper prefix or is absolute URL
    if (url.startsWith('/uploads/') || url.startsWith('http')) {
      return url;
    }
    
    // Add uploads prefix if needed
    return `/uploads/${url}`;
  };
  
  // Try to fetch image from debug endpoint as a last resort
  const tryFetchDebugImages = async () => {
    try {
      console.log(`Trying debug endpoint for property ${id}`);
      const response = await axios.get(`/api/debug/list-property-images/${id}`);
      
      if (response.data.exists && response.data.files && response.data.files.length > 0) {
        // Use the first image from debug endpoint
        const debugImageUrl = response.data.files[0].url;
        console.log(`Found debug image: ${debugImageUrl}`);
        return debugImageUrl;
      }
    } catch (error) {
      console.error(`Error fetching debug images for property ${id}:`, error);
    }
    return null;
  };
  
  // Set up the image with the best available source
  useEffect(() => {
    const setupImage = async () => {
      setImageState(prev => ({ ...prev, loading: true }));
      
      try {
        // Start with the provided image_url
        if (image_url) {
          const processedUrl = processImageUrl(image_url);
          const isValid = await isValidImageUrl(processedUrl);
          
          if (isValid) {
            setImageState({
              url: processedUrl,
              loading: false,
              error: false,
              retries: 0,
            });
            return;
          }
        }
        
        // If we get here, try the debug endpoint
        const debugImageUrl = await tryFetchDebugImages();
        if (debugImageUrl) {
          setImageState({
            url: debugImageUrl,
            loading: false,
            error: false,
            retries: 0,
          });
          return;
        }
        
        // If all else fails, use default image
        setImageState({
          url: DEFAULT_IMAGE,
          loading: false,
          error: true,
          retries: 0,
        });
      } catch (error) {
        console.error(`Error setting up image for property ${id}:`, error);
        setImageState({
          url: DEFAULT_IMAGE,
          loading: false,
          error: true,
          retries: 0,
        });
      }
    };
    
    setupImage();
  }, [id, image_url]);
  
  // Handle image loading error
  const handleImageError = async () => {
    // Only retry a limited number of times
    if (imageState.retries >= 2) {
      setImageState(prev => ({
        ...prev,
        url: DEFAULT_IMAGE,
        error: true,
        loading: false,
      }));
      return;
    }
    
    // Try debug endpoint if not already done
    if (imageState.retries === 1) {
      const debugImageUrl = await tryFetchDebugImages();
      if (debugImageUrl) {
        setImageState(prev => ({
          ...prev,
          url: debugImageUrl,
          retries: prev.retries + 1,
        }));
        return;
      }
    }
    
    // If image_url doesn't have /uploads/ prefix and isn't an absolute URL, try adding it
    if (image_url && !image_url.startsWith('/uploads/') && !image_url.startsWith('http')) {
      setImageState(prev => ({
        ...prev,
        url: `/uploads/${image_url}`,
        retries: prev.retries + 1,
      }));
      return;
    }
    
    // Default fallback
    setImageState(prev => ({
      ...prev,
      url: DEFAULT_IMAGE,
      error: true,
      loading: false,
      retries: prev.retries + 1,
    }));
  };
  
  return (
    <Link to={`/properties/${id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="relative h-48 overflow-hidden">
          {imageState.loading ? (
            <div className="w-full h-full bg-gray-300 animate-pulse flex items-center justify-center">
              <span className="text-gray-500">Loading...</span>
            </div>
          ) : (
            <img
              src={imageState.url}
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

export default ImprovedPropertyCard;