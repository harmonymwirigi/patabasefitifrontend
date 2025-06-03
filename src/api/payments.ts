// File: frontend/src/api/payments.ts
// Payments API for M-Pesa integration - FIXED URL duplication

import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

// Types for M-Pesa payment
export interface MpesaPaymentRequest {
  package_id: number;
  phone_number: string;
  amount: number;
}

export interface MpesaPaymentResponse {
  success: boolean;
  message: string;
  transaction_id?: number;
  checkout_request_id?: string;
  merchant_request_id?: string;
  error?: string;
}

export interface MpesaStatusResponse {
  success: boolean;
  status: string; // completed, pending, failed, cancelled, timeout
  message: string;
  result_code?: number;
  checkout_request_id: string;
  transaction_id?: number;
  amount?: number;
  mpesa_receipt?: string;
}

export interface PaymentTransaction {
  id: number;
  user_id: number;
  transaction_type: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  mpesa_receipt?: string;
  tokens_purchased?: number;
  package_id?: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Create axios instance for payments - FIXED: Added /api/v1
const createPaymentsApi = (token: string) => {
  return axios.create({
    baseURL: `${API_BASE_URL}/payments`, // FIXED: Added /api/v1
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Initiate M-Pesa STK Push payment
 */
export const initiateMpesaPayment = async (
  token: string,
  paymentRequest: MpesaPaymentRequest
): Promise<MpesaPaymentResponse> => {
  try {
    console.log('🔄 Initiating M-Pesa payment:', paymentRequest);
    
    const paymentsApi = createPaymentsApi(token);
    const response = await paymentsApi.post('/mpesa/initiate', paymentRequest);
    
    console.log('✅ M-Pesa payment initiated:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ M-Pesa payment initiation failed:', error);
    
    if (error.response?.data) {
      throw new Error(error.response.data.detail || 'Payment initiation failed');
    }
    throw new Error('Network error. Please check your connection.');
  }
};

/**
 * Check M-Pesa payment status
 */
export const checkMpesaStatus = async (
  token: string,
  checkoutRequestId: string
): Promise<MpesaStatusResponse> => {
  try {
    const paymentsApi = createPaymentsApi(token);
    const response = await paymentsApi.get(`/mpesa/status/${checkoutRequestId}`);
    
    return response.data;
  } catch (error: any) {
    console.error('❌ M-Pesa status check failed:', error);
    
    if (error.response?.data) {
      throw new Error(error.response.data.detail || 'Status check failed');
    }
    throw new Error('Network error. Please check your connection.');
  }
};

/**
 * Get user's payment transactions
 */
export const getUserTransactions = async (
  token: string,
  skip: number = 0,
  limit: number = 10
): Promise<PaymentTransaction[]> => {
  try {
    const paymentsApi = createPaymentsApi(token);
    const response = await paymentsApi.get('/transactions', {
      params: { skip, limit }
    });
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to fetch transactions:', error);
    
    if (error.response?.data) {
      throw new Error(error.response.data.detail || 'Failed to fetch transactions');
    }
    throw new Error('Network error. Please check your connection.');
  }
};

/**
 * Get specific transaction details
 */
export const getTransactionDetails = async (
  token: string,
  transactionId: number
): Promise<PaymentTransaction> => {
  try {
    const paymentsApi = createPaymentsApi(token);
    const response = await paymentsApi.get(`/status/${transactionId}`);
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to fetch transaction details:', error);
    
    if (error.response?.data) {
      throw new Error(error.response.data.detail || 'Transaction not found');
    }
    throw new Error('Network error. Please check your connection.');
  }
};

/**
 * Format phone number for M-Pesa
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digits
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format based on starting digits
  if (cleaned.startsWith('254') && cleaned.length === 12) {
    return cleaned;
  } else if (cleaned.startsWith('07') && cleaned.length === 10) {
    return '254' + cleaned.slice(1);
  } else if (cleaned.startsWith('7') && cleaned.length === 9) {
    return '254' + cleaned;
  } else if (cleaned.startsWith('01') && cleaned.length === 10) {
    return '254' + cleaned.slice(1);
  } else if (cleaned.startsWith('1') && cleaned.length === 9) {
    return '254' + cleaned;
  }
  
  // Return as is if doesn't match expected patterns
  return cleaned;
};

/**
 * Validate Kenyan phone number
 */
export const isValidKenyanPhoneNumber = (phoneNumber: string): boolean => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check various valid formats
  if (cleaned.startsWith('254') && cleaned.length === 12) {
    // Check if it's a valid Kenyan mobile network
    const networkCode = cleaned.substring(3, 5);
    const validNetworks = ['70', '71', '72', '74', '75', '76', '77', '78', '79', '11', '10'];
    return validNetworks.includes(networkCode);
  }
  
  if ((cleaned.startsWith('07') || cleaned.startsWith('01')) && cleaned.length === 10) {
    return true;
  }
  
  if ((cleaned.startsWith('7') || cleaned.startsWith('1')) && cleaned.length === 9) {
    return true;
  }
  
  return false;
};

/**
 * Get payment method display name
 */
export const getPaymentMethodName = (method: string): string => {
  switch (method.toLowerCase()) {
    case 'mpesa':
      return 'M-Pesa';
    case 'card':
      return 'Credit/Debit Card';
    case 'bank':
      return 'Bank Transfer';
    default:
      return method;
  }
};

/**
 * Get transaction status color
 */
export const getTransactionStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'success':
      return 'text-green-600 bg-green-50';
    case 'pending':
      return 'text-yellow-600 bg-yellow-50';
    case 'failed':
    case 'cancelled':
      return 'text-red-600 bg-red-50';
    case 'processing':
      return 'text-blue-600 bg-blue-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount: number, currency: string = 'KES'): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Calculate M-Pesa charges (estimate)
 */
export const calculateMpesaCharges = (amount: number): number => {
  // M-Pesa charges structure (approximate)
  if (amount <= 49) return 0;
  if (amount <= 100) return 1;
  if (amount <= 500) return 5;
  if (amount <= 1000) return 10;
  if (amount <= 1500) return 15;
  if (amount <= 2500) return 20;
  if (amount <= 3500) return 25;
  if (amount <= 5000) return 30;
  if (amount <= 7500) return 35;
  if (amount <= 10000) return 40;
  if (amount <= 15000) return 50;
  if (amount <= 20000) return 55;
  if (amount <= 35000) return 60;
  if (amount <= 50000) return 65;
  return 70; // For amounts above 50,000
};

export default {
  initiateMpesaPayment,
  checkMpesaStatus,
  getUserTransactions,
  getTransactionDetails,
  formatPhoneNumber,
  isValidKenyanPhoneNumber,
  getPaymentMethodName,
  getTransactionStatusColor,
  formatCurrency,
  calculateMpesaCharges,
};