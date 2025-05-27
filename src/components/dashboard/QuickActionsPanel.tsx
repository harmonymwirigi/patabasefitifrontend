// frontend/src/components/dashboard/QuickActionsPanel.tsx
// Quick actions panel for property owners
import React from 'react';
import { Link } from 'react-router-dom';

interface QuickActionsPanelProps {
  onRefresh: () => void;
  totalProperties: number;
  pendingVerifications: number;
}

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  onRefresh,
  totalProperties,
  pendingVerifications
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
        <div className="mb-4 lg:mb-0">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          <p className="text-gray-600 mt-1">
            Manage your properties efficiently with these quick actions
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* Add New Property */}
          <Link
            to="/properties/create"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Property
          </Link>

          {/* View All Properties */}
          <Link
            to="/properties"
            className="inline-flex items-center px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-md border border-gray-300 transition-colors"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Browse All Properties
          </Link>

          {/* Messages */}
          <Link
            to="/messages"
            className="inline-flex items-center px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-md border border-gray-300 transition-colors"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Messages
          </Link>

          {/* Refresh Data */}
          <button
            onClick={onRefresh}
            className="inline-flex items-center px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-md border border-gray-300 transition-colors"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Status Alerts */}
      <div className="mt-6 space-y-3">
        {totalProperties === 0 && (
          <div className="flex items-center p-3 bg-blue-100 border border-blue-200 rounded-md">
            <svg className="h-5 w-5 text-blue-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-800">Welcome to PataBasefiti!</p>
              <p className="text-sm text-blue-700">
                Get started by adding your first property listing to connect with potential tenants.
              </p>
            </div>
          </div>
        )}

        {pendingVerifications > 0 && (
          <div className="flex items-center p-3 bg-yellow-100 border border-yellow-200 rounded-md">
            <svg className="h-5 w-5 text-yellow-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800">Verification Pending</p>
              <p className="text-sm text-yellow-700">
                {pendingVerifications} {pendingVerifications === 1 ? 'property' : 'properties'} awaiting admin verification. 
                Verified properties get better visibility and more tenant inquiries.
              </p>
            </div>
          </div>
        )}

        {totalProperties > 0 && pendingVerifications === 0 && (
          <div className="flex items-center p-3 bg-green-100 border border-green-200 rounded-md">
            <svg className="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-green-800">All Set!</p>
              <p className="text-sm text-green-700">
                Your properties are active and ready to attract potential tenants. Keep them updated for best results.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickActionsPanel;