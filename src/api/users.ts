// frontend/src/api/users.ts
// Complete users API with all functions
import axios from 'axios';
import { USER_ENDPOINTS } from '../config/endpoints';
import { API_BASE_URL } from '../config/constants';

interface UpdateProfileData {
  full_name?: string;
  phone_number?: string;
  password?: string;
  current_password?: string;
  notification_preferences?: any;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  profile_image?: string;
  phone_number?: string;
  account_status: string;
  created_at: string;
  last_login?: string;
}

// Create axios instance with auth interceptor
const createUsersApi = (token: string) => {
  const usersApi = axios.create({
    baseURL: `${API_BASE_URL}/users`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  
  return usersApi;
};

// Search users by name or email
export const searchUsers = async (token: string, query: string): Promise<User[]> => {
  try {
    const usersApi = createUsersApi(token);
    const response = await usersApi.get(`/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error: any) {
    console.error('Error searching users:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (token: string): Promise<any> => {
  try {
    const response = await axios.get(
      USER_ENDPOINTS.PROFILE,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    console.log('User profile response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (token: string, userData: UpdateProfileData): Promise<any> => {
  try {
    console.log('Updating profile with data:', userData);
    const response = await axios.put(
      USER_ENDPOINTS.UPDATE_PROFILE,
      userData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Update profile response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Change password
export const changePassword = async (token: string, 
  passwordData: { current_password: string, new_password: string }
): Promise<void> => {
  try {
    await axios.put(
      USER_ENDPOINTS.CHANGE_PASSWORD,
      passwordData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Upload profile image
export const uploadProfileImage = async (token: string, file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('profile_image', file);
    
    console.log('Uploading profile image');
    const response = await axios.post(
      USER_ENDPOINTS.UPDATE_PROFILE + '/profile-image',
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    console.log('Profile image upload response:', response.data);
    return response.data.profile_image;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

// Get users by role
export const getUsersByRole = async (token: string, role: string): Promise<User[]> => {
  try {
    const usersApi = createUsersApi(token);
    const response = await usersApi.get(`/by-role/${role}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching users by role:', error);
    throw error;
  }
};