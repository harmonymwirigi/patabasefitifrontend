// File: frontend/src/components/token/TokenBalance.tsx
// Updated token balance component with new purchase flow

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getTokenBalance } from '../../api/tokens';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Coins, Plus, RefreshCw } from 'lucide-react';

interface TokenBalanceProps {
  showBuyButton?: boolean;
  className?: string;
  compact?: boolean;
}

const TokenBalance: React.FC<TokenBalanceProps> = ({ 
  showBuyButton = true, 
  className = '',
  compact = false 
}) => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number>(user?.token_balance || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchBalance();
    }
  }, [token, user]);

  const fetchBalance = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const balanceData = await getTokenBalance(token);
      setBalance(balanceData.current_balance);
    } catch (err: any) {
      console.error('Error fetching token balance:', err);
      setError('Failed to load balance');
      // Fallback to user balance from auth context
      setBalance(user?.token_balance || 0);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyTokens = () => {
    navigate('/tokens');
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex items-center bg-blue-50 rounded-full px-3 py-1">
          <Coins className="h-4 w-4 text-blue-600 mr-1" />
          <span className="text-sm font-semibold text-blue-700">
            {loading ? '...' : balance}
          </span>
        </div>
        {showBuyButton && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleBuyTokens}
            className="text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Buy
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 rounded-full p-2">
              <Coins className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Token Balance</p>
              <div className="flex items-center space-x-2">
                {loading ? (
                  <div className="flex items-center">
                    <RefreshCw className="h-4 w-4 animate-spin text-gray-400 mr-1" />
                    <span className="text-lg font-bold text-gray-400">Loading...</span>
                  </div>
                ) : error ? (
                  <div>
                    <span className="text-lg font-bold text-red-600">Error</span>
                    <button
                      onClick={fetchBalance}
                      className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <span className="text-lg font-bold text-blue-600">
                    {balance} {balance === 1 ? 'token' : 'tokens'}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {showBuyButton && (
            <Button
              onClick={handleBuyTokens}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Buy Tokens
            </Button>
          )}
        </div>
        
        {/* Low balance warning */}
        {balance <= 5 && balance > 0 && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs text-yellow-800">
              <strong>Low balance:</strong> You have {balance} tokens remaining. 
              Consider purchasing more to continue using our services.
            </p>
          </div>
        )}
        
        {/* No tokens warning */}
        {balance === 0 && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs text-red-800">
              <strong>No tokens:</strong> You need tokens to search properties and contact owners.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TokenBalance;