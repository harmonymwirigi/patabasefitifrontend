// frontend/src/components/messages/NewMessageModal.tsx
// Fixed modal with proper owner_id handling and debugging
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { searchUsers } from '../../api/users';
import { getAllProperties } from '../../api/properties';

interface User {
  id: number;
  full_name: string;
  email: string;
  profile_image?: string;
  role: string;
}

interface Property {
  id: number;
  title: string;
  address: string;
  city: string;
  owner_id: number;
  owner?: {
    id: number;
    full_name: string;
    email: string;
  };
}

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: (receiverId: number, propertyId?: number, initialMessage?: string) => void;
}

const NewMessageModal: React.FC<NewMessageModalProps> = ({
  isOpen,
  onClose,
  onCreateConversation
}) => {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'properties'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialMessage, setInitialMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setInitialMessage('');
      setError(null);
      if (activeTab === 'properties') {
        fetchProperties();
      }
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    if (searchQuery && searchQuery.length >= 2 && activeTab === 'users') {
      const debounceTimer = setTimeout(() => {
        searchUsersHandler();
      }, 300);
      
      return () => clearTimeout(debounceTimer);
    } else if (searchQuery.length < 2) {
      setUsers([]);
    }
  }, [searchQuery, activeTab]);

  const searchUsersHandler = async () => {
    if (!token || !searchQuery.trim() || searchQuery.length < 2) return;

    setLoading(true);
    setError(null);

    try {
      const data = await searchUsers(token, searchQuery);
      console.log('Search users result:', data);
      setUsers(data);
    } catch (err: any) {
      console.error('Error searching users:', err);
      setError('Failed to search users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      // Get recent properties with proper parameters
      const data = await getAllProperties(token, { limit: 20 });
      
      // DEBUG: Log the properties data to see what we're getting
      console.log('Raw properties data:', data);
      console.log('First property:', data[0]);
      
      // Filter out current user's properties and ensure we have valid owner_id
      const filteredProperties = data.filter((p: Property) => {
        // Check if property has owner_id or owner.id
        const ownerId = p.owner_id || p.owner?.id;
        console.log(`Property ${p.id}: owner_id=${p.owner_id}, owner=${JSON.stringify(p.owner)}, calculated ownerId=${ownerId}`);
        
        return ownerId && ownerId !== user?.id;
      }).map((p: Property) => ({
        ...p,
        // Ensure owner_id is set correctly
        owner_id: p.owner_id || p.owner?.id || 0
      }));
      
      console.log('Filtered properties:', filteredProperties);
      setProperties(filteredProperties);
    } catch (err: any) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (selectedUser: User) => {
    console.log('Selected user:', selectedUser);
    
    if (!selectedUser.id || selectedUser.id <= 0) {
      alert('Invalid user selected');
      return;
    }

    const message = initialMessage.trim();
    onCreateConversation(selectedUser.id, undefined, message || undefined);
  };

  const handlePropertySelect = (property: Property) => {
    console.log('Selected property:', property);
    console.log('Property owner_id:', property.owner_id);
    
    // Get the owner ID from either owner_id field or owner object
    const ownerId = property.owner_id || property.owner?.id;
    
    if (!ownerId || ownerId <= 0) {
      console.error('Invalid owner ID for property:', property);
      alert('Cannot contact property owner - invalid owner information');
      return;
    }

    if (ownerId === user?.id) {
      alert('This is your own property');
      return;
    }

    const message = initialMessage.trim() || `Hi, I'm interested in your property: ${property.title}`;
    console.log('Creating conversation with owner_id:', ownerId, 'property_id:', property.id, 'message:', message);
    
    onCreateConversation(ownerId, property.id, message);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">New Message</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 py-2 px-1 text-center text-sm font-medium ${
                  activeTab === 'users'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Search Users
              </button>
              <button
                onClick={() => setActiveTab('properties')}
                className={`flex-1 py-2 px-1 text-center text-sm font-medium ${
                  activeTab === 'properties'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Contact Property Owners
              </button>
            </div>

            {/* Search Input for Users */}
            {activeTab === 'users' && (
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search users by name or email (min 2 characters)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchQuery.length > 0 && searchQuery.length < 2 && (
                  <p className="text-xs text-gray-500 mt-1">Please enter at least 2 characters</p>
                )}
              </div>
            )}

            {/* Initial Message Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Message (Optional)
              </label>
              <textarea
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Content */}
            <div className="max-h-96 overflow-y-auto">
              {error && (
                <div className="text-center py-4 text-red-600 bg-red-50 rounded-md mb-4">
                  {error}
                </div>
              )}

              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading...</p>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && !loading && (
                <div className="space-y-2">
                  {users.length === 0 && searchQuery.length >= 2 ? (
                    <div className="text-center py-8 text-gray-500">
                      No users found for "{searchQuery}"
                    </div>
                  ) : users.length === 0 && searchQuery.length < 2 ? (
                    <div className="text-center py-8 text-gray-500">
                      Type at least 2 characters to search for users...
                    </div>
                  ) : (
                    users.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {user.profile_image ? (
                            <img
                              src={`/uploads/${user.profile_image}`}
                              alt={user.full_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-gray-600 font-medium">
                                {user.full_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="ml-3 flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                          <div className="text-xs text-gray-400 capitalize">
                            {user.role}
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Properties Tab */}
              {activeTab === 'properties' && !loading && (
                <div className="space-y-2">
                  {properties.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No properties available to contact
                    </div>
                  ) : (
                    properties.map((property) => (
                      <div
                        key={property.id}
                        onClick={() => handlePropertySelect(property)}
                        className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        {/* Property Icon */}
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          </div>
                        </div>

                        {/* Property Info */}
                        <div className="ml-3 flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {property.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {property.address}, {property.city}
                          </div>
                          <div className="text-xs text-gray-400">
                            Contact Property Owner (ID: {property.owner_id || property.owner?.id || 'Unknown'})
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewMessageModal;