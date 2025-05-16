// File: frontend/src/api/users.ts
// Updated to handle authentication correctly

import axios from 'axios';
import { USER_ENDPOINTS } from '../config/endpoints';

interface UpdateProfileData {
  full_name?: string;
  phone_number?: string;
  password?: string;
  current_password?: string;
  notification_preferences?: any;
}

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