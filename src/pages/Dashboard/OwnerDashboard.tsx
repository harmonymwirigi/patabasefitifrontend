// frontend/src/pages/Dashboard/OwnerDashboard.jsx (Updated)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllProperties } from '../../api/properties';
import { getPendingVerifications } from '../../api/verifications';
import { useAuth } from '../../hooks/useAuth';
import ImprovedPropertyCard from '../../components/property/ImprovedPropertyCard';
import VerificationPrompt from '../../components/property/VerificationPrompt';

const OwnerDashboard = () => {
  const { token, user } = useAuth();
  
  const [properties, setProperties] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeVerification, setActiveVerification] = useState(null);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [propertiesData, verificationsData] = await Promise.all([
        getAllProperties(token, { owner_id: user?.id }),
        getPendingVerifications(token)
      ]);
      
      console.log('Properties data:', propertiesData);
      console.log('Verifications data:', verificationsData);
      
      setProperties(propertiesData);
      setPendingVerifications(verificationsData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationComplete = () => {
    setActiveVerification(null);
    fetchData();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
        
        <Link
          to="/properties/create"
          className="mt-3 md:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Property
        </Link>
      </div>
      
      {/* Pending verifications */}
      {pendingVerifications.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Verifications</h2>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              
              <div>
                <h3 className="text-md font-medium text-gray-900">
                  Action Required: Please verify your property status
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {pendingVerifications.length} {pendingVerifications.length === 1 ? 'property' : 'properties'} need verification. 
                  This helps maintain accurate listings and earns you token rewards.
                </p>
                
                <div className="mt-3 space-y-2">
                  {pendingVerifications.map(verification => (
                    <button
                      key={verification.id}
                      onClick={() => setActiveVerification(verification.id)}
                      className="inline-flex items-center px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-sm font-medium rounded-md mr-2 mb-2"
                    >
                      Verify: {verification.property_title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Properties list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="mt-4 text-xl font-medium text-gray-900">No properties yet</h3>
          <p className="mt-2 text-gray-600 max-w-md mx-auto">
            Get started by adding your first property listing.
          </p>
          <Link
            to="/properties/create"
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Property
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => (
            <div key={property.id} className="relative">
              <ImprovedPropertyCard
                id={property.id}
                title={property.title}
                address={property.address}
                city={property.city}
                rent_amount={property.rent_amount}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                property_type={property.property_type}
                // Improved image URL handling
                image_url={property.images && property.images.length > 0 
                  ? property.images[0].path 
                  : property.main_image || undefined}
                verification_status={property.verification_status}
                availability_status={property.availability_status}
              />
              
              <div className="absolute top-2 right-2 z-10 flex space-x-1">
                <Link
                  to={`/properties/${property.id}/edit`}
                  className="bg-white bg-opacity-90 p-2 rounded-full text-gray-700 hover:text-blue-600 hover:bg-opacity-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Verification modal */}
      {activeVerification && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setActiveVerification(null)}></div>
            
            <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              {pendingVerifications.find(v => v.id === activeVerification) && (
                <VerificationPrompt
                  verificationId={activeVerification}
                  propertyId={pendingVerifications.find(v => v.id === activeVerification).property_id}
                  propertyTitle={pendingVerifications.find(v => v.id === activeVerification).property_title}
                  onComplete={handleVerificationComplete}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;