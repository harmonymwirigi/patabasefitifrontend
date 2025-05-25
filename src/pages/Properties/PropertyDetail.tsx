// File: frontend/src/pages/Properties/PropertyDetail.tsx
// Fixed version without LocationSelector causing context issues

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProperty } from '../../api/properties';
import { useAuth } from '../../hooks/useAuth';
import PropertyGallery from '../../components/property/PropertyGallery';
import PropertyMap from '../../components/property/PropertyMap';
import { Alert } from '../../components/common/Alert';
import TokenPurchaseModal from '../../components/token/TokenPurchaseModal';
import MessageComposer from '../../components/messages/MessageComposer';
import { PROPERTY_TYPES, VERIFICATION_STATUSES, AVAILABILITY_STATUSES } from '../../config/constants';
import { 
  MapPin, 
  BedDouble, 
  Bath, 
  Square, 
  Calendar,
  Shield,
  Star,
  Heart,
  Share2,
  MessageCircle,
  ChevronLeft,
  Check,
  Clock,
  AlertCircle,
  Home,
  DollarSign
} from 'lucide-react';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  
  useEffect(() => {
    fetchPropertyDetails();
  }, [id, token]);
  
  const fetchPropertyDetails = async () => {
    if (!token || !id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getProperty(token, parseInt(id));
      console.log("Property data received:", data);
      console.log("Property images:", data.images);
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
  
  // Get property type label
  const getPropertyTypeLabel = (type: string) => {
    const propertyType = PROPERTY_TYPES?.find(p => p.value === type);
    return propertyType ? propertyType.label : type;
  };
  
  // Get verification status info
  const getVerificationStatus = (status: string) => {
    const verificationStatus = VERIFICATION_STATUSES?.find(s => s.value === status);
    return verificationStatus || { value: status, label: status, color: 'gray' };
  };
  
  // Get availability status info
  const getAvailabilityStatus = (status: string) => {
    const availabilityStatus = AVAILABILITY_STATUSES?.find(s => s.value === status);
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

  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    setIsFavorited(!isFavorited);
    // TODO: Implement actual favorite API call
  };

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out this property: ${property.title}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
  };
  
  // Prepare images for gallery with proper URL handling
  const prepareImages = () => {
    if (!property || !property.images || property.images.length === 0) {
      console.log("No images found in property data");
      return [];
    }
    
    console.log("Raw property images:", property.images);
    
    return property.images.map((img: any) => {
      // Handle different possible image path formats
      let imageUrl = img.path;
      
      // If path doesn't start with /uploads/, add it
      if (!imageUrl.startsWith('/uploads/') && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
        imageUrl = `/uploads/${imageUrl}`;
      }
      
      console.log(`Prepared image: ${img.path} -> ${imageUrl}`);
      
      return {
        id: img.id,
        url: imageUrl,
        is_primary: img.is_primary || false,
      };
    });
  };

  // Get status icon and color
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'verified':
        return { icon: <Shield className="w-4 h-4" />, color: 'text-green-600 bg-green-50', text: 'Verified' };
      case 'pending':
        return { icon: <Clock className="w-4 h-4" />, color: 'text-yellow-600 bg-yellow-50', text: 'Pending' };
      case 'available':
        return { icon: <Check className="w-4 h-4" />, color: 'text-green-600 bg-green-50', text: 'Available' };
      case 'rented':
        return { icon: <AlertCircle className="w-4 h-4" />, color: 'text-red-600 bg-red-50', text: 'Rented' };
      default:
        return { icon: <AlertCircle className="w-4 h-4" />, color: 'text-gray-600 bg-gray-50', text: status };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-48 mb-6"></div>
            <div className="h-96 bg-gray-300 rounded-2xl mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                <div className="h-32 bg-gray-300 rounded"></div>
              </div>
              <div className="h-96 bg-gray-300 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert type="error" message={error} className="mb-6" />
          <div className="text-center mt-6 space-x-4">
            <Link
              to="/properties"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Properties
            </Link>
            
            <button
              onClick={() => setShowTokenModal(true)}
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Buy Tokens
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert type="error" message="Property not found" className="mb-6" />
          <div className="text-center mt-6">
            <Link
              to="/properties"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Properties
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const verificationStatus = getStatusDisplay(property.verification_status);
  const availabilityStatus = getStatusDisplay(property.availability_status);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link
            to="/properties"
            className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Properties
          </Link>
        </nav>
        
        {/* Property Gallery - Reduced size */}
        <div className="mb-6">
          <PropertyGallery
            images={prepareImages()}
            title={property.title}
          />
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Details - Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex flex-wrap justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${verificationStatus.color}`}>
                      {verificationStatus.icon}
                      {verificationStatus.text}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${availabilityStatus.color}`}>
                      {availabilityStatus.icon}
                      {availabilityStatus.text}
                    </span>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{property.address}, {property.city}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">4.8 (24 reviews)</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mt-4 lg:mt-0">
                  <button
                    onClick={handleFavoriteToggle}
                    className={`p-3 rounded-full border-2 transition-colors ${
                      isFavorited 
                        ? 'border-red-500 bg-red-50 text-red-500' 
                        : 'border-gray-300 hover:border-red-300 hover:bg-red-50 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="p-3 rounded-full border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Key Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                    <Home className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-sm text-gray-600">Type</div>
                  <div className="font-semibold">{getPropertyTypeLabel(property.property_type)}</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                    <BedDouble className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                  <div className="font-semibold">{property.bedrooms}</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                    <Bath className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                  <div className="font-semibold">{property.bathrooms}</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2">
                    <Square className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-sm text-gray-600">Size</div>
                  <div className="font-semibold">{property.size_sqm ? `${property.size_sqm} m²` : 'N/A'}</div>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About this property</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>
            
            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Amenities & Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenities.map((amenity: string) => (
                    <div key={amenity} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mr-3">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-gray-700 font-medium">
                        {amenity.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Location - Always show, PropertyMap will handle invalid coordinates */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Location</h2>
              <div className="rounded-xl overflow-hidden">
                <PropertyMap
                  latitude={Number(property.latitude) || 0}
                  longitude={Number(property.longitude) || 0}
                  title={property.title}
                  address={`${property.address}, ${property.city}`}
                />
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{property.address}, {property.city}</span>
                </div>
                {/* Show coordinate info if available */}
                {property.latitude && property.longitude && (
                  <div className="mt-2 text-xs text-gray-500">
                    Coordinates: {Number(property.latitude).toFixed(6)}, {Number(property.longitude).toFixed(6)}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Price & Action Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {formatPrice(property.rent_amount)}
                </div>
                <div className="text-gray-600">per month</div>
              </div>
              
              <div className="space-y-4">
                {isOwner ? (
                  <Link
                    to={`/properties/${property.id}/edit`}
                    className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Edit Property
                  </Link>
                ) : isAvailable ? (
                  <button
                    onClick={handleContactOwner}
                    className="w-full flex items-center justify-center px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Contact Owner
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full flex items-center justify-center px-6 py-4 bg-gray-300 text-gray-500 rounded-xl cursor-not-allowed font-semibold"
                  >
                    Not Available
                  </button>
                )}
                
                <button className="w-full px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-blue-300 hover:text-blue-600 transition-colors font-semibold">
                  Schedule Viewing
                </button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Property ID:</span>
                  <span className="font-mono">#{property.id}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Listed:</span>
                  <span>{new Date(property.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            {showContactForm && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Send Message</h3>
                <MessageComposer
                  receiverId={property.owner_id}
                  propertyId={property.id}
                  onCancel={() => setShowContactForm(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showTokenModal && (
        <TokenPurchaseModal
          isOpen={showTokenModal}
          onClose={() => setShowTokenModal(false)}
          onSuccess={() => setShowContactForm(true)}
        />
      )}
    </div>
  );
};

export default PropertyDetail;