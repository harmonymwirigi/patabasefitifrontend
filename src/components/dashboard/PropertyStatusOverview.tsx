// frontend/src/components/dashboard/PropertyStatusOverview.tsx
// Overview component showing property status breakdown
import React from 'react';

interface PropertyAnalytics {
  totalProperties: number;
  availableProperties: number;
  rentedProperties: number;
  verifiedProperties: number;
  pendingVerifications: number;
  totalViews: number;
  totalFavorites: number;
  totalContacts: number;
  monthlyRevenue: number;
  averageRent: number;
  topPerformingProperty?: any;
  recentActivity: any[];
  viewsOverTime: any[];
  engagementMetrics: any;
}

interface PropertyStatusOverviewProps {
  analytics: PropertyAnalytics;
  selectedTimeRange: string;
}

const PropertyStatusOverview: React.FC<PropertyStatusOverviewProps> = ({
  analytics,
  selectedTimeRange
}) => {
  const getStatusPercentage = (count: number, total: number) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case '7': return 'this week';
      case '30': return 'this month';
      case '90': return 'last 3 months';
      case '365': return 'this year';
      default: return 'this period';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Property Status Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Status Breakdown</h3>
        
        <div className="space-y-4">
          {/* Available Properties */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm font-medium text-gray-700">Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {analytics.availableProperties} properties
              </span>
              <span className="text-sm font-medium text-green-600">
                {getStatusPercentage(analytics.availableProperties, analytics.totalProperties)}%
              </span>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${getStatusPercentage(analytics.availableProperties, analytics.totalProperties)}%` 
              }}
            ></div>
          </div>

          {/* Rented Properties */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-sm font-medium text-gray-700">Rented</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {analytics.rentedProperties || 0} properties
              </span>
              <span className="text-sm font-medium text-blue-600">
                {getStatusPercentage(analytics.rentedProperties || 0, analytics.totalProperties)}%
              </span>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${getStatusPercentage(analytics.rentedProperties || 0, analytics.totalProperties)}%` 
              }}
            ></div>
          </div>

          {/* Verification Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
              <span className="text-sm font-medium text-gray-700">Verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {analytics.verifiedProperties} properties
              </span>
              <span className="text-sm font-medium text-purple-600">
                {getStatusPercentage(analytics.verifiedProperties, analytics.totalProperties)}%
              </span>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${getStatusPercentage(analytics.verifiedProperties, analytics.totalProperties)}%` 
              }}
            ></div>
          </div>

          {/* Pending Verifications */}
          {analytics.pendingVerifications > 0 && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">Pending Verification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {analytics.pendingVerifications} properties
                  </span>
                  <span className="text-sm font-medium text-yellow-600">
                    Awaiting Admin Review
                  </span>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-yellow-800">
                    {analytics.pendingVerifications} {analytics.pendingVerifications === 1 ? 'property' : 'properties'} awaiting admin verification. 
                    This helps maintain listing quality.
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Performance Insights ({getTimeRangeLabel(selectedTimeRange)})
        </h3>
        
        <div className="space-y-4">
          {/* Total Engagement */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Total Engagement</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{analytics.totalViews}</div>
                <div className="text-xs text-gray-600">Views</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-red-600">{analytics.totalFavorites}</div>
                <div className="text-xs text-gray-600">Favorites</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{analytics.totalContacts}</div>
                <div className="text-xs text-gray-600">Contacts</div>
              </div>
            </div>
          </div>

          {/* Average Performance */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Average Performance per Property</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Views per property:</span>
                <span className="text-sm font-medium text-gray-900">
                  {analytics.totalProperties > 0 ? Math.round(analytics.totalViews / analytics.totalProperties) : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Favorites per property:</span>
                <span className="text-sm font-medium text-gray-900">
                  {analytics.totalProperties > 0 ? Math.round(analytics.totalFavorites / analytics.totalProperties) : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Contacts per property:</span>
                <span className="text-sm font-medium text-gray-900">
                  {analytics.totalProperties > 0 ? Math.round(analytics.totalContacts / analytics.totalProperties) : 0}
                </span>
              </div>
            </div>
          </div>

          {/* Top Performing Property */}
          {analytics.topPerformingProperty && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Top Performing Property</h4>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="font-medium text-green-900 text-sm">
                  {analytics.topPerformingProperty.title}
                </div>
                <div className="text-green-700 text-xs mt-1">
                  {analytics.topPerformingProperty.views} views • 
                  {analytics.topPerformingProperty.favorites} favorites • 
                  {analytics.topPerformingProperty.contacts} contacts
                </div>
              </div>
            </div>
          )}

          {/* Tips for Improvement */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Tips for Better Performance</h4>
            <div className="space-y-2">
              {analytics.verifiedProperties < analytics.totalProperties && (
                <div className="flex items-start">
                  <svg className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-gray-600">
                    Get more properties verified to increase visibility and trust
                  </span>
                </div>
              )}
              
              {analytics.totalViews / analytics.totalProperties < 10 && (
                <div className="flex items-start">
                  <svg className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-gray-600">
                    Add high-quality photos and detailed descriptions to attract more views
                  </span>
                </div>
              )}
              
              <div className="flex items-start">
                <svg className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-gray-600">
                  Keep property information updated for better search rankings
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyStatusOverview;