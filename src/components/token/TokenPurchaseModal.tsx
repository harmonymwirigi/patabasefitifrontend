// File: frontend/src/components/token/TokenPurchaseModal.tsx
// Updated to redirect to checkout page instead of old purchase flow

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTokenPackages } from '../../api/tokens';
import { useAuth } from '../../hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Coins, ArrowRight } from 'lucide-react';

interface TokenPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPackageId?: number | null;
}

interface TokenPackage {
  id: number;
  name: string;
  token_count: number;
  price: number;
  currency: string;
  description: string;
  features: string[];
  is_active: boolean;
}

const TokenPurchaseModal: React.FC<TokenPurchaseModalProps> = ({
  isOpen,
  onClose,
  initialPackageId = null,
}) => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(initialPackageId);

  useEffect(() => {
    if (isOpen && token) {
      fetchPackages();
    }
  }, [isOpen, token]);

  useEffect(() => {
    if (initialPackageId) {
      setSelectedPackageId(initialPackageId);
    }
  }, [initialPackageId]);

  const fetchPackages = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const data = await getTokenPackages(token);
      setPackages(data.filter((pkg: TokenPackage) => pkg.is_active));
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (selectedPackageId) {
      onClose();
      navigate(`/tokens/checkout/${selectedPackageId}`);
    }
  };

  const handleGoToTokens = () => {
    onClose();
    navigate('/tokens');
  };

  const formatPrice = (amount: number, currency: string = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Purchase Tokens</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <p className="text-gray-600">
                  Select a token package to continue with secure M-Pesa payment
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {packages.map((pkg) => (
                  <Card
                    key={pkg.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedPackageId === pkg.id
                        ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50'
                        : 'hover:border-blue-300 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedPackageId(pkg.id)}
                  >
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <Coins className="h-6 w-6 text-blue-600 mr-1" />
                          <span className="text-2xl font-bold text-gray-900">
                            {pkg.token_count}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{pkg.name}</h3>
                        <p className="text-xl font-bold text-blue-600">
                          {formatPrice(pkg.price, pkg.currency)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {(pkg.price / pkg.token_count).toFixed(2)} per token
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-between space-x-3">
                <Button
                  variant="outline"
                  onClick={handleGoToTokens}
                  className="flex-1"
                >
                  View All Packages
                </Button>
                
                <Button
                  onClick={handleProceedToCheckout}
                  disabled={!selectedPackageId}
                  className="flex-1"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Secure payment with M-Pesa • No hidden fees • Instant token delivery
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TokenPurchaseModal;