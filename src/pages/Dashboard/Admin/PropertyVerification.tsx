// frontend/src/pages/Dashboard/Admin/PropertyVerification.tsx
// Fixed version with working filters

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { getPendingVerifications, verifyProperty } from '../../../api/admin';

interface PropertyImage {
  id: number;
  path: string;
  is_primary: boolean;
}

interface Property {
  id: number;
  title: string;
  address: string;
  city: string;
  property_type: string;
  rent_amount: number;
  bedrooms: number;
  bathrooms: number;
  images: PropertyImage[];
  owner: {
    id: number;
    full_name: string;
    email: string;
  };
}

interface Verification {
  id: number;
  property_id: number;
  property: Property;
  verification_type: string;
  requested_at: string;
  status: 'pending' | 'verified' | 'rejected';
}

const PropertyVerificationPage: React.FC = () => {
  const { token } = useAuth();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [rejectionNote, setRejectionNote] = useState<string>('');
  const [showRejectionNoteModal, setShowRejectionNoteModal] = useState<boolean>(false);

  useEffect(() => {
    fetchVerifications();
  }, [token, filter]);

  const fetchVerifications = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching verification data with filter: ${filter}`);
      
      // Build the parameters object correctly
      const params: any = {};
      
      // Only add verification_status if filter is not 'all'
      if (filter !== 'all') {
        params.verification_status = filter;
      }
      
      console.log('API call parameters:', params);
      
      const data = await getPendingVerifications(token, params);
      console.log("Verification data received:", data);
      setVerifications(data);
    } catch (err: any) {
      console.error('Error fetching verifications:', err);
      setError(err.response?.data?.detail || 'Failed to load properties for verification');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: number, propertyId: number, status: 'verified' | 'rejected', note?: string) => {
    setActionLoading(true);
    
    try {
      console.log(`Verifying property ${propertyId} with status: ${status}`);
      await verifyProperty(token, propertyId, status, note);
      
      // Update the local state to reflect the change
      setVerifications(prev => 
        prev.map(v => (v.property_id === propertyId ? { ...v, status } : v))
      );
      
      // Close any open modal and reset state
      setSelectedVerification(null);
      setRejectionNote('');
      setShowRejectionNoteModal(false);
      
      // Refresh the list to get updated data from server
      fetchVerifications();
    } catch (err: any) {
      console.error('Error verifying property:', err);
      setError(err.response?.data?.detail || 'Failed to update property status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (verification: Verification) => {
    setSelectedVerification(verification);
    setShowRejectionNoteModal(true);
  };

  const submitRejection = () => {
    if (selectedVerification) {
      handleVerify(selectedVerification.id, selectedVerification.property_id, 'rejected', rejectionNote);
    }
  };

  const getPropertyImage = (verification: Verification) => {
    if (verification.property && 
        verification.property.images && 
        verification.property.images.length > 0) {
      
      // Find primary image or use first one
      const primaryImage = verification.property.images.find(img => img.is_primary) || 
                           verification.property.images[0];
      
      return `/uploads/${primaryImage.path}`;
    }
    
    // Return placeholder if no images
    return '/api/placeholder/400/300';
  };

  // Function to handle filter change with immediate feedback
  const handleFilterChange = (newFilter: 'all' | 'pending' | 'verified' | 'rejected') => {
    console.log(`Changing filter from ${filter} to ${newFilter}`);
    setFilter(newFilter);
    setError(null); // Clear any existing errors
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">
          <p>{error}</p>
          <button 
            onClick={fetchVerifications}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Verification</h1>
          <p className="text-gray-600 mt-1">
            Showing {verifications.length} {filter === 'all' ? 'total' : filter} properties
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => handleFilterChange('all')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({verifications.length})
          </button>
          <button 
            onClick={() => handleFilterChange('pending')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              filter === 'pending' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pending
          </button>
          <button 
            onClick={() => handleFilterChange('verified')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              filter === 'verified' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Verified
          </button>
          <button 
            onClick={() => handleFilterChange('rejected')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              filter === 'rejected' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>
      
      {/* Show current filter status */}
      <div className="mb-4 flex items-center justify-between bg-blue-50 p-3 rounded-md">
        <div className="text-blue-700">
          <span className="font-medium">Filter:</span> {filter === 'all' ? 'All properties' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} properties`}
        </div>
        {filter !== 'pending' && (
          <button
            onClick={() => handleFilterChange('pending')}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm focus:outline-none"
          >
            Reset to Pending
          </button>
        )}
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Property
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Owner
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Added
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {verifications.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  {filter === 'all' 
                    ? 'No properties found in the system.' 
                    : `No properties found with status: ${filter}.`
                  }
                </td>
              </tr>
            ) : (
              verifications.map((verification) => (
                <tr key={verification.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {verification.property ? (
                          <img 
                            className="h-10 w-10 rounded-md object-cover" 
                            src={getPropertyImage(verification)} 
                            alt="" 
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 22V12h6v10" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        {verification.property ? (
                          <>
                            <div className="text-sm font-medium text-gray-900">{verification.property.title}</div>
                            <div className="text-sm text-gray-500">{verification.property.address}, {verification.property.city}</div>
                          </>
                        ) : (
                          <div className="text-sm text-gray-500">Property ID: {verification.property_id}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {verification.property && verification.property.owner ? (
                      <div className="text-sm text-gray-900">{verification.property.owner.full_name}</div>
                    ) : (
                      <div className="text-sm text-gray-500">Unknown</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(verification.requested_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${verification.status === 'verified' ? 'bg-green-100 text-green-800' : 
                        verification.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => setSelectedVerification(verification)}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                    >
                      Review
                    </button>
                    {verification.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleVerify(verification.id, verification.property_id, 'verified')}
                          disabled={actionLoading}
                          className="text-green-600 hover:text-green-900 mr-2 disabled:opacity-50"
                        >
                          {actionLoading ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleRejectClick(verification)}
                          disabled={actionLoading}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {actionLoading ? 'Processing...' : 'Reject'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Property Detail Modal */}
      {selectedVerification && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Property Details
                    </h3>
                    
                    <div className="mt-4">
                      {selectedVerification.property ? (
                        <>
                          <div className="aspect-w-16 aspect-h-9 mb-4">
                            <img 
                              src={getPropertyImage(selectedVerification)} 
                              alt={selectedVerification.property.title} 
                              className="object-cover rounded-lg w-full h-48"
                            />
                          </div>
                          
                          <h4 className="text-xl font-semibold">{selectedVerification.property.title}</h4>
                          <p className="text-gray-600 mt-1">
                            {selectedVerification.property.address}, {selectedVerification.property.city}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <p className="text-sm text-gray-500">Property Type</p>
                              <p className="font-medium capitalize">{selectedVerification.property.property_type}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Rent</p>
                              <p className="font-medium">KES {selectedVerification.property.rent_amount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Bedrooms</p>
                              <p className="font-medium">{selectedVerification.property.bedrooms}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Bathrooms</p>
                              <p className="font-medium">{selectedVerification.property.bathrooms}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Owner</p>
                              <p className="font-medium">
                                {selectedVerification.property.owner ? 
                                  selectedVerification.property.owner.full_name : 
                                  'Unknown'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Status</p>
                              <p className={`font-medium capitalize
                                ${selectedVerification.status === 'verified' ? 'text-green-600' : 
                                  selectedVerification.status === 'rejected' ? 'text-red-600' : 
                                  'text-yellow-600'}`}>
                                {selectedVerification.status}
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">Property details not available.</p>
                          <p className="text-gray-600 mt-2">Property ID: {selectedVerification.property_id}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {selectedVerification.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleVerify(selectedVerification.id, selectedVerification.property_id, 'verified')}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                      {actionLoading ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleRejectClick(selectedVerification)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                      {actionLoading ? 'Processing...' : 'Reject'}
                    </button>
                  </>
                )}
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setSelectedVerification(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Rejection Note Modal */}
      {showRejectionNoteModal && (
        <div className="fixed z-20 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Rejection Reason
                    </h3>
                    
                    <div className="mt-4">
                      <label htmlFor="rejection-note" className="block text-sm font-medium text-gray-700">
                        Please provide a reason for rejection
                      </label>
                      <textarea
                        id="rejection-note"
                        name="rejection-note"
                        rows={4}
                        className="mt-2 shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md"
                        placeholder="Enter reason for rejection"
                        value={rejectionNote}
                        onChange={(e) => setRejectionNote(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={submitRejection}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Reject Property'}
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => {
                    setShowRejectionNoteModal(false);
                    setRejectionNote('');
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyVerificationPage;