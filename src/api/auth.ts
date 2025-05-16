// File: frontend/src/api/auth.ts
// Updated to handle the correct response structure

import axios from 'axios';
import { AUTH_ENDPOINTS } from '../config/endpoints';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role: string;
  phone_number?: string;
}

// For login form
export const login = async (credentials: LoginCredentials): Promise<string> => {
  console.log('🔍 Login request:', credentials.email);
  try {
    // For FastAPI OAuth2 password flow, convert to form data
    const formData = new URLSearchParams();
    formData.append('username', credentials.email); // FastAPI expects 'username'
    formData.append('password', credentials.password);
    
    // Use x-www-form-urlencoded format for OAuth2 password flow
    const response = await axios.post(AUTH_ENDPOINTS.LOGIN, 
      formData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    console.log('✅ Login response structure:', response.data);
    
    // Extract token based on response structure
    if (response.data.token && response.data.token.access_token) {
      return response.data.token.access_token;
    } else if (response.data.access_token) {
      return response.data.access_token;
    } else {
      throw new Error('Invalid token structure in response');
    }
  } catch (error: any) {
    console.error('❌ Login error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: error.config
    });
    throw error;
  }
};

// For RegisterForm
export const loginUser = async (email: string, password: string) => {
  console.log('🔍 loginUser request for:', email);
  try {
    // For FastAPI OAuth2 password flow, convert to form data
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await axios.post(AUTH_ENDPOINTS.LOGIN, 
      formData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    console.log('✅ loginUser response structure:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ loginUser error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

export const registerUser = async (userData: RegisterData) => {
  console.log('🔍 registerUser request:', userData);
  try {
    const response = await axios.post(AUTH_ENDPOINTS.REGISTER, userData);
    console.log('✅ registerUser response structure:', response.data);
    return response.data.user || response.data;
  } catch (error: any) {
    console.error('❌ registerUser error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

export const register = async (userData: RegisterData): Promise<string> => {
  console.log('🔍 register request:', userData);
  try {
    const response = await axios.post(AUTH_ENDPOINTS.REGISTER, userData);
    console.log('✅ register response structure:', response.data);
    
    // Extract token based on response structure
    if (response.data.token && response.data.token.access_token) {
      return response.data.token.access_token;
    } else if (response.data.access_token) {
      return response.data.access_token;
    } else {
      throw new Error('Invalid token structure in response');
    }
  } catch (error) {
    console.error('❌ register error:', error);
    throw error;
  }
};


export const googleAuth = async (token: string) => {
  console.log('🔍 googleAuth request with token');
  try {
    const response = await axios.post(AUTH_ENDPOINTS.GOOGLE_AUTH, { token });
    console.log('✅ googleAuth response structure:', response.data);
    
    // Check if the response is already a string (JWT token)
    if (typeof response.data === 'string') {
      return response.data;
    }
    
    // Extract token based on response structure
    if (response.data.access_token) {
      return response.data.access_token;
    } else if (response.data.token && response.data.token.access_token) {
      return response.data.token.access_token;
    } else {
      console.error('Unexpected response format:', response.data);
      throw new Error('Invalid token structure in response');
    }
  } catch (error) {
    console.error('❌ googleAuth error:', error);
    throw error;
  }
};

export const refreshToken = async (refreshToken: string): Promise<string> => {
  try {
    const response = await axios.post(AUTH_ENDPOINTS.REFRESH_TOKEN, { refresh_token: refreshToken });
    
    // Extract token based on response structure
    if (response.data.token && response.data.token.access_token) {
      return response.data.token.access_token;
    } else if (response.data.access_token) {
      return response.data.access_token;
    } else {
      throw new Error('Invalid token structure in response');
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};

export const logout = async (token: string): Promise<void> => {
  try {
    await axios.post(
      AUTH_ENDPOINTS.LOGOUT, 
      {}, 
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};