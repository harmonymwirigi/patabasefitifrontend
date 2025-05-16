// File: frontend/src/api/properties.ts
// Status: COMPLETE
// Dependencies: axios, config/constants

import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

// Create axios instance with auth interceptor
const createPropertyApi = (token?: string) => {
  const propertyApi = axios.create({
    baseURL: `${API_BASE_URL}/properties`,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  
  return propertyApi;
};

export const getAllProperties = async (token: string, params = {}) => {
  const propertyApi = createPropertyApi(token);
  const response = await propertyApi.get('/', { params });
  return response.data;
};

export const getProperty = async (token: string, propertyId: number) => {
  const propertyApi = createPropertyApi(token);
  const response = await propertyApi.get(`/${propertyId}`);
  return response.data;
};

export const createProperty = async (token: string, propertyData: any) => {
  const propertyApi = createPropertyApi(token);
  const response = await propertyApi.post('/', propertyData);
  return response.data;
};

export const updateProperty = async (token: string, propertyId: number, propertyData: any) => {
  const propertyApi = createPropertyApi(token);
  const response = await propertyApi.put(`/${propertyId}`, propertyData);
  return response.data;
};

export const deleteProperty = async (token: string, propertyId: number) => {
  const propertyApi = createPropertyApi(token);
  await propertyApi.delete(`/${propertyId}`);
  return true;
};

export const searchProperties = async (token: string, searchParams: any) => {
  const propertyApi = createPropertyApi(token);
  const response = await propertyApi.post('/search', searchParams);
  return response.data;
};

export const getFeaturedProperties = async () => {
  const propertyApi = createPropertyApi();
  const response = await propertyApi.get('/featured/list');
  return response.data;
};

export const uploadPropertyImages = async (token: string, propertyId: number, files: File[]) => {
  const propertyApi = createPropertyApi(token);
  
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });
  
  const response = await propertyApi.post(`/${propertyId}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const updatePropertyStatus = async (token: string, propertyId: number, status: string) => {
  const propertyApi = createPropertyApi(token);
  const response = await propertyApi.put(`/${propertyId}/status?status=${status}`, {});
  return response.data;
};