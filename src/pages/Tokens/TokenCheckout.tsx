// File: frontend/src/pages/Tokens/TokenCheckout.tsx
// Enhanced token checkout page with M-Pesa payment

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getTokenPackages } from '../../api/tokens';
import MpesaPayment from '../../components/payments/MpesaPayment';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { ArrowLeft, Package, Coins, CreditCard, Shield, Clock } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';

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

const TokenCheckout: React.FC = () => {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toast } = useToast();
  
  const [tokenPackage, setTokenPackage] = useState<TokenPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    fetchTokenPackage();
  }, [packageId, token]);

  const fetchTokenPackage = async () => {
    if (!token || !packageId) return;

    try {
      setLoading(true);
      const packages = await getTokenPackages(token);
      const selectedPackage = packages.find((pkg: TokenPackage) => pkg.id === parseInt(packageId));
      
      if (!selectedPackage) {
        setError('Token package not found');
        return;
      }

      if (!selectedPackage.is_active) {
        setError('This token package is no longer available');
        return;
      }

      setTokenPackage(selectedPackage);
    } catch (err: any) {
      console.error('Error fetching token package:', err);
      setError('Failed to load token package');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (transactionId: number, tokensAdded: number) => {
    toast({
      title: "Payment Successful!",
      description: `${tokensAdded} tokens have been added to your account.`,
      variant: "default",
    });

    // Navigate to dashboard or tokens page
    navigate('/tokens', { 
      state: { 
        paymentSuccess: true, 
        transactionId,
        tokensAdded 
      } 
    });
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !tokenPackage) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {error || 'Package Not Found'}
              </h3>
              <p className="text-gray-600 mb-4">
                The token package you're looking for is not available.
              </p>
              <Button onClick={() => navigate('/tokens')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Packages
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showPayment && paymentMethod === 'mpesa') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => setShowPayment(false)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Checkout
          </Button>
          
          <MpesaPayment
            tokenPackage={tokenPackage}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/tokens')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Packages
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">
            Complete your token purchase
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Package Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Package Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{tokenPackage.name}</h3>
                    <p className="text-gray-600">{tokenPackage.description}</p>
                  </div>
                  <Badge variant="secondary" className="ml-4">
                    <Coins className="h-3 w-3 mr-1" />
                    {tokenPackage.token_count} tokens
                  </Badge>
                </div>

                <Separator />

                {/* Features */}
                <div>
                  <h4 className="font-medium mb-2">What's Included:</h4>
                  <ul className="space-y-1">
                    {tokenPackage.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <Shield className="h-3 w-3 mr-2 text-green-500" />
                        {feature}
                      </li>
                    ))}
                    <li className="flex items-center text-sm text-gray-600">
                      <Coins className="h-3 w-3 mr-2 text-blue-500" />
                      {tokenPackage.token_count} search tokens
                    </li>
                    {tokenPackage.duration_days > 0 && (
                      <li className="flex items-center text-sm text-gray-600">
                        <Clock className="h-3 w-3 mr-2 text-orange-500" />
                        Valid for {tokenPackage.duration_days} days
                      </li>
                    )}
                  </ul>
                </div>

                <Separator />

                {/* Payment Method Selection */}
                <div>
                  <h4 className="font-medium mb-3">Payment Method</h4>
                  <div className="space-y-2">
                    <div
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        paymentMethod === 'mpesa'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setPaymentMethod('mpesa')}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="mpesa"
                          checked={paymentMethod === 'mpesa'}
                          onChange={(e) => setPaymentMethod(e.target.value as 'mpesa')}
                          className="mr-3"
                        />
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center mr-3">
                            <span className="text-white text-xs font-bold">M</span>
                          </div>
                          <div>
                            <p className="font-medium">M-Pesa</p>
                            <p className="text-xs text-gray-600">Pay with your Safaricom M-Pesa</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`border rounded-lg p-3 cursor-not-allowed opacity-50 ${
                        paymentMethod === 'card'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          disabled
                          className="mr-3"
                        />
                        <div className="flex items-center">
                          <CreditCard className="w-8 h-8 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium text-gray-400">Credit/Debit Card</p>
                            <p className="text-xs text-gray-400">Coming soon</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Package:</span>
                    <span className="text-sm font-medium">{tokenPackage.name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tokens:</span>
                    <span className="text-sm font-medium">{tokenPackage.token_count}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Price:</span>
                    <span className="text-sm font-medium">
                      {tokenPackage.currency} {tokenPackage.price.toLocaleString()}
                    </span>
                  </div>
                  
                  {paymentMethod === 'mpesa' && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">M-Pesa charges:</span>
                      <span className="text-sm font-medium">
                        {tokenPackage.currency} {(() => {
                          // Calculate M-Pesa charges
                          const amount = tokenPackage.price;
                          if (amount <= 49) return '0';
                          if (amount <= 100) return '1';
                          if (amount <= 500) return '5';
                          if (amount <= 1000) return '10';
                          if (amount <= 1500) return '15';
                          if (amount <= 2500) return '20';
                          if (amount <= 3500) return '25';
                          if (amount <= 5000) return '30';
                          return '35';
                        })()}
                      </span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-green-600">
                    {tokenPackage.currency} {tokenPackage.price.toLocaleString()}
                  </span>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => setShowPayment(true)}
                    disabled={!paymentMethod || paymentMethod === 'card'}
                    className="w-full"
                    size="lg"
                  >
                    {paymentMethod === 'mpesa' ? 'Pay with M-Pesa' : 'Select Payment Method'}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => navigate('/tokens')}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>

                {/* Security Notice */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-start">
                    <Shield className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-gray-600">
                      <p className="font-medium mb-1">Secure Payment</p>
                      <p>Your payment is secured with industry-standard encryption and processed through Safaricom's secure M-Pesa gateway.</p>
                    </div>
                  </div>
                </div>

                {/* Current Balance */}
                {user && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">Current Balance:</span>
                      <span className="text-sm font-semibold text-blue-700">
                        {user.token_balance || 0} tokens
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-blue-700">After Purchase:</span>
                      <span className="text-sm font-semibold text-blue-700">
                        {(user.token_balance || 0) + tokenPackage.token_count} tokens
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Terms and Conditions */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-xs text-gray-600 space-y-2">
              <p className="font-medium">Terms and Conditions:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Tokens are non-refundable once purchased</li>
                <li>Tokens do not expire unless specified in the package</li>
                <li>Tokens can be used for property searches and contacting property owners</li>
                <li>PataBaseFiti reserves the right to modify token pricing</li>
                <li>By proceeding with payment, you agree to our Terms of Service and Privacy Policy</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TokenCheckout;