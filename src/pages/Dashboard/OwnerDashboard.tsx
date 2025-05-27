// frontend/src/pages/Dashboard/OwnerDashboard.tsx
// Enhanced Owner Dashboard with comprehensive property management
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllProperties } from '../../api/properties';
import { getOwnerAnalytics } from '../../api/analytics';
import { useAuth } from '../../hooks/useAuth'; 
import PropertyStatisticsCard from '../../components/dashboard/PropertyStatisticsCard';
import PropertyManagementTable from '../../components/dashboard/PropertyManagementTable';
import PropertyPerformanceChart from '../../components/dashboard/PropertyPerformanceChart';
import QuickActionsPanel from '../../components/dashboard/QuickActionsPanel';
import PropertyStatusOverview from '../../components/dashboard/PropertyStatusOverview';

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
  topPerformingProperty: any;
  recentActivity: any[];
  viewsOverTime: any[];
  engagementMetrics: any;
}

const OwnerDashboard: React.FC = () => {
  const { token, user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [analytics, setAnalytics] = useState<PropertyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30');
  const [selectedPropertyType, setSelectedPropertyType] = useState('all');

  useEffect(() => {
    if (token && user) {
      fetchDashboardData();
    }
  }, [token, user, selectedTimeRange, selectedPropertyType]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [propertiesData, analyticsData] = await Promise.all([
        getAllProperties(token, { 
          owner_id: user?.id,
          property_type: selectedPropertyType !== 'all' ? selectedPropertyType : undefined
        }),
        getOwnerAnalytics(token, {
          timeRange: selectedTimeRange,
          propertyType: selectedPropertyType
        })
      ]);
      
      console.log('Properties data:', propertiesData);
      console.log('Analytics data:', analyticsData);
      
      setProperties(propertiesData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshData = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">
            <p>{error}</p>
            <button
              onClick={handleRefreshData}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Property Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.full_name}! Here's an overview of your properties.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-4 md:mt-0">
          {/* Time Range Filter */}
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
          
          {/* Property Type Filter */}
          <select
            value={selectedPropertyType}
            onChange={(e) => setSelectedPropertyType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Property Types</option>
            <option value="apartment">Apartments</option>
            <option value="house">Houses</option>
            <option value="studio">Studios</option>
            <option value="villa">Villas</option>
            <option value="commercial">Commercial</option>
          </select>
          
          <Link
            to="/properties/create"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Property
          </Link>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <QuickActionsPanel 
        onRefresh={handleRefreshData}
        totalProperties={analytics?.totalProperties || 0}
        pendingVerifications={analytics?.pendingVerifications || 0}
      />

      {/* Statistics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <PropertyStatisticsCard
            title="Total Properties"
            value={analytics.totalProperties}
            icon="home"
            color="blue"
            trend={analytics.totalProperties > 0 ? '+5.2%' : '0%'}
            subtitle="compared to last month"
          />
          
          <PropertyStatisticsCard
            title="Available"
            value={analytics.availableProperties}
            icon="available"
            color="green"
            trend={`${Math.round((analytics.availableProperties / analytics.totalProperties) * 100)}%`}
            subtitle="of total properties"
          />
          
          <PropertyStatisticsCard
            title="Total Views"
            value={analytics.totalViews}
            icon="eye"
            color="purple"
            trend="+12.3%"
            subtitle="this month"
          />
          
          <PropertyStatisticsCard
            title="Avg. Rent"
            value={`KES ${analytics.averageRent?.toLocaleString() || 0}`}
            icon="money"
            color="yellow"
            trend="+8.1%"
            subtitle="market rate"
          />
        </div>
      )}

      {/* Property Status Overview */}
      {analytics && (
        <PropertyStatusOverview 
          analytics={analytics}
          selectedTimeRange={selectedTimeRange}
        />
      )}

      {/* Performance Charts */}
      {analytics && analytics.viewsOverTime && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PropertyPerformanceChart
            title="Property Views Over Time"
            data={analytics.viewsOverTime}
            type="line"
          />
          
          <PropertyPerformanceChart
            title="Property Engagement"
            data={analytics.engagementMetrics}
            type="doughnut"
          />
        </div>
      )}

      {/* Properties Management Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Your Properties</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefreshData}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
        
        {properties.length === 0 ? (
          <div className="text-center py-12 bg-gray-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-4 text-xl font-medium text-gray-900">No properties yet</h3>
            <p className="mt-2 text-gray-600 max-w-md mx-auto">
              Get started by adding your first property listing to reach potential tenants.
            </p>
            <Link
              to="/properties/create"
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Your First Property
            </Link>
          </div>
        ) : (
          <PropertyManagementTable 
            properties={properties}
            onRefresh={handleRefreshData}
          />
        )}
      </div>

      {/* Recent Activity */}
      {analytics && analytics.recentActivity && analytics.recentActivity.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'view' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'favorite' ? 'bg-red-100 text-red-600' :
                    activity.type === 'contact' ? 'bg-green-100 text-green-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {activity.type === 'view' && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                      </svg>
                    )}
                    {activity.type === 'favorite' && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                      </svg>
                    )}
                    {activity.type === 'contact' && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                      </svg>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.propertyTitle} • {activity.timeAgo}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;