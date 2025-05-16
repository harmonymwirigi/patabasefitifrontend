// File: frontend/src/pages/Home/index.tsx
// Updated with Google One Tap integration

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFeaturedProperties } from '../../api/properties';
import PropertyCard from '../../components/property/PropertyCard';
import { useAuth } from '../../hooks/useAuth';
import TokenPurchaseModal from '../../components/token/TokenPurchaseModal';
import HeroSection from '../../components/home/HeroSection';
import GoogleOneTap from '../../components/auth/GoogleOneTap';
import GoogleAuthModal from '../../components/auth/GoogleAuthModal';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showGoogleAuthModal, setShowGoogleAuthModal] = useState(false);
  
  // Check if this is a returning visitor to show the One Tap
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore') === 'true';
    const dontShowPrompt = localStorage.getItem('dontShowGooglePrompt') === 'true';
    
    // If they've visited before and haven't opted out, mark for automatic Google prompt
    if (hasVisitedBefore && !dontShowPrompt && !isAuthenticated) {
      // Use a slight delay before showing the Google One Tap
      const timer = setTimeout(() => {
        setShowGoogleAuthModal(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      // Mark as visited for future reference
      localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        const properties = await getFeaturedProperties();
        setFeaturedProperties(properties);
      } catch (err) {
        console.error('Error fetching featured properties:', err);
        setError('Failed to load featured properties');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  const handleAuthSuccess = () => {
    // Redirect to dashboard on successful authentication
    navigate('/dashboard');
  };

  return (
    <div>
      {/* Include Google One Tap component with auto-prompt for returning users */}
      <GoogleOneTap 
        autoPrompt={false} // We'll control display with our modal instead
        onSuccess={handleAuthSuccess}
        onError={(errorMsg) => console.error('Google Auth Error:', errorMsg)}
      />
      
      <HeroSection onGetStarted={() => {
        if (isAuthenticated) {
          setShowTokenModal(true);
        } else {
          setShowGoogleAuthModal(true);
        }
      }} />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of premium properties available for rent across Kenya.
          </p>
        </div>
        
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
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.length > 0 ? (
                featuredProperties.map((property) => (
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
                    image_url={property.images && property.images.length > 0 ? `/uploads/${property.images[0].path}` : undefined}
                    verification_status={property.verification_status}
                    availability_status={property.availability_status}
                  />
                ))
              ) : (
                <div className="col-span-3 text-center py-8">
                  <p className="text-gray-500">No featured properties available at the moment.</p>
                </div>
              )}
            </div>
            
            <div className="mt-10 text-center">
              <Link
                to={isAuthenticated ? "/properties" : "/login"}
                className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                {isAuthenticated ? "View All Properties" : "Log In to View More"}
              </Link>
            </div>
          </>
        )}
      </div>
      
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
              PataBasefiti makes house hunting simple, efficient, and reliable with our token-based system.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 bg-blue-100 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Buy Tokens</h3>
              <p className="text-gray-600">
                Purchase tokens using M-Pesa to access property listings and connect with owners.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 bg-blue-100 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Search Properties</h3>
              <p className="text-gray-600">
                Use tokens to search for properties that match your preferences and requirements.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 bg-blue-100 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Connect & Visit</h3>
              <p className="text-gray-600">
                Contact property owners directly and schedule visits to find your perfect home.
              </p>
            </div>
          </div>
          
          <div className="mt-10 text-center">
            <button
              onClick={() => {
                if (isAuthenticated) {
                  setShowTokenModal(true);
                } else {
                  setShowGoogleAuthModal(true);
                }
              }}
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Get Started Now
            </button>
          </div>
        </div>
      </div>
      
      {/* Token Purchase Modal */}
      <TokenPurchaseModal
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
      />
      
      {/* Google Authentication Modal */}
      <GoogleAuthModal
        isOpen={showGoogleAuthModal}
        onClose={() => setShowGoogleAuthModal(false)}
        autoPrompt={!isAuthenticated && localStorage.getItem('hasVisitedBefore') === 'true'}
      />
    </div>
  );
};

export default HomePage;