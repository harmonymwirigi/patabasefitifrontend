// frontend/src/api/admin.ts

import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

// Create axios instance with auth interceptor
const createAdminApi = (token: string) => {
  const adminApi = axios.create({
    baseURL: `${API_BASE_URL}/admin`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return adminApi;
};

// Get admin dashboard statistics
export const getAdminStats = async (token: string) => {
  const adminApi = createAdminApi(token);
  try {
    const response = await adminApi.get('/stats');
    console.log("API Response - getAdminStats:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error - getAdminStats:", error);
    throw error;
  }
};

// Get list of all users
export const getAllUsers = async (token: string, params = {}) => {
  const adminApi = createAdminApi(token);
  try {
    const response = await adminApi.get('/users', { params });
    console.log("API Response - getAllUsers:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error - getAllUsers:", error);
    throw error;
  }
};

// Update user status
export const updateUserStatus = async (token: string, userId: number, status: string) => {
  const adminApi = createAdminApi(token);
  try {
    const response = await adminApi.put(`/users/${userId}/status`, { status });
    console.log("API Response - updateUserStatus:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error - updateUserStatus:", error);
    throw error;
  }
};

// Update user role
export const updateUserRole = async (token: string, userId: number, role: string) => {
  const adminApi = createAdminApi(token);
  try {
    const response = await adminApi.put(`/users/${userId}/role`, { role });
    console.log("API Response - updateUserRole:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error - updateUserRole:", error);
    throw error;
  }
};

// Get properties pending verification
export const getPendingVerifications = async (token: string, params = {}) => {
  const adminApi = createAdminApi(token);
  try {
    const response = await adminApi.get('/properties/pending-verification', { params });
    console.log("API Response - getPendingVerifications:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error - getPendingVerifications:", error);
    throw error;
  }
};

// Verify a property
export const verifyProperty = async (token: string, propertyId: number, status: string, notes?: string) => {
  const adminApi = createAdminApi(token);
  try {
    // Structure the payload according to the API's expectations
    const payload = { 
      status,
      notes: notes || null
    };
    
    const response = await adminApi.put(`/properties/${propertyId}/verify`, payload);
    console.log("API Response - verifyProperty:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error - verifyProperty:", error);
    throw error;
  }
};

// Get property analytics data
export const getPropertyAnalytics = async (token: string, params = {}) => {
  const adminApi = createAdminApi(token);
  try {
    // You may need to create this endpoint in your backend
    const response = await adminApi.get('/analytics/properties', { params });
    console.log("API Response - getPropertyAnalytics:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error - getPropertyAnalytics:", error);
    throw error;
  }
};

// Get user analytics data
export const getUserAnalytics = async (token: string, params = {}) => {
  const adminApi = createAdminApi(token);
  try {
    // You may need to create this endpoint in your backend
    const response = await adminApi.get('/analytics/users', { params });
    console.log("API Response - getUserAnalytics:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error - getUserAnalytics:", error);
    throw error;
  }
};

// Get revenue analytics data
export const getRevenueAnalytics = async (token: string, params = {}) => {
  const adminApi = createAdminApi(token);
  try {
    // You may need to create this endpoint in your backend
    const response = await adminApi.get('/analytics/revenue', { params });
    console.log("API Response - getRevenueAnalytics:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error - getRevenueAnalytics:", error);
    throw error;
  }
};