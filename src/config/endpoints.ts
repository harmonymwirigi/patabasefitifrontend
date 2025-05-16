// File: frontend/src/config/endpoints.ts
// Updated with correct API paths

// Base API URL
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Authentication endpoints
export const AUTH_ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  GOOGLE_AUTH: `${API_BASE_URL}/auth/google`,
  REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
};

// User endpoints
export const USER_ENDPOINTS = {
  PROFILE: `${API_BASE_URL}/users/me`,
  UPDATE_PROFILE: `${API_BASE_URL}/users/me`,
  CHANGE_PASSWORD: `${API_BASE_URL}/users/me/password`,
};

// Property endpoints
export const PROPERTY_ENDPOINTS = {
  LIST: `${API_BASE_URL}/properties`,
  DETAIL: (id: number) => `${API_BASE_URL}/properties/${id}`,
  CREATE: `${API_BASE_URL}/properties`,
  UPDATE: (id: number) => `${API_BASE_URL}/properties/${id}`,
  DELETE: (id: number) => `${API_BASE_URL}/properties/${id}`,
  FEATURED: `${API_BASE_URL}/properties/featured`,
  SEARCH: `${API_BASE_URL}/properties/search`,
  MY_PROPERTIES: `${API_BASE_URL}/properties/my`,
  FAVORITES: `${API_BASE_URL}/properties/favorites`,
  ADD_FAVORITE: (id: number) => `${API_BASE_URL}/properties/${id}/favorite`,
  REMOVE_FAVORITE: (id: number) => `${API_BASE_URL}/properties/${id}/favorite`,
  IMAGES: (id: number) => `${API_BASE_URL}/properties/${id}/images`,
};

// Message endpoints
export const MESSAGE_ENDPOINTS = {
  CONVERSATIONS: `${API_BASE_URL}/messages/conversations`,
  CONVERSATION: (id: string) => `${API_BASE_URL}/messages/conversations/${id}`,
  SEND: `${API_BASE_URL}/messages`,
};

// Token endpoints
export const TOKEN_ENDPOINTS = {
  PACKAGES: `${API_BASE_URL}/tokens/packages`,
  PURCHASE: `${API_BASE_URL}/tokens/purchase`,
  BALANCE: `${API_BASE_URL}/tokens/balance`,
  HISTORY: `${API_BASE_URL}/tokens/history`,
};

// Payment endpoints
export const PAYMENT_ENDPOINTS = {
  MPESA_INIT: `${API_BASE_URL}/payments/mpesa/init`,
  MPESA_CONFIRM: `${API_BASE_URL}/payments/mpesa/confirm`,
  HISTORY: `${API_BASE_URL}/payments/history`,
};