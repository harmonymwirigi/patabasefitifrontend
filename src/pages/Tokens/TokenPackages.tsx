// File: frontend/src/pages/Tokens/TokenPackages.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTokenPackages } from '../../api/tokens';
import { useAuth } from '../../hooks/useAuth';
import TokenPurchaseModal from '../../components/token/TokenPurchaseModal';
import TokenBalance from '../../components/token/TokenBalance';

const TokenPackages: React.FC = () => {
  const { token } = useAuth();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, [token]);

  const fetchPackages = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getTokenPackages();
      setPackages(data);
    } catch (err) {
      console.error('Error fetching token packages:', err);
      setError('Failed to load token packages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (packageId: number) => {
    setSelectedPackage(packageId);
    setShowPurchaseModal(true);
  };

  // Format currency
  const formatPrice = (amount: number, currency: string = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Token Packages</h1>
        <TokenBalance />
      </div>
      
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">How Tokens Work</h2>
        <p className="text-blue-700">
          Tokens are used to access property listings and contact property owners. Each search costs 1 token, 
          and contacting an owner costs 2 tokens. Purchase the package that best suits your needs.
        </p>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchPackages}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-blue-600 text-white p-4 text-center">
                <h3 className="text-xl font-bold">{pkg.name}</h3>
              </div>
              
              <div className="p-6">
                <div className="text-center mb-4">
                  <span className="text-3xl font-bold text-gray-900">{pkg.token_count}</span>
                  <span className="text-gray-600 ml-1">Tokens</span>
                </div>
                
                <div className="text-center mb-6">
                  <span className="text-2xl font-bold text-blue-600">
                    {formatPrice(pkg.price, pkg.currency)}
                  </span>
                </div>
                
                {pkg.features.length > 0 && (
                  <ul className="space-y-2 mb-6">
                    {pkg.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                         <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                       </svg>
                       {feature}
                     </li>
                   ))}
                 </ul>
               )}
               
               <button
                 onClick={() => handlePurchase(pkg.id)}
                 className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-150 ease-in-out"
               >
                 Buy Now
               </button>
             </div>
           </div>
         ))}
       </div>
     )}
     
     <TokenPurchaseModal
       isOpen={showPurchaseModal}
       onClose={() => setShowPurchaseModal(false)}
       initialPackageId={selectedPackage}
     />
   </div>
 );
};

export default TokenPackages;