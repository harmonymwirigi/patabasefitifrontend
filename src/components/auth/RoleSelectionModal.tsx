// File: frontend/src/components/auth/RoleSelectionModal.tsx
// Modal to collect user role after Google registration

import React, { useState } from 'react';

interface RoleSelectionModalProps {
  isOpen: boolean;
  userInfo: {
    email: string;
    name: string;
    picture?: string;
  };
  onRoleSelect: (role: 'tenant' | 'owner') => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  userInfo,
  onRoleSelect,
  onCancel,
  isLoading = false
}) => {
  const [selectedRole, setSelectedRole] = useState<'tenant' | 'owner' | null>(null);

  const handleSubmit = () => {
    if (selectedRole) {
      onRoleSelect(selectedRole);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal content */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Complete Your Profile
                </h3>
                
                {/* User Info Display */}
                <div className="flex items-center space-x-3 mb-6 p-3 bg-gray-50 rounded-lg">
                  {userInfo.picture && (
                    <img
                      src={userInfo.picture}
                      alt={userInfo.name}
                      className="h-12 w-12 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{userInfo.name}</p>
                    <p className="text-sm text-gray-500">{userInfo.email}</p>
                  </div>
                </div>

                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-4">
                    Please tell us how you'll be using PataBaseFiti:
                  </p>
                  
                  <div className="space-y-3">
                    {/* Tenant Option */}
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedRole === 'tenant' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedRole('tenant')}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="tenant"
                          name="role"
                          value="tenant"
                          checked={selectedRole === 'tenant'}
                          onChange={() => setSelectedRole('tenant')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <div className="ml-3">
                          <label htmlFor="tenant" className="text-sm font-medium text-gray-900 cursor-pointer">
                            I'm looking for a place to rent
                          </label>
                          <p className="text-xs text-gray-500">
                            Search and browse properties, contact landlords, save favorites
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Owner Option */}
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedRole === 'owner' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedRole('owner')}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="owner"
                          name="role"
                          value="owner"
                          checked={selectedRole === 'owner'}
                          onChange={() => setSelectedRole('owner')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <div className="ml-3">
                          <label htmlFor="owner" className="text-sm font-medium text-gray-900 cursor-pointer">
                            I have properties to rent out
                          </label>
                          <p className="text-xs text-gray-500">
                            List properties, manage listings, communicate with tenants
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              disabled={!selectedRole || isLoading}
              onClick={handleSubmit}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm ${
                !selectedRole || isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </div>
              ) : (
                'Continue'
              )}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={onCancel}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionModal;