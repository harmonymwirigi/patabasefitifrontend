// File: frontend/src/pages/Tokens/TokenPackages.tsx
// Updated to use the new M-Pesa payment flow

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getTokenPackages } from '../../api/tokens';
import { useAuth } from '../../hooks/useAuth';
import TokenBalance from '../../components/token/TokenBalance';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Coins, Star, CheckCircle, Zap } from 'lucide-react';

interface TokenPackage {
  id: number;
  name: string;
  token_count: number;
  price: number;
  currency: string;
  description: string;
  features: string[];
  duration_days: number;
  is_active: boolean;
}

const TokenPackages: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, [token]);

  const fetchPackages = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getTokenPackages(token);
      setPackages(data.filter((pkg: TokenPackage) => pkg.is_active));
    } catch (err) {
      console.error('Error fetching token packages:', err);
      setError('Failed to load token packages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (packageId: number) => {
    navigate(`/tokens/checkout/${packageId}`);
  };

  // Format currency
  const formatPrice = (amount: number, currency: string = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get package popularity badge
  const getPackageBadge = (pkg: TokenPackage) => {
    if (pkg.name.toLowerCase().includes('popular') || pkg.token_count === 50) {
      return (
        <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white">
          <Star className="h-3 w-3 mr-1" />
          Popular
        </Badge>
      );
    }
    if (pkg.token_count >= 100) {
      return (
        <Badge className="absolute -top-2 -right-2 bg-purple-500 text-white">
          <Zap className="h-3 w-3 mr-1" />
          Best Value
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Token Packages</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Purchase tokens to search for properties and contact property owners. 
          Choose the package that best fits your needs.
        </p>
      </div>

      {/* Token Balance */}
      <div className="flex justify-center mb-8">
        <TokenBalance showBuyButton={false} />
      </div>
      
      {/* How Tokens Work */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
            <Coins className="h-5 w-5 mr-2" />
            How Tokens Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start">
              <div className="bg-blue-100 rounded-full p-2 mr-3 flex-shrink-0">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <p className="font-medium text-blue-800">Search Properties</p>
                <p className="text-blue-700">Use 1 token per property search</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-100 rounded-full p-2 mr-3 flex-shrink-0">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <div>
                <p className="font-medium text-blue-800">Contact Owners</p>
                <p className="text-blue-700">Use 2 tokens to get contact details</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-100 rounded-full p-2 mr-3 flex-shrink-0">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <div>
                <p className="font-medium text-blue-800">No Expiry</p>
                <p className="text-blue-700">Your tokens never expire</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600 mb-4">{error}</p>
            <Button
              onClick={fetchPackages}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Try Again
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
              {getPackageBadge(pkg)}
              
              {/* Header */}
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center">
                <CardTitle className="text-xl font-bold">{pkg.name}</CardTitle>
                {pkg.description && (
                  <p className="text-blue-100 text-sm">{pkg.description}</p>
                )}
              </CardHeader>
              
              <CardContent className="p-6">
                {/* Token Count */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-2">
                    <Coins className="h-8 w-8 text-blue-600 mr-2" />
                    <span className="text-4xl font-bold text-gray-900">{pkg.token_count}</span>
                  </div>
                  <p className="text-gray-600 font-medium">Tokens</p>
                </div>
                
                {/* Price */}
                <div className="text-center mb-6">
                  <span className="text-3xl font-bold text-blue-600">
                    {formatPrice(pkg.price, pkg.currency)}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    {(pkg.price / pkg.token_count).toFixed(2)} per token
                  </p>
                </div>
                
                {/* Features */}
                {pkg.features.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">What's included:</h4>
                    <ul className="space-y-2">
                      {pkg.features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Duration */}
                {pkg.duration_days > 0 && (
                  <div className="mb-6 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <strong>Valid for:</strong> {pkg.duration_days} days
                    </p>
                  </div>
                )}
                
                {/* Purchase Button */}
                <Button
                  onClick={() => handlePurchase(pkg.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                  size="lg"
                >
                  Buy Now
                </Button>
                
                {/* Payment Methods */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">Pay with M-Pesa</p>
                  <div className="flex justify-center mt-2">
                    <div className="w-8 h-6 bg-green-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">M</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Additional Information */}
      <div className="mt-12 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Secure Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                All payments are processed securely through Safaricom's M-Pesa platform. 
                Your financial information is never stored on our servers.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Having trouble with your purchase? Our support team is available 24/7 
                to help you with any questions or issues.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-12 max-w-3xl mx-auto">
        <h3 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <details className="border border-gray-200 rounded-lg p-4">
            <summary className="font-medium text-gray-900 cursor-pointer">
              Do tokens expire?
            </summary>
            <p className="mt-2 text-sm text-gray-600">
              No, your tokens never expire. You can use them whenever you need to search for properties or contact owners.
            </p>
          </details>
          
          <details className="border border-gray-200 rounded-lg p-4">
            <summary className="font-medium text-gray-900 cursor-pointer">
              Can I get a refund?
            </summary>
            <p className="mt-2 text-sm text-gray-600">
              Tokens are non-refundable once purchased. However, if you experience technical issues, please contact our support team.
            </p>
          </details>
          
          <details className="border border-gray-200 rounded-lg p-4">
            <summary className="font-medium text-gray-900 cursor-pointer">
              How do I pay with M-Pesa?
            </summary>
            <p className="mt-2 text-sm text-gray-600">
              After selecting a package, you'll be prompted to enter your M-Pesa phone number. 
              You'll then receive an STK push notification to complete the payment.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TokenPackages;