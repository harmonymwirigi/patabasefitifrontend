// File: frontend/src/config/constants.ts
// Updated with correct environment variables

// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Google OAuth client ID
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '252866098116-jhp7iuhnodp5c3jtsf89g7en80oonu5a.apps.googleusercontent.com';

// Map configuration
export const MAPS_API_KEY = import.meta.env.VITE_MAPS_API_KEY || '';

// Default pagination limits
export const DEFAULT_PAGE_SIZE = 12;

// Token costs
export const TOKEN_COST_SEARCH = 1;
export const TOKEN_COST_CONTACT = 2;

// Property types
export const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'villa', label: 'Villa' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'studio', label: 'Studio' },
  { value: 'bedsitter', label: 'Bedsitter' },
  { value: 'single_room', label: 'Single Room' },
];

// Cities
export const CITIES = [
  { value: 'nairobi', label: 'Nairobi' },
  { value: 'mombasa', label: 'Mombasa' },
  { value: 'kisumu', label: 'Kisumu' },
  { value: 'nakuru', label: 'Nakuru' },
  { value: 'eldoret', label: 'Eldoret' },
];

// Amenities
export const AMENITIES = [
  { value: 'wifi', label: 'Wi-Fi' },
  { value: 'parking', label: 'Parking' },
  { value: 'security', label: 'Security' },
  { value: 'water', label: 'Water' },
  { value: 'gym', label: 'Gym' },
  { value: 'swimming_pool', label: 'Swimming Pool' },
  { value: 'furnished', label: 'Furnished' },
  { value: 'balcony', label: 'Balcony' },
  { value: 'garden', label: 'Garden' },
  { value: 'elevator', label: 'Elevator' },
  { value: 'backup_generator', label: 'Backup Generator' },
  { value: 'cctv', label: 'CCTV' },
];

// User roles
export const USER_ROLES = [
  { value: 'tenant', label: 'Tenant' },
  { value: 'owner', label: 'Property Owner' },
  { value: 'admin', label: 'Administrator' },
];

// Property verification statuses
export const VERIFICATION_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'verified', label: 'Verified', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'expired', label: 'Expired', color: 'gray' },
];

// Property availability statuses
export const AVAILABILITY_STATUSES = [
  { value: 'available', label: 'Available', color: 'green' },
  { value: 'rented', label: 'Rented', color: 'red' },
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'sold', label: 'Sold', color: 'purple' },
  { value: 'inactive', label: 'Inactive', color: 'gray' },
];

// Transaction types
export const TRANSACTION_TYPES = [
  { value: 'token_purchase', label: 'Token Purchase' },
  { value: 'search_deduction', label: 'Search Deduction' },
  { value: 'contact_deduction', label: 'Contact Deduction' },
  { value: 'reward', label: 'Reward' },
  { value: 'subscription', label: 'Subscription' },
];

// App routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  PROPERTIES: '/properties',
  PROPERTY_DETAIL: (id: string | number) => `/properties/${id}`,
  PROPERTY_CREATE: '/properties/create',
  PROPERTY_EDIT: (id: string | number) => `/properties/${id}/edit`,
  MY_PROPERTIES: '/my-properties',
  TOKENS: '/tokens',
  TOKEN_CHECKOUT: (packageId: string | number) => `/tokens/checkout/${packageId}`,
  MESSAGES: '/messages',
  CONVERSATION: (id: string | number) => `/messages/${id}`,
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
};