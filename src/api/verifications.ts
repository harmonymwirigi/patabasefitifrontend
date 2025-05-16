// File: frontend/src/api/verifications.ts
// Status: COMPLETE
// Dependencies: axios, config/constants

import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

// Create axios instance with auth interceptor
const createVerificationApi = (token: string) => {
  const verificationApi = axios.create({
    baseURL: `${API_BASE_URL}/verifications`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  
  return verificationApi;
};

export const getPropertyVerifications = async (token: string, propertyId: number) => {
  const verificationApi = createVerificationApi(token);
  const response = await verificationApi.get(`/property/${propertyId}`);
  return response.data;
};

export const getPendingVerifications = async (token: string) => {
  const verificationApi = createVerificationApi(token);
  const response = await verificationApi.get('/pending');
  return response.data;
};

export const getVerification = async (token: string, verificationId: number) => {
  const verificationApi = createVerificationApi(token);
  const response = await verificationApi.get(`/${verificationId}`);
  return response.data;
};

export const respondToVerification = async (token: string, verificationId: number, response: 'yes' | 'no') => {
  const verificationApi = createVerificationApi(token);
  const responseData = await verificationApi.post(`/${verificationId}/respond`, {
    response: response,
  });
  return responseData.data;
};

export const uploadVerificationEvidence = async (token: string, verificationId: number, file: File) => {
  const verificationApi = createVerificationApi(token);
  
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await verificationApi.post(`/${verificationId}/evidence`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};