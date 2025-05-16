//frontend/src/pages/Admin/PropertyVerification.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';

interface Property {
  id: number;
  title: string;
  owner_name: string;
  created_at: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  property_type: string;
  address: string;
  city: string;
  rent_amount: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
}

const PropertyVerification: React.FC = () => {
  const { token } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchProperties = async () => {
      if (!token) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // In a real application, you would fetch this from your API
        // const response = await axios.get(`/api/v1/admin/properties?status=${filter}`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // setProperties(response.data);
        
        // For now, we'll use mock data
        setTimeout(() => {
          const mockProperties: Property[] = [
            {
              id: 1,
              title: "Modern 2 Bedroom Apartment in Kilimani",
              owner_name: "John Doe",
              created_at: "2025-05-10T14:23:05Z",
              verification_status: "pending",
              property_type: "apartment",
              address: "122 Kilimani Road",
              city: "Nairobi",
              rent_amount: 45000,
              bedrooms: 2,
              bathrooms: 1,
              images: ["/api/placeholder/400/300", "/api/placeholder/400/300"]
            },
            {
              id: 2,
              title: "Spacious 3 Bedroom House in Lavington",
              owner_name: "Sarah Kamau",
              created_at: "2025-05-11T09:15:22Z",
              verification_status: "pending",
              property_type: "house",
              address: "45 Lavington Estate",
              city: "Nairobi",
              rent_amount: 85000,
              bedrooms: 3,
              bathrooms: 2,
              images: ["/api/placeholder/400/300", "/api/placeholder/400/300"]
            },
            {
              id: 3,
              title: "Studio Apartment near CBD",
              owner_name: "Michael Johnson",
              created_at: "2025-05-09T11:42:18Z",
              verification_status: "verified",
              property_type: "studio",
              address: "78 Downtown Building",
              city: "Nairobi",
              rent_amount: 25000,
              bedrooms: 0,
              bathrooms: 1,
              images: ["/api/placeholder/400/300"]
            },
            {
              id: 4,
              title: "Luxury 4 Bedroom Villa in Karen",
              owner_name: "Elizabeth Wanjiku",
              created_at: "2025-05-08T15:30:00Z",
              verification_status: "rejected",
              property_type: "villa",
              address: "12 Karen Estate",
              city: "Nairobi",
              rent_amount: 150000,
              bedrooms: 4,
              bathrooms: 3,
              images: ["/api/placeholder/400/300", "/api/placeholder/400/300", "/api/placeholder/400/300"]
            }
          ];
          
          setProperties(mockProperties.filter(p => 
            filter === 'all' || p.verification_status === filter
          ));
          setLoading(false);
        }, 800);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load properties');
        setLoading(false);
      }
    };

    fetchProperties();
  }, [token, filter]);

  const handleVerify = async (id: number, status: 'verified' | 'rejected') => {
    setActionLoading(true);
    
    try {
      // In a real application, you would call your API
      // await axios.put(`/api/v1/admin/properties/${id}/verify`, 
      //   { status },
      //   { headers: { Authorization: `Bearer ${token}` }}
      // );
      
      // Mock successful API call
      setTimeout(() => {
        setProperties(prev => 
          prev.map(p => (p.id === id ? { ...p, verification_status: status } : p))
        );
        setSelectedProperty(null);
        setActionLoading(false);
      }, 500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update property status');
      setActionLoading(false);
    }
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
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Property Verification</h1>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded text-sm ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded text-sm ${
              filter === 'pending' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pending
          </button>
          <button 
            onClick={() => setFilter('verified')}
            className={`px-3 py-1 rounded text-sm ${
              filter === 'verified' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Verified
          </button>
          <button 
            onClick={() => setFilter('rejected')}
            className={`px-3 py-1 rounded text-sm ${
              filter === 'rejected' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Rejected
          </button>
        </div>
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
            {properties.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No properties found with the selected filter.
                </td>
              </tr>
            ) : (
              properties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img className="h-10 w-10 rounded-md object-cover" src={property.images[0]} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{property.title}</div>
                        <div className="text-sm text-gray-500">{property.address}, {property.city}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{property.owner_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(property.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${property.verification_status === 'verified' ? 'bg-green-100 text-green-800' : 
                        property.verification_status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {property.verification_status.charAt(0).toUpperCase() + property.verification_status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => setSelectedProperty(property)}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                    >
                      Review
                    </button>
                    {property.verification_status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleVerify(property.id, 'verified')}
                          className="text-green-600 hover:text-green-900 mr-2"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleVerify(property.id, 'rejected')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
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
      {selectedProperty && (
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
                      <div className="aspect-w-16 aspect-h-9 mb-4">
                        <img 
                          src={selectedProperty.images[0]} 
                          alt={selectedProperty.title} 
                          className="object-cover rounded-lg w-full h-48"
                        />
                      </div>
                      
                      <h4 className="text-xl font-semibold">{selectedProperty.title}</h4>
                      <p className="text-gray-600 mt-1">{selectedProperty.address}, {selectedProperty.city}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-500">Property Type</p>
                          <p className="font-medium capitalize">{selectedProperty.property_type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Rent</p>
                          <p className="font-medium">KES {selectedProperty.rent_amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Bedrooms</p>
                          <p className="font-medium">{selectedProperty.bedrooms}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Bathrooms</p>
                          <p className="font-medium">{selectedProperty.bathrooms}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Owner</p>
                          <p className="font-medium">{selectedProperty.owner_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <p className={`font-medium capitalize
                            ${selectedProperty.verification_status === 'verified' ? 'text-green-600' : 
                              selectedProperty.verification_status === 'rejected' ? 'text-red-600' : 
                              'text-yellow-600'}`}>
                            {selectedProperty.verification_status}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {selectedProperty.verification_status === 'pending' && (
                  <>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleVerify(selectedProperty.id, 'verified')}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {actionLoading ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleVerify(selectedProperty.id, 'rejected')}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {actionLoading ? 'Processing...' : 'Reject'}
                    </button>
                  </>
                )}
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setSelectedProperty(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyVerification;