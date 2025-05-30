// frontend/src/components/property/PropertyListingFix.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { searchProperties, getAllProperties } from '../../api/properties';
import { useAuth } from '../../hooks/useAuth';
import PropertyCard from '../../components/property/PropertyCard';
import PropertySearchFilters from '../../components/property/PropertySearchFilters';
import { Alert } from '../../components/common/Alert';
import TokenBalance from '../../components/token/TokenBalance';
import TokenPurchaseModal from '../../components/token/TokenPurchaseModal';
import { formatImageUrl } from '../../utils/imageUtils';

const PropertyListing: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [imageDebugInfo, setImageDebugInfo] = useState<Record<string, any>>({});
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 12;
  
  // Parse search params from URL
  const searchParams = new URLSearchParams(location.search);
  const initialFilters = {
    property_type: searchParams.get('property_type') || '',
    city: searchParams.get('city') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    keyword: searchParams.get('keyword') || '',
    amenities: searchParams.getAll('amenities') || [],
  };
  
  // Convert string values to appropriate types
  const parsedFilters = {
    ...initialFilters,
    bedrooms: initialFilters.bedrooms ? parseInt(initialFilters.bedrooms) : '',
    min_price: initialFilters.min_price ? parseInt(initialFilters.min_price) : '',
    max_price: initialFilters.max_price ? parseInt(initialFilters.max_price) : '',
  };
  
  // Track if we're using search or just listing all properties
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>(parsedFilters);
  
  useEffect(() => {
    // Check if there are any active filters in the URL
    const hasActiveFilters = Object.values(parsedFilters).some(value => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== '' && value !== null;
    });
    
    setIsSearching(hasActiveFilters);
    
    if (hasActiveFilters) {
      handleSearch(parsedFilters);
    } else {
      fetchProperties();
    }
  }, [token, page]);
  
  // Check image URLs and get debug info
  const checkAndDebugImages = async (properties: any[]) => {
    const debugInfo: Record<string, any> = {};
    
    for (const property of properties) {
      // Skip properties with no images
      if (!property.images || property.images.length === 0) continue;
      
      // Get image info from debug endpoint
      try {
        const response = await fetch(`/api/debug/list-property-images/${property.id}`);
        const data = await response.json();
        
        if (data.exists) {
          debugInfo[property.id] = {
            propertyId: property.id,
            imagesInDb: property.images.length,
            imagesOnDisk: data.files?.length || 0,
            fileDetails: data.files || []
          };
        }
      } catch (err) {
        console.error(`Error checking images for property ${property.id}:`, err);
      }
    }
    
    setImageDebugInfo(debugInfo);
    return debugInfo;
  };
  
  const fetchProperties = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getAllProperties(token, {
        skip: (page - 1) * pageSize,
        limit: pageSize,
      });
      
      // Process properties to ensure images have proper paths
      const processedProperties = processPropertyImages(response);
      setProperties(processedProperties);
      
      // Debug images in development mode
      if (process.env.NODE_ENV === 'development') {
        checkAndDebugImages(processedProperties);
      }
      
      // TODO: Get total count for pagination from API response
      // For now, just assume there might be more pages if we got a full page
      setTotalPages(response.length === pageSize ? page + 1 : page);
    } catch (err: any) {
      console.error('Error fetching properties:', err);
      
      if (err.response && err.response.status === 402) {
        setError('You need tokens to view property listings. Please purchase tokens to continue.');
      } else {
        setError('Failed to load properties. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async (filters: any) => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    setIsSearching(true);
    setActiveFilters(filters);
    
    // Update URL with search params
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v: string) => params.append(key, v));
      } else if (value !== '' && value !== null) {
        params.set(key, String(value));
      }
    });
    
    navigate(`/properties?${params.toString()}`);
    
    try {
      const response = await searchProperties(token, {
        ...filters,
        skip: (page - 1) * pageSize,
        limit: pageSize,
      });
      
      // Process properties to ensure images have proper paths
      const processedProperties = processPropertyImages(response);
      setProperties(processedProperties);
      
      // Debug images in development mode
      if (process.env.NODE_ENV === 'development') {
        checkAndDebugImages(processedProperties);
      }
      
      // TODO: Get total count for pagination from API response
      // For now, just assume there might be more pages if we got a full page
      setTotalPages(response.length === pageSize ? page + 1 : page);
    } catch (err: any) {
      console.error('Error searching properties:', err);
      
      if (err.response && err.response.status === 402) {
        setError('You need tokens to search properties. Please purchase tokens to continue.');
      } else {
        setError('Failed to search properties. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Process property images to ensure correct paths and handle missing images
  const processPropertyImages = (properties: any[]) => {
    return properties.map(property => {
      // If property has no images, return as is with no image
      if (!property.images || property.images.length === 0) {
        console.log(`Property ${property.id} has no images`);
        return {
          ...property,
          main_image_url: undefined
        };
      }
      
      // Find primary image or use first image
      let primaryImage = property.images.find((img: any) => img.is_primary);
      if (!primaryImage) {
        primaryImage = property.images[0];
      }
      
      // Ensure image path has correct format
      let imagePath = primaryImage.path;
      
      // Log the raw path for debugging
      console.log(`Property ${property.id} raw image path:`, imagePath);
      
      // Format the image URL
      const formattedUrl = formatImageUrl(imagePath);
      console.log(`Property ${property.id} formatted image URL:`, formattedUrl);
      
      // Return property with processed image URL
      return {
        ...property,
        main_image_url: formattedUrl
      };
    });
  };
  
  const handleClearSearch = () => {
    setIsSearching(false);
    setActiveFilters({});
    navigate('/properties');
    fetchProperties();
  };
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isSearching ? 'Search Results' : 'All Properties'}
          </h1>
          <p className="text-gray-600 mt-1">
            {loading ? 'Loading properties...' : `${properties.length} properties found`}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-2">
          <TokenBalance
            showBuyButton={true}
            onClickBuy={() => setShowTokenModal(true)}
          />
        </div>
      </div>
      
      <PropertySearchFilters
        onSearch={handleSearch}
        initialValues={activeFilters}
      />
      
      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-6"
          onClose={() => setError(null)}
        />
      )}
      
      {isSearching && (
        <div className="mb-6 flex items-center justify-between bg-blue-50 p-4 rounded-md">
          <div className="text-blue-700">
            <span className="font-medium">Search Active:</span> Showing results based on your filters.
          </div>
          <button
            onClick={handleClearSearch}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm focus:outline-none"
          >
            Clear Search
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-300"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="h-6 bg-gray-300 rounded w-1/4 mb-2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : properties.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                title={property.title}
                address={property.address}
                city={property.city}
                rent_amount={property.rent_amount}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                property_type={property.property_type}
                image_url={property.main_image_url}
                verification_status={property.verification_status}
                availability_status={property.availability_status}
              />
            ))}
          </div>
          
          {/* Image Debug Info (Development Only) */}
          {process.env.NODE_ENV === 'development' && Object.keys(imageDebugInfo).length > 0 && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
              <h3 className="font-bold text-lg mb-2">Image Debug Info</h3>
              <div className="text-xs font-mono overflow-auto">
                {Object.entries(imageDebugInfo).map(([id, info]) => (
                  <div key={id} className="mb-2 p-2 border rounded">
                    <p>Property ID: {id}</p>
                    <p>Images in DB: {info.imagesInDb}</p>
                    <p>Images on disk: {info.imagesOnDisk}</p>
                    {info.fileDetails && info.fileDetails.length > 0 && (
                      <div className="mt-1">
                        <p>Files:</p>
                        <ul className="pl-4">
                          {info.fileDetails.map((file: any, i: number) => (
                            <li key={i}>
                              {file.filename} ({file.size} bytes)
                              <a 
                                href={file.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="ml-2 text-blue-500 hover:underline"
                              >
                                View
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`px-3 py-1 rounded-md ${
                    page === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-3 py-1 rounded-md ${
                      page === index + 1
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className={`px-3 py-1 rounded-md ${
                    page === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <h3 className="mt-4 text-xl font-medium text-gray-900">No properties found</h3>
          <p className="mt-2 text-gray-600 max-w-md mx-auto">
            {isSearching
              ? 'No properties match your search criteria. Try adjusting your filters.'
              : 'There are no properties available at the moment. Please check back later.'}
          </p>
          {isSearching && (
            <button
              onClick={handleClearSearch}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
      
      <TokenPurchaseModal
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
      />
    </div>
  );
};

export default PropertyListing;