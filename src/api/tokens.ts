// File: frontend/src/api/tokens.ts
// Updated tokens API with correct base URL

import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

// Types
export interface TokenPackage {
  id: number;
  name: string;
  token_count: number;
  price: number;
  currency: string;
  description: string;
  features: string[];
  duration_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TokenBalance {
  user_id: number;
  current_balance: number;
  total_purchased: number;
  total_used: number;
  last_updated: string;
}

export interface TokenTransaction {
  id: number;
  user_id: number;
  transaction_type: string;
  amount: number;
  tokens: number;
  description: string;
  status: string;
  timestamp: string;
}

// Create axios instance for tokens API - Fixed base URL
const createTokensApi = (token?: string) => {
  return axios.create({
    baseURL: `${API_BASE_URL}`, // Don't add /tokens here
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};

/**
 * Get all available token packages
 */
export const getTokenPackages = async (token?: string): Promise<TokenPackage[]> => {
  try {
    const tokensApi = createTokensApi(token);
    const response = await tokensApi.get('/tokens/packages'); // Add /tokens here
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to fetch token packages:', error);
    
    if (error.response?.data) {
      throw new Error(error.response.data.detail || 'Failed to fetch token packages');
    }
    throw new Error('Network error. Please check your connection.');
  }
};

/**
 * Get specific token package by ID
 */
export const getTokenPackage = async (token: string, packageId: number): Promise<TokenPackage> => {
  try {
    const tokensApi = createTokensApi(token);
    const response = await tokensApi.get(`/tokens/packages/${packageId}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to fetch token package:', error);
    
    if (error.response?.data) {
      throw new Error(error.response.data.detail || 'Token package not found');
    }
    throw new Error('Network error. Please check your connection.');
  }
};

/**
 * Get user's token balance
 */
export const getTokenBalance = async (token: string): Promise<TokenBalance> => {
  try {
    const tokensApi = createTokensApi(token);
    const response = await tokensApi.get('/tokens/balance');
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to fetch token balance:', error);
    
    if (error.response?.data) {
      throw new Error(error.response.data.detail || 'Failed to fetch token balance');
    }
    throw new Error('Network error. Please check your connection.');
  }
};

/**
 * Get user's token transaction history
 */
export const getTokenTransactions = async (
  token: string, 
  skip: number = 0, 
  limit: number = 10
): Promise<TokenTransaction[]> => {
  try {
    const tokensApi = createTokensApi(token);
    const response = await tokensApi.get('/tokens/transactions', {
      params: { skip, limit }
    });
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to fetch token transactions:', error);
    
    if (error.response?.data) {
      throw new Error(error.response.data.detail || 'Failed to fetch token transactions');
    }
    throw new Error('Network error. Please check your connection.');
  }
};

/**
 * Use tokens for a specific action
 */
export const useTokens = async (
  token: string, 
  action: string, 
  tokens: number, 
  details?: any
): Promise<{ success: boolean; remaining_balance: number; message: string }> => {
  try {
    const tokensApi = createTokensApi(token);
    const response = await tokensApi.post('/tokens/use', {
      action,
      tokens,
      details
    });
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to use tokens:', error);
    
    if (error.response?.data) {
      throw new Error(error.response.data.detail || 'Failed to use tokens');
    }
    throw new Error('Network error. Please check your connection.');
  }
};

/**
 * Check if user has enough tokens for an action
 */
export const checkTokenBalance = async (
  token: string, 
  requiredTokens: number
): Promise<{ hasEnough: boolean; currentBalance: number; needed: number }> => {
  try {
    const balance = await getTokenBalance(token);
    const hasEnough = balance.current_balance >= requiredTokens;
    const needed = hasEnough ? 0 : requiredTokens - balance.current_balance;
    
    return {
      hasEnough,
      currentBalance: balance.current_balance,
      needed
    };
  } catch (error) {
    console.error('❌ Failed to check token balance:', error);
    throw error;
  }
};

/**
 * Format token count with proper pluralization
 */
export const formatTokenCount = (count: number): string => {
  return `${count} ${count === 1 ? 'token' : 'tokens'}`;
};

/**
 * Calculate estimated tokens needed for property search
 */
export const calculateSearchCost = (searchParams: any): number => {
  // Base cost for search
  let cost = 1;
  
  // Additional costs for premium features (if any)
  if (searchParams.premium_filters) {
    cost += 1;
  }
  
  if (searchParams.detailed_view) {
    cost += 1;
  }
  
  return cost;
};

/**
 * Calculate contact cost
 */
export const calculateContactCost = (): number => {
  return 2; // Standard cost to contact property owner
};

/**
 * Get token usage statistics for current user
 */
export const getTokenUsageStats = async (
  token: string
): Promise<{
  total_searches: number;
  total_contacts: number;
  tokens_spent_this_month: number;
  most_used_action: string;
}> => {
  try {
    const tokensApi = createTokensApi(token);
    const response = await tokensApi.get('/tokens/usage-stats');
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to fetch usage stats:', error);
    
    if (error.response?.data) {
      throw new Error(error.response.data.detail || 'Failed to fetch usage statistics');
    }
    throw new Error('Network error. Please check your connection.');
  }
};

export default {
  getTokenPackages,
  getTokenPackage,
  getTokenBalance,
  getTokenTransactions,
  useTokens,
  checkTokenBalance,
  formatTokenCount,
  calculateSearchCost,
  calculateContactCost,
  getTokenUsageStats,
};