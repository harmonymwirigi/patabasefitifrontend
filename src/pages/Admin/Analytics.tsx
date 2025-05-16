//frontend/src/pages/Admin/Analytics.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';

interface AnalyticsData {
  totalUsers: number;
  totalProperties: number;
  newUsersThisMonth: number;
  newPropertiesThisMonth: number;
  verificationRate: number;
  activeUsers: number;
  totalTransactions: number;
  totalRevenue: number;
  popularNeighborhoods: {name: string, count: number}[];
}

const Analytics: React.FC = () => {
  const { token } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // In a real application, you would fetch this from your API
        // const response = await axios.get(`/api/v1/admin/analytics?timeRange=${timeRange}`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // setAnalyticsData(response.data);
        
        // For now, we'll use mock data
        setTimeout(() => {
          setAnalyticsData({
            totalUsers: 1250,
            totalProperties: 845,
            newUsersThisMonth: 78,
            newPropertiesThisMonth: 43,
            verificationRate: 72.4,
            activeUsers: 920,
            totalTransactions: 167,
            totalRevenue: 354800,
            popularNeighborhoods: [
              { name: "Kilimani", count: 124 },
              { name: "Westlands", count: 98 },
              { name: "Lavington", count: 76 },
              { name: "Kileleshwa", count: 67 },
              { name: "Karen", count: 45 }
            ]
          });
          setLoading(false);
        }, 800);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load analytics data');
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token, timeRange]);

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
      
      {analyticsData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-500 text-sm">Total Users</p>
              <p className="text-2xl font-bold">{analyticsData.totalUsers.toLocaleString()}</p>
              <p className="text-green-600 text-sm mt-2">
                +{analyticsData.newUsersThisMonth} new this month
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-500 text-sm">Total Properties</p>
              <p className="text-2xl font-bold">{analyticsData.totalProperties.toLocaleString()}</p>
              <p className="text-green-600 text-sm mt-2">
                +{analyticsData.newPropertiesThisMonth} new this month
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-500 text-sm">Verification Rate</p>
              <p className="text-2xl font-bold">{analyticsData.verificationRate}%</p>
              <p className="text-sm text-gray-500 mt-2">
                of all properties
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-500 text-sm">Revenue (KES)</p>
              <p className="text-2xl font-bold">{analyticsData.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-2">
                from {analyticsData.totalTransactions} transactions
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">User Activity</h2>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center p-8 bg-gray-50 rounded-lg w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-gray-600">Interactive user activity chart would appear here, showing {analyticsData.activeUsers} active users.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Popular Neighborhoods</h2>
              <div className="space-y-4">
                {analyticsData.popularNeighborhoods.map((neighborhood, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-full">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{neighborhood.name}</span>
                        <span className="text-sm font-medium text-gray-700">{neighborhood.count} listings</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${(neighborhood.count / analyticsData.popularNeighborhoods[0].count) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;