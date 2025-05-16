// File: frontend/src/api/admin.ts
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

// Create axios instance with auth interceptor
const createAdminApi = (token: string) => {
  const adminApi = axios.create({
    baseURL: `${API_BASE_URL}/admin`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  
  return adminApi;
};

export const getSystemStats = async (token: string) => {
  const adminApi = createAdminApi(token);
  const response = await adminApi.get('/stats');
  return response.data;
};

export const getAllUsers = async (token: string, params = {}) => {
  const adminApi = createAdminApi(token);
  const response = await adminApi.get('/users', { params });
  return response.data;
};

export const getPropertiesPendingVerification = async (token: string, params = {}) => {
  const adminApi = createAdminApi(token);
  const response = await adminApi.get('/properties/pending-verification', { params });
  return response.data;
};

export const verifyProperty = async (token: string, propertyId: number, status: 'verified' | 'rejected') => {
  const adminApi = createAdminApi(token);
  const response = await adminApi.put(`/properties/${propertyId}/verify?status=${status}`);
  return response.data;
};