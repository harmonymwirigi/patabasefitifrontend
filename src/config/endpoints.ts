// File: frontend/src/config/endpoints.ts
// Updated to include new Google auth endpoints

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_VERSION = '/api/v1';

export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}${API_VERSION}/auth/login`,
  REGISTER: `${API_BASE_URL}${API_VERSION}/auth/register`,
  GOOGLE_AUTH: `${API_BASE_URL}${API_VERSION}/auth/google`,
  GOOGLE_VERIFY: `${API_BASE_URL}${API_VERSION}/auth/google/verify`,
  GOOGLE_COMPLETE: `${API_BASE_URL}${API_VERSION}/auth/google/complete`,
  REFRESH_TOKEN: `${API_BASE_URL}${API_VERSION}/auth/refresh`,
  LOGOUT: `${API_BASE_URL}${API_VERSION}/auth/logout`,
  FORGOT_PASSWORD: `${API_BASE_URL}${API_VERSION}/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}${API_VERSION}/auth/reset-password`,
};

export const USER_ENDPOINTS = {
  PROFILE: `${API_BASE_URL}${API_VERSION}/users/me`,
  UPDATE_PROFILE: `${API_BASE_URL}${API_VERSION}/users/me`,
  CHANGE_PASSWORD: `${API_BASE_URL}${API_VERSION}/users/me/change-password`,
  UPLOAD_IMAGE: `${API_BASE_URL}${API_VERSION}/users/me/profile-image`,
  NOTIFICATION_PREFERENCES: `${API_BASE_URL}${API_VERSION}/users/me/notification-preferences`,
};

export const PROPERTY_ENDPOINTS = {
  LIST: `${API_BASE_URL}${API_VERSION}/properties`,
  CREATE: `${API_BASE_URL}${API_VERSION}/properties`,
  DETAIL: (id: number) => `${API_BASE_URL}${API_VERSION}/properties/${id}`,
  UPDATE: (id: number) => `${API_BASE_URL}${API_VERSION}/properties/${id}`,
  DELETE: (id: number) => `${API_BASE_URL}${API_VERSION}/properties/${id}`,
  SEARCH: `${API_BASE_URL}${API_VERSION}/properties/search`,
  FEATURED: `${API_BASE_URL}${API_VERSION}/properties/featured`,
  MY_PROPERTIES: `${API_BASE_URL}${API_VERSION}/properties/my-properties`,
  UPLOAD_IMAGE: (id: number) => `${API_BASE_URL}${API_VERSION}/properties/${id}/images`,
  FAVORITE: (id: number) => `${API_BASE_URL}${API_VERSION}/properties/${id}/favorite`,
  UNFAVORITE: (id: number) => `${API_BASE_URL}${API_VERSION}/properties/${id}/unfavorite`,
  FAVORITES: `${API_BASE_URL}${API_VERSION}/properties/favorites`,
};

export const TOKEN_ENDPOINTS = {
  PACKAGES: `${API_BASE_URL}${API_VERSION}/tokens/packages`,
  PURCHASE: `${API_BASE_URL}${API_VERSION}/tokens/purchase`,
  BALANCE: `${API_BASE_URL}${API_VERSION}/tokens/balance`,
  HISTORY: `${API_BASE_URL}${API_VERSION}/tokens/history`,
};

export const VERIFICATION_ENDPOINTS = {
  REQUEST: `${API_BASE_URL}${API_VERSION}/verifications/request`,
  RESPOND: (id: number) => `${API_BASE_URL}${API_VERSION}/verifications/${id}/respond`,
  LIST: `${API_BASE_URL}${API_VERSION}/verifications`,
  DETAIL: (id: number) => `${API_BASE_URL}${API_VERSION}/verifications/${id}`,
  HISTORY: (propertyId: number) => `${API_BASE_URL}${API_VERSION}/verifications/property/${propertyId}/history`,
};

export const MESSAGE_ENDPOINTS = {
  CONVERSATIONS: `${API_BASE_URL}${API_VERSION}/messages/conversations`,
  MESSAGES: (conversationId: string) => `${API_BASE_URL}${API_VERSION}/messages/conversations/${conversationId}`,
  SEND: `${API_BASE_URL}${API_VERSION}/messages/send`,
  MARK_READ: (messageId: number) => `${API_BASE_URL}${API_VERSION}/messages/${messageId}/read`,
};

export const PAYMENT_ENDPOINTS = {
  MPESA_STK: `${API_BASE_URL}${API_VERSION}/payments/mpesa/stk-push`,
  MPESA_CALLBACK: `${API_BASE_URL}${API_VERSION}/payments/mpesa/callback`,
  TRANSACTION_STATUS: (transactionId: string) => `${API_BASE_URL}${API_VERSION}/payments/transactions/${transactionId}`,
  TRANSACTION_HISTORY: `${API_BASE_URL}${API_VERSION}/payments/transactions`,
};

export const SUBSCRIPTION_ENDPOINTS = {
  PLANS: `${API_BASE_URL}${API_VERSION}/subscriptions/plans`,
  SUBSCRIBE: `${API_BASE_URL}${API_VERSION}/subscriptions/subscribe`,
  CURRENT: `${API_BASE_URL}${API_VERSION}/subscriptions/current`,
  CANCEL: `${API_BASE_URL}${API_VERSION}/subscriptions/cancel`,
  HISTORY: `${API_BASE_URL}${API_VERSION}/subscriptions/history`,
};

export const ADMIN_ENDPOINTS = {
  USERS: `${API_BASE_URL}${API_VERSION}/admin/users`,
  USER_DETAIL: (id: number) => `${API_BASE_URL}${API_VERSION}/admin/users/${id}`,
  PROPERTIES: `${API_BASE_URL}${API_VERSION}/admin/properties`,
  VERIFICATIONS: `${API_BASE_URL}${API_VERSION}/admin/verifications`,
  ANALYTICS: `${API_BASE_URL}${API_VERSION}/admin/analytics`,
  TRANSACTIONS: `${API_BASE_URL}${API_VERSION}/admin/transactions`,
};