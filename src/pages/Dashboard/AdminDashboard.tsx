// File: frontend/src/pages/Dashboard/AdminDashboard.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Mock summary data for the dashboard
interface DashboardSummary {
  totalUsers: number;
  totalProperties: number;
  pendingVerifications: number;
  activeUsers: number;
  monthlyRevenue: number;
  recentActivities: {
    id: number;
    type: string;
    description: string;
    timestamp: string;
    user?: string;
  }[];
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, you would fetch this data from your API
    // For now, we'll use mock data
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate API call
        setTimeout(() => {
          setSummary({
            totalUsers: 1250,
            totalProperties: 845,
            pendingVerifications: 28,
            activeUsers: 920,
            monthlyRevenue: 354800,
            recentActivities: [
              { 
                id: 1, 
                type: 'property', 
                description: 'New property listed', 
                timestamp: '2025-05-13T10:30:00Z',
                user: 'Sarah Kamau'
              },
              { 
                id: 2, 
                type: 'user', 
                description: 'New user registered', 
                timestamp: '2025-05-13T09:15:22Z',
                user: 'Michael Omondi'
              },
              { 
                id: 3, 
                type: 'verification', 
                description: 'Property verification request', 
                timestamp: '2025-05-13T08:45:18Z',
                user: 'John Doe'
              },
              { 
                id: 4, 
                type: 'payment', 
                description: 'Token package purchased', 
                timestamp: '2025-05-13T07:10:45Z',
                user: 'Elizabeth Wanjiku'
              },
              { 
                id: 5, 
                type: 'property', 
                description: 'Property updated', 
                timestamp: '2025-05-12T16:30:00Z',
                user: 'Daniel Kipchoge'
              }
            ]
          });
          setLoading(false);
        }, 800);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

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
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, <span className="font-semibold">{user?.full_name || 'Admin'}</span>
        </p>
      </div>
      
      {summary && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Dashboard Cards */}
            <Link to="/admin/users" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold">{summary.totalUsers.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-sm text-blue-600">View all users →</p>
            </Link>

            <Link to="/admin/properties" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Properties</p>
                  <p className="text-2xl font-bold">{summary.totalProperties.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-sm text-green-600">Manage properties →</p>
            </Link>

            <Link to="/admin/properties" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Pending Verifications</p>
                  <p className="text-2xl font-bold">{summary.pendingVerifications.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-sm text-yellow-600">Review verifications →</p>
            </Link>

            <Link to="/admin/analytics" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Monthly Revenue (KES)</p>
                  <p className="text-2xl font-bold">{summary.monthlyRevenue.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-sm text-purple-600">View analytics →</p>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-1">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link 
                  to="/admin/properties" 
                  className="block w-full p-3 bg-blue-50 hover:bg-blue-100 rounded-md text-blue-800 font-medium transition duration-200"
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    Verify Properties
                  </div>
                </Link>
                <Link 
                  to="/admin/users" 
                  className="block w-full p-3 bg-green-50 hover:bg-green-100 rounded-md text-green-800 font-medium transition duration-200"
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Manage Users
                  </div>
                </Link>
                <Link 
                  to="/admin/analytics" 
                  className="block w-full p-3 bg-purple-50 hover:bg-purple-100 rounded-md text-purple-800 font-medium transition duration-200"
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    View Reports
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              <div className="divide-y divide-gray-200">
                {summary.recentActivities.map((activity) => (
                  <div key={activity.id} className="py-3">
                    <div className="flex items-start">
                      <div className={`p-2 rounded-full mr-3 ${
                        activity.type === 'property' ? 'bg-blue-100' :
                        activity.type === 'user' ? 'bg-green-100' :
                        activity.type === 'verification' ? 'bg-yellow-100' :
                        'bg-purple-100'
                      }`}>
                        {activity.type === 'property' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        )}
                        {activity.type === 'user' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                        {activity.type === 'verification' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {activity.type === 'payment' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <span className="font-medium text-gray-700">{activity.user}</span>
                          <span className="mx-1">•</span>
                          <span>{new Date(activity.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <button className="text-sm text-blue-600 font-medium hover:text-blue-800">
                  View all activity →
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;