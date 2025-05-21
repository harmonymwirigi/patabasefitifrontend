// frontend/src/pages/Dashboard/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getAdminStats } from '../../api/admin';

interface DashboardStats {
  users: {
    total: number;
    tenants: number;
    owners: number;
  };
  properties: {
    total: number;
    available: number;
    verified: number;
  };
  transactions: {
    total: number;
    completed: number;
    revenue: number;
  };
  subscriptions: {
    active: number;
  };
}

const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getAdminStats(token);
        setStats(data);
      } catch (err: any) {
        console.error('Error fetching dashboard stats:', err);
        setError(err.response?.data?.detail || 'Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

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
            onClick={() => window.location.reload()}
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Users Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 bg-opacity-75">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h2 className="mb-2 text-lg leading-6 font-medium text-gray-600">Total Users</h2>
                  <div className="mt-1 flex items-baseline justify-between">
                    <div className="flex items-baseline text-2xl font-semibold text-gray-900">
                      {stats.users.total.toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between text-sm">
                    <div>
                      <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        Tenants: {stats.users.tenants.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-800">
                        Owners: {stats.users.owners.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <Link
                  to="/admin/users"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  View All Users
                </Link>
              </div>
            </div>

            {/* Properties Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 bg-opacity-75">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h2 className="mb-2 text-lg leading-6 font-medium text-gray-600">Properties</h2>
                  <div className="mt-1 flex items-baseline justify-between">
                    <div className="flex items-baseline text-2xl font-semibold text-gray-900">
                      {stats.properties.total.toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between text-sm">
                    <div>
                      <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        Available: {stats.properties.available.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-800">
                        Verified: {stats.properties.verified.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <Link
                  to="/admin/properties"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  View Properties
                </Link>
              </div>
            </div>

            {/* Revenue Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 bg-opacity-75">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h2 className="mb-2 text-lg leading-6 font-medium text-gray-600">Revenue</h2>
                  <div className="mt-1 flex items-baseline justify-between">
                    <div className="flex items-baseline text-2xl font-semibold text-gray-900">
                      KES {stats.transactions.revenue.toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-800">
                      {stats.transactions.completed} completed transactions
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <Link
                  to="/admin/analytics"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  View Analytics
                </Link>
              </div>
            </div>

            {/* Subscriptions Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 bg-opacity-75">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h2 className="mb-2 text-lg leading-6 font-medium text-gray-600">Subscriptions</h2>
                  <div className="mt-1 flex items-baseline justify-between">
                    <div className="flex items-baseline text-2xl font-semibold text-gray-900">
                      {stats.subscriptions.active.toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                      Active subscriptions
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <Link
                  to="/admin/analytics"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Properties */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900">Properties Pending Verification</h3>
              </div>
              <div className="p-4">
                <Link
                  to="/admin/properties"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  View All Properties
                </Link>
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900">Recent Users</h3>
              </div>
              <div className="p-4">
                <Link
                  to="/admin/users"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  View All Users
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;