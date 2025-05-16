// File: frontend/src/components/token/TokenBalance.tsx
// Status: COMPLETE
// Dependencies: react, api/tokens

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getTokenBalance } from '../../api/tokens';

interface TokenBalanceProps {
  showBuyButton?: boolean;
  onClickBuy?: () => void;
  className?: string;
}

const TokenBalance: React.FC<TokenBalanceProps> = ({
  showBuyButton = true,
  onClickBuy,
  className = '',
}) => {
  const { token, user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!token) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getTokenBalance(token);
        setBalance(data.token_balance);
      } catch (err) {
        console.error('Error fetching token balance:', err);
        setError('Failed to load token balance');
      } finally {
        setLoading(false);
      }
    };
    
    // If user is loaded, use the token balance from user object
    if (user && user.token_balance !== undefined) {
      setBalance(user.token_balance);
    } else {
      // Otherwise fetch from API
      fetchBalance();
    }
  }, [token, user]);

  const handleBuyClick = () => {
    if (onClickBuy) {
      onClickBuy();
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
        </svg>
        
        {loading ? (
          <div className="h-5 w-12 bg-gray-200 animate-pulse rounded"></div>
        ) : error ? (
          <span className="text-red-500 text-sm">Error</span>
        ) : (
          <span className="font-medium">
            {balance !== null ? balance : '-'} Tokens
          </span>
        )}
      </div>
      
      {showBuyButton && (
        <button
          onClick={handleBuyClick}
          className="ml-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Buy Tokens
        </button>
      )}
    </div>
  );
};

export default TokenBalance;