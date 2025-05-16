// File: frontend/src/api/tokens.ts
// Status: COMPLETE
// Dependencies: axios, config/constants

import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

// Create axios instance with auth interceptor
const createTokenApi = (token?: string) => {
  const tokenApi = axios.create({
    baseURL: `${API_BASE_URL}/tokens`,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  
  return tokenApi;
};

export const getTokenPackages = async () => {
  const tokenApi = createTokenApi();
  const response = await tokenApi.get('/packages');
  return response.data;
};

export const getTokenBalance = async (token: string) => {
  const tokenApi = createTokenApi(token);
  const response = await tokenApi.get('/balance');
  return response.data;
};

export const purchaseTokens = async (token: string, packageId: number, phoneNumber: string) => {
  const tokenApi = createTokenApi(token);
  const response = await tokenApi.post('/purchase', {
    package_id: packageId,
    phone_number: phoneNumber,
  });
  return response.data;
};

export const getTokenTransactions = async (token: string, params = {}) => {
  const tokenApi = createTokenApi(token);
  const response = await tokenApi.get('/transactions', { params });
  return response.data;
};