// File: frontend/src/pages/Dashboard/TenantDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedProperties } from '../../api/properties';
import { getTokenBalance, getTokenTransactions } from '../../api/tokens';
import { useAuth } from '../../hooks/useAuth';
import PropertyCard from '../../components/property/PropertyCard';
import TokenBalance from '../../components/token/TokenBalance';
import TokenPurchaseModal from '../../components/token/TokenPurchaseModal';

const TenantDashboard: React.FC = () => {
  const { token, user } = useAuth();
  
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTokenModal, setShowTokenModal] = useState(false);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [properties, transactions] = await Promise.all([
        getFeaturedProperties(),
        getTokenTransactions(token!)
      ]);
      
      setFeaturedProperties(properties.slice(0, 3));
      setRecentTransactions(transactions.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  // Format currency
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Featured Properties</h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
              </div>
            ) : featuredProperties.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No featured properties available</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4">
                  {featuredProperties.map(property => (
                    <PropertyCard
                      key={property.id}
                      id={property.id}
                      title={property.title}
                      address={property.address}
                      city={property.city}
                      rent_amount={property.rent_amount}
                      bedrooms={property.bedrooms}
                      bathrooms={property.bathrooms}
                      property_type={property.property_type}
                      image_url={property.images && property.images.length > 0 ? `/uploads/${property.images[0].path}` : undefined}
                      verification_status={property.verification_status}
                      availability_status={property.availability_status}
                    />
                  ))}
                </div>
                
                <div className="mt-4 text-center">
                  <Link
                    to="/properties"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View All Properties
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Token balance */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Tokens</h2>
            
            <div className="flex items-center justify-between mb-4">
              <TokenBalance showBuyButton={false} />
              
              <button
                onClick={() => setShowTokenModal(true)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md"
              >
                Buy Tokens
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">
              Use tokens to search for properties and contact owners.
            </p>
            
            <Link
              to="/tokens"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Token Packages
            </Link>
          </div>
          
          {/* Recent transactions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
            
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : recentTransactions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent transactions</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {recentTransactions.map(transaction => (
                  <li key={transaction.transaction_id} className="py-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.tokens_purchased > 0
                            ? `Purchased ${transaction.tokens_purchased} tokens`
                            : `Used ${Math.abs(transaction.tokens_purchased)} tokens`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(transaction.timestamp)}
                        </p>
                      </div>
                      
                      <div className={`text-sm font-medium ${
                        transaction.tokens_purchased > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.tokens_purchased > 0 ? '+' : ''}
                        {transaction.tokens_purchased} tokens
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      
      <TokenPurchaseModal
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
      />
    </div>
  );
};

export default TenantDashboard;