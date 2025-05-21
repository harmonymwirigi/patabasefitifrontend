// frontend/src/pages/Properties/PropertyDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProperty } from '../../api/properties';
import { useAuth } from '../../hooks/useAuth';
import PropertyGallery from '../../components/property/PropertyGallery';
import PropertyMap from '../../components/property/PropertyMap';
import { Alert } from '../../components/common/Alert';
import TokenBalance from '../../components/token/TokenBalance';
import TokenPurchaseModal from '../../components/token/TokenPurchaseModal';
import MessageComposer from '../../components/messages/MessageComposer';
import { PROPERTY_TYPES, VERIFICATION_STATUSES, AVAILABILITY_STATUSES } from '../../config/constants';
import ImageDebugger from '../../components/debug/ImageDebugger';
import PropertyImageFix from '../../components/property/PropertyImageFix';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  
  const [imagesFixed, setImagesFixed] = useState(false);
  const [fixedImages, setFixedImages] = useState<any[]>([]);
  
  useEffect(() => {
    fetchPropertyDetails();
  }, [id, token, imagesFixed]);
  
  const fetchPropertyDetails = async () => {
    if (!token || !id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getProperty(token, parseInt(id));
      console.log("Property data:", data);
      
      // Check if images exist in the response
      if (!data.images || data.images.length === 0) {
        console.warn("Property has no images in API response");
        
        // Try to fetch images directly from the debug endpoint
        try {
          const debugResponse = await fetch(`/api/debug/list-property-images/${id}`);
          const debugData = await debugResponse.json();
          
          if (debugData.exists && debugData.files && debugData.files.length > 0) {
            console.log("Found images through debug endpoint:", debugData.files);
            
            // Create synthetic image objects from debug data
            const syntheticImages = debugData.files.map((file, index) => ({
              id: index + 1,
              property_id: parseInt(id),
              path: `properties/${id}/${file.filename}`,
              is_primary: index === 0,
              uploaded_at: new Date(file.last_modified * 1000).toISOString()
            }));
            
            // Add these images to the property data
            data.images = syntheticImages;
            console.log("Added synthetic images to property:", syntheticImages);
          }
        } catch (debugErr) {
          console.error("Error fetching debug images:", debugErr);
        }
      } else {
        console.log("Property images from API:", data.images);
      }
      
      setProperty(data);
    } catch (err: any) {
      console.error('Error fetching property details:', err);
      
      if (err.response && err.response.status === 404) {
        setError('Property not found. It may have been removed or is no longer available.');
      } else if (err.response && err.response.status === 402) {
        setError('You need tokens to view property details. Please purchase tokens to continue.');
      } else {
        setError('Failed to load property details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Format currency
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Handle fixed images from PropertyImageFix component
  const handleFixedImages = (images: any[]) => {
    console.log("Received fixed images:", images);
    setFixedImages(images);
    setImagesFixed(true);
  };
  
  // Get property type label
  const getPropertyTypeLabel = (type: string) => {
    const propertyType = PROPERTY_TYPES.find(p => p.value === type);
    return propertyType ? propertyType.label : type;
  };
  
  // Get verification status info
  const getVerificationStatus = (status: string) => {
    const verificationStatus = VERIFICATION_STATUSES.find(s => s.value === status);
    return verificationStatus || { value: status, label: status, color: 'gray' };
  };
  
  // Get availability status info
  const getAvailabilityStatus = (status: string) => {
    const availabilityStatus = AVAILABILITY_STATUSES.find(s => s.value === status);
    return availabilityStatus || { value: status, label: status, color: 'gray' };
  };
  
  // Check if user is owner
  const isOwner = property && user && property.owner_id === user.id;
  
  // Check if property is available
  const isAvailable = property && property.availability_status === 'available';
  
  // Handle contact owner
  const handleContactOwner = () => {
    if (user?.token_balance === 0) {
      setShowTokenModal(true);
    } else {
      setShowContactForm(true);
    }
  };
  
  // Prepare images for gallery with proper URL handling
  const prepareImages = () => {
    if (!property || !property.images || property.images.length === 0) {
      console.log("No images, using default placeholder");
      return [];
    }
    
    return property.images.map((img: any) => {
      // Check if the path already has /uploads prefix
      const imageUrl = img.path.startsWith('/uploads/') ? img.path : `/uploads/${img.path}`;
      console.log(`Image path: ${img.path}, Full URL: ${imageUrl}`);
      return {
        id: img.id,
        url: imageUrl,
        is_primary: img.is_primary,
      };
    });
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-300 rounded-lg mb-6"></div>
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-300 rounded w-1/2 mb-6"></div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
            </div>
            <div className="h-32 bg-gray-300 rounded mb-6"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Alert
            type="error"
            message={error}
            className="mb-6"
          />
          <div className="text-center mt-6">
            <Link
              to="/properties"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Properties
            </Link>
            
            <button
              onClick={() => setShowTokenModal(true)}
              className="inline-block ml-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Buy Tokens
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Alert
            type="error"
            message="Property not found"
            className="mb-6"
          />
          <div className="text-center mt-6">
            <Link
              to="/properties"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Properties
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            to="/properties"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Properties
          </Link>
        </div>
        
        {/* Property Gallery */}
        <PropertyGallery
          images={prepareImages()}
          title={property.title}
        />
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex flex-wrap justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
                <p className="text-gray-600 mt-1">{property.address}, {property.city}</p>
                
                <div className="flex flex-wrap items-center mt-2">
                  {property.verification_status && (
                    <span 
                      className={`inline-flex items-center mr-3 px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getVerificationStatus(property.verification_status).color}-100 text-${getVerificationStatus(property.verification_status).color}-800`}
                    >
                      {getVerificationStatus(property.verification_status).label}
                    </span>
                  )}
                  
                  {property.availability_status && (
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getAvailabilityStatus(property.availability_status).color}-100 text-${getAvailabilityStatus(property.availability_status).color}-800`}
                    >
                      {getAvailabilityStatus(property.availability_status).label}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mt-3 sm:mt-0">
                <div className="text-3xl font-bold text-blue-600">
                  {formatPrice(property.rent_amount)}
                  <span className="text-sm text-gray-500 font-normal ml-1">per month</span>
                </div>
                
                {isOwner ? (
                  <Link
                    to={`/properties/${property.id}/edit`}
                    className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  >
                    Edit Property
                  </Link>
                ) : isAvailable ? (
                  <button
                    onClick={handleContactOwner}
                    className="mt-2 inline-block px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                  >
                    Contact Owner
                  </button>
                ) : (
                  <button
                    disabled
                    className="mt-2 inline-block px-4 py-2 bg-gray-300 text-gray-500 text-sm rounded-md cursor-not-allowed"
                  >
                    Not Available
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Property details */}
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm">Property Type</span>
                <span className="font-medium">{getPropertyTypeLabel(property.property_type)}</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm">Bedrooms</span>
                <span className="font-medium">{property.bedrooms}</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm">Bathrooms</span>
                <span className="font-medium">{property.bathrooms}</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm">Size</span>
                <span className="font-medium">{property.size_sqm ? `${property.size_sqm} m²` : 'Not specified'}</span>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
            </div>
            
            {property.amenities && property.amenities.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {property.amenities.map((amenity: string) => (
                    <div key={amenity} className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{amenity.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {property.latitude && property.longitude && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Location</h2>
                <PropertyMap
                  latitude={property.latitude}
                  longitude={property.longitude}
                  title={property.title}
                />
              </div>
            )}
          </div>
        </div>
        
        {showContactForm && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6 p-6">
            <h2 className="text-lg font-semibold mb-4">Contact Owner</h2>
            <MessageComposer
              receiverId={property.owner_id}
              propertyId={property.id}
              onCancel={() => setShowContactForm(false)}
            />
          </div>
        )}
      </div>
      
      {/* Image Debugging Tools - Only shown in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2">Debug Tools</h2>
          <ImageDebugger property={property} />
          
          {/* Add the PropertyImageFix component to fix missing images */}
          {id && (
            <div className="mt-4">
              <h3 className="text-lg font-bold mb-2">Image Fix Tool</h3>
              <PropertyImageFix 
                propertyId={parseInt(id)} 
                onFixedImages={handleFixedImages} 
              />
              
              {imagesFixed && (
                <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded text-green-800">
                  Images fixed! {fixedImages.length} images retrieved from filesystem.
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <TokenPurchaseModal
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
        onSuccess={() => setShowContactForm(true)}
      />
    </div>
  );
};

export default PropertyDetail;