// File: frontend/src/api/locations.ts
// Frontend service for location and geocoding APIs

import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

interface GeocodeRequest {
  address: string;
  city?: string;
  country?: string;
}

interface GeocodeResponse {
  success: boolean;
  latitude?: number;
  longitude?: number;
  formatted_address?: string;
  provider?: string;
  confidence?: number;
  error?: string;
}

interface ReverseGeocodeRequest {
  latitude: number;
  longitude: number;
}

interface ReverseGeocodeResponse {
  success: boolean;
  formatted_address?: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  county?: string;
  country?: string;
  provider?: string;
  error?: string;
}

interface NearbyPropertiesParams {
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
}

interface LocationSuggestion {
  success: boolean;
  query: string;
  suggestions: string[];
  total: number;
}

// Create axios instance with auth
const createLocationApi = (token?: string) => {
  return axios.create({
    baseURL: `${API_BASE_URL}/locations`,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};

export const geocodeAddress = async (
  token: string, 
  request: GeocodeRequest
): Promise<GeocodeResponse> => {
  const api = createLocationApi(token);
  const response = await api.post('/geocode', request);
  return response.data;
};

export const reverseGeocode = async (
  token: string, 
  request: ReverseGeocodeRequest
): Promise<ReverseGeocodeResponse> => {
  const api = createLocationApi(token);
  const response = await api.post('/reverse-geocode', request);
  return response.data;
};

export const getNearbyProperties = async (
  token: string, 
  params: NearbyPropertiesParams
) => {
  const api = createLocationApi(token);
  const response = await api.get('/nearby', { params });
  return response.data;
};

export const updatePropertyLocation = async (
  token: string,
  propertyId: number,
  data: {
    address?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    force_geocode?: boolean;
  }
) => {
  const api = createLocationApi(token);
  const response = await api.post(`/properties/${propertyId}/update-location`, data);
  return response.data;
};

export const validateCoordinates = async (
  latitude: number,
  longitude: number
) => {
  const api = createLocationApi();
  const response = await api.get('/validate-coordinates', {
    params: { latitude, longitude }
  });
  return response.data;
};

export const getLocationSuggestions = async (
  query: string,
  limit: number = 5,
  token?: string
): Promise<LocationSuggestion> => {
  const api = createLocationApi(token);
  const response = await api.get('/search-suggestions', {
    params: { query, limit }
  });
  return response.data;
};

// Admin functions
export const batchGeocodeProperties = async (
  token: string,
  limit: number = 100
) => {
  const api = createLocationApi(token);
  const response = await api.post('/admin/batch-geocode', null, {
    params: { limit }
  });
  return response.data;
};

// Utility functions
export const getCurrentLocation = (): Promise<{latitude: number, longitude: number}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000, // 10 minutes
      }
    );
  });
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

// Check if coordinates are within Kenya bounds
export const isInKenya = (latitude: number, longitude: number): boolean => {
  return (
    latitude >= -5.0 && latitude <= 5.0 &&
    longitude >= 33.5 && longitude <= 42.0
  );
};