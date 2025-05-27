// File: frontend/src/api/properties.ts
// Clean properties API without debug code

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
  
  // If no images in response, try to detect images from filesystem
  if (response.data && (!response.data.images || response.data.images.length === 0)) {
    console.log("No images in API response, checking filesystem...");
    
    try {
      // Try to fetch images from a debug/filesystem endpoint
      const debugResponse = await fetch(`/api/debug/list-property-images/${propertyId}`);
      if (debugResponse.ok) {
        const debugData = await debugResponse.json();
        
        if (debugData.exists && debugData.files && debugData.files.length > 0) {
          console.log("Found images in filesystem:", debugData.files);
          
          // Create image objects from filesystem data
          const filesystemImages = debugData.files.map((file: any, index: number) => ({
            id: index + 1,
            property_id: propertyId,
            path: `properties/${propertyId}/${file.filename}`,
            is_primary: index === 0,
            uploaded_at: new Date(file.last_modified * 1000).toISOString()
          }));
          
          response.data.images = filesystemImages;
          console.log("Added filesystem images to property data");
        }
      }
    } catch (debugErr) {
      console.log("Could not fetch filesystem images:", debugErr.message);
    }
  }
  
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
  const formData = new FormData();
  
  // Append each file to the FormData with the field name 'images'
  files.forEach(file => {
    formData.append('images', file);
  });
  
  // Create a custom instance for this request
  const response = await axios.post(
    `${API_BASE_URL}/properties/${propertyId}/images`, 
    formData, 
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  
  return response.data;
};


export const updatePropertyStatus = async (token: string, propertyId: number, status: string) => {
  try {
    console.log(`Updating property ${propertyId} status to: ${status}`);
    
    const response = await axios.put(
      `${API_BASE_URL}/properties/${propertyId}/status?status=${encodeURIComponent(status)}`,
      {}, // Empty body since we're using query parameters
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('Property status updated successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating property status:', error);
    
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    
    throw error;
  }
};

export const addToFavorites = async (token: string, propertyId: number) => {
  const propertyApi = createPropertyApi(token);
  const response = await propertyApi.post(`/${propertyId}/favorite`);
  return response.data;
};

export const removeFromFavorites = async (token: string, propertyId: number) => {
  const propertyApi = createPropertyApi(token);
  const response = await propertyApi.delete(`/${propertyId}/favorite`);
  return response.data;
};

export const getFavoriteProperties = async (token: string) => {
  const propertyApi = createPropertyApi(token);
  const response = await propertyApi.get('/favorites');
  return response.data;
};

// Check if an image URL is accessible
export const checkImageUrl = async (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};