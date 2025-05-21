// frontend/src/api/properties.ts
// Updated version with improved image handling

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
  console.log("API Response - getAllProperties:", response.data);
  return response.data;
};

export const getProperty = async (token: string, propertyId: number) => {
  const propertyApi = createPropertyApi(token);
  try {
    const response = await propertyApi.get(`/${propertyId}`);
    console.log("API Response - getProperty:", response.data);
    
    // Check if API response is valid but has no images
    if (response.data && (!response.data.images || response.data.images.length === 0)) {
      console.log("Property has no images in API response, trying debug endpoint...");
      
      // Try to fetch images directly from the debug endpoint
      try {
        const debugResponse = await fetch(`/api/debug/list-property-images/${propertyId}`);
        const debugData = await debugResponse.json();
        
        if (debugData.exists && debugData.files && debugData.files.length > 0) {
          console.log("Found images through debug endpoint:", debugData.files);
          
          // Create synthetic image objects from debug data
          const syntheticImages = debugData.files.map((file, index) => ({
            id: index + 1,
            property_id: propertyId,
            path: `properties/${propertyId}/${file.filename}`,
            is_primary: index === 0,
            uploaded_at: new Date(file.last_modified * 1000).toISOString()
          }));
          
          // Add these images to the property data
          response.data.images = syntheticImages;
          console.log("Added synthetic images to property:", syntheticImages);
        }
      } catch (debugErr) {
        console.error("Error fetching debug images:", debugErr);
      }
    }
    
    return response.data;
  } catch (error) {
    console.error("API Error - getProperty:", error);
    throw error;
  }
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
  try {
    const response = await propertyApi.post('/search', searchParams);
    console.log("API Response - searchProperties:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error - searchProperties:", error);
    throw error;
  }
};

export const getFeaturedProperties = async () => {
  const propertyApi = createPropertyApi();
  const response = await propertyApi.get('/featured/list');
  return response.data;
};

export const uploadPropertyImages = async (token: string, propertyId: number, files: File[]) => {
  const formData = new FormData();
  console.log(`Preparing to upload ${files.length} files for property ${propertyId}`);
  
  // Append each file to the FormData with the field name 'images'
  files.forEach(file => {
    formData.append('images', file);
    console.log(`Added file to upload: ${file.name} (${file.size} bytes)`);
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
  
  console.log('Image upload response:', response.data);
  return response.data;
};

export const updatePropertyStatus = async (token: string, propertyId: number, status: string) => {
  const propertyApi = createPropertyApi(token);
  const response = await propertyApi.put(`/${propertyId}/status?status=${status}`, {});
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