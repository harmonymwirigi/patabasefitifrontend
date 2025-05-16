// File: frontend/src/pages/Tokens/TokenCheckout.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTokenPackages, purchaseTokens } from '../../api/tokens';
import { useAuth } from '../../hooks/useAuth';
import { Alert } from '../../components/common/Alert';

const TokenCheckout: React.FC = () => {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [packageData, setPackageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    fetchPackage();
  }, [packageId, token]);

  const fetchPackage = async () => {
    if (!token || !packageId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const packages = await getTokenPackages();
      const pkg = packages.find((p: any) => p.id === parseInt(packageId));
      
      if (!pkg) {
        setError('Package not found');
      } else {
        setPackageData(pkg);
      }
    } catch (err) {
      console.error('Error fetching token package:', err);
      setError('Failed to load package information');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !packageId || !phoneNumber) return;
    
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await purchaseTokens(token, parseInt(packageId), phoneNumber);
      
      setSuccess('Payment request sent! Please check your phone to complete the M-Pesa payment.');
      
      // Redirect after successful payment initiation
      setTimeout(() => {
        navigate('/tokens');
      }, 3000);
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err?.response?.data?.detail || 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Format currency
  const formatPrice = (amount: number, currency: string = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Purchase</h1>
      
      {error && <Alert type="error" message={error} className="mb-6" />}
      {success && <Alert type="success" message={success} className="mb-6" />}
      
      {packageData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                  M-Pesa Phone Number
                </label>
                <input
                  type="text"
                  id="phone_number"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="e.g. 0712345678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter the phone number that will receive the M-Pesa payment request
                </p>
              </div>
              
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
              >
                {isProcessing ? 'Processing...' : 'Pay with M-Pesa'}
              </button>
            </form>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="border-b border-gray-200 pb-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Package</span>
                <span className="font-medium">{packageData.name}</span>
              </div>
              
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tokens</span>
                <span className="font-medium">{packageData.token_count} tokens</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Price</span>
                <span className="font-medium">{formatPrice(packageData.price, packageData.currency)}</span>
              </div>
            </div>
            
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(packageData.price, packageData.currency)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenCheckout;