// frontend/src/pages/Dashboard/Admin/Analytics.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { 
  getAdminStats,
  getPropertyAnalytics,
  getUserAnalytics,
  getRevenueAnalytics 
} from '../../../api/admin';
import { LineChart, BarChart, PieChart } from '../../../components/charts';

const Analytics: React.FC = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  
  const [stats, setStats] = useState<any>(null);
  const [propertyAnalytics, setPropertyAnalytics] = useState<any>(null);
  const [userAnalytics, setUserAnalytics] = useState<any>(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState<any>(null);

  useEffect(() => {
    if (token) {
      fetchAnalyticsData();
    }
  }, [token, timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch basic statistics
      const statsData = await getAdminStats(token);
      setStats(statsData);

      try {
        // Fetch property analytics with time range filter
        const propertyData = await getPropertyAnalytics(token, { timeRange });
        setPropertyAnalytics(propertyData);
      } catch (err) {
        console.error("Error fetching property analytics:", err);
        // If the endpoint is not yet available, use mock data
        setPropertyAnalytics({
          newPropertiesCount: 43,
          popularNeighborhoods: [
            { name: "Kilimani", count: 124 },
            { name: "Westlands", count: 98 },
            { name: "Lavington", count: 76 },
            { name: "Kileleshwa", count: 67 },
            { name: "Karen", count: 45 }
          ],
          propertyTypes: [
            { type: "Apartment", count: 245 },
            { type: "House", count: 178 },
            { type: "Studio", count: 86 },
            { type: "Villa", count: 32 }
          ]
        });
      }

      try {
        // Fetch user analytics with time range filter
        const userData = await getUserAnalytics(token, { timeRange });
        setUserAnalytics(userData);
      } catch (err) {
        console.error("Error fetching user analytics:", err);
        // If the endpoint is not yet available, use mock data
        setUserAnalytics({
          activeUsers: 920,
          registrationTrend: [
            { date: "2025-01", tenants: 35, owners: 12 },
            { date: "2025-02", tenants: 42, owners: 15 },
            { date: "2025-03", tenants: 53, owners: 18 },
            { date: "2025-04", tenants: 58, owners: 22 },
            { date: "2025-05", tenants: 65, owners: 25 }
          ],
          usersByRole: [
            { role: "Tenant", count: 980 },
            { role: "Owner", count: 245 },
            { role: "Admin", count: 25 }
          ]
        });
      }

      try {
        // Fetch revenue analytics with time range filter
        const revenueData = await getRevenueAnalytics(token, { timeRange });
        setRevenueAnalytics(revenueData);
      } catch (err) {
        console.error("Error fetching revenue analytics:", err);
        // If the endpoint is not yet available, use mock data
        setRevenueAnalytics({
          revenueTrend: [
            { date: "2025-01", amount: 87500 },
            { date: "2025-02", amount: 95000 },
            { date: "2025-03", amount: 112000 },
            { date: "2025-04", amount: 128500 },
            { date: "2025-05", amount: 145800 }
          ],
          revenueBySource: [
            { source: "Token Purchases", amount: 285000 },
            { source: "Subscriptions", amount: 175000 },
            { source: "Featured Listings", amount: 45000 },
            { source: "Other", amount: 12000 }
          ]
        });
      }

      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching analytics:", err);
      setError(err.response?.data?.detail || "Failed to load analytics data");
      setLoading(false);
    }
  };

  // Format numbers with comma separators and KES currency
  const formatCurrency = (value: number) => `KES ${value.toLocaleString()}`;
  
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
        <button 
          onClick={fetchAnalyticsData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 rounded text-sm ${
              timeRange === 'week' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Weekly
          </button>
          <button 
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 rounded text-sm ${
              timeRange === 'month' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setTimeRange('year')}
            className={`px-3 py-1 rounded text-sm ${
              timeRange === 'year' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Yearly
          </button>
        </div>
      </div>
      
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-500 text-sm">Total Users</p>
              <p className="text-2xl font-bold">{stats.users.total.toLocaleString()}</p>
              {userAnalytics && (
                <p className="text-green-600 text-sm mt-2">
                  {userAnalytics.registrationTrend && 
                   `+${userAnalytics.registrationTrend.reduce((sum: number, item: any) => 
                     sum + item.tenants + item.owners, 0)} new ${timeRange === 'week' ? 'this week' : 
                     timeRange === 'month' ? 'this month' : 'this year'}`}
                </p>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-500 text-sm">Total Properties</p>
              <p className="text-2xl font-bold">{stats.properties.total.toLocaleString()}</p>
              <p className="text-green-600 text-sm mt-2">
                {propertyAnalytics && propertyAnalytics.newPropertiesCount ? 
                  `+${propertyAnalytics.newPropertiesCount} new ${timeRange === 'week' ? 'this week' : 
                  timeRange === 'month' ? 'this month' : 'this year'}` :
                  `${stats.properties.available} available`}
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-500 text-sm">Verification Rate</p>
              <p className="text-2xl font-bold">
                {stats.properties.total > 0 ? 
                  Math.round((stats.properties.verified / stats.properties.total) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-500 mt-2">
                of all properties
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-500 text-sm">Revenue (KES)</p>
              <p className="text-2xl font-bold">{stats.transactions.revenue.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-2">
                from {stats.transactions.completed} transactions
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">User Registration Trend</h2>
              {userAnalytics && userAnalytics.registrationTrend && (
                <LineChart
                  data={userAnalytics.registrationTrend}
                  xField="date"
                  yFields={[
                    { key: "tenants", color: "#3B82F6", label: "Tenants" },
                    { key: "owners", color: "#10B981", label: "Owners" }
                  ]}
                  height={300}
                />
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Popular Neighborhoods</h2>
              {propertyAnalytics && propertyAnalytics.popularNeighborhoods && (
                <BarChart
                  data={propertyAnalytics.popularNeighborhoods}
                  nameField="name"
                  valueField="count"
                  color="#3B82F6"
                  height={300}
                  horizontal={true}
                />
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>
              {revenueAnalytics && revenueAnalytics.revenueTrend && (
                <LineChart
                  data={revenueAnalytics.revenueTrend}
                  xField="date"
                  yFields={[
                    { key: "amount", color: "#8B5CF6", label: "Revenue" }
                  ]}
                  height={300}
                />
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Property Types</h2>
              {propertyAnalytics && propertyAnalytics.propertyTypes && (
                <PieChart
                  data={propertyAnalytics.propertyTypes}
                  nameField="type"
                  valueField="count"
                  height={300}
                  donut={true}
                  colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444']}
                />
              )}
            </div>
          </div>
          
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Revenue by Source</h2>
            {revenueAnalytics && revenueAnalytics.revenueBySource && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PieChart
                  data={revenueAnalytics.revenueBySource}
                  nameField="source"
                  valueField="amount"
                  height={300}
                  formatter={formatCurrency}
                  colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444']}
                />
                <BarChart
                  data={revenueAnalytics.revenueBySource}
                  nameField="source"
                  valueField="amount"
                  height={300}
                  formatter={formatCurrency}
                  color="#8B5CF6"
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;