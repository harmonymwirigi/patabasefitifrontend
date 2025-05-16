// File: frontend/src/pages/Auth/Profile.tsx
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { updateUserProfile, uploadProfileImage } from '../../api/users';
import { Alert } from '../../components/common/Alert';

const Profile: React.FC = () => {
  const { user, token, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone_number: user?.phone_number || '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Update profile data
      const updateData: any = {
        full_name: formData.full_name,
        phone_number: formData.phone_number
      };
      
      // Add password if changing
      if (formData.current_password && formData.new_password) {
        if (formData.new_password !== formData.confirm_password) {
          setError('New passwords do not match');
          setIsSubmitting(false);
          return;
        }
        
        updateData.current_password = formData.current_password;
        updateData.password = formData.new_password;
      }
      
      const updatedUser = await updateUserProfile(token, updateData);
      
      // Upload profile image if selected
      if (imageFile) {
        const imageResult = await uploadProfileImage(token, imageFile);
        if (imageResult.profile_image) {
          updatedUser.profile_image = imageResult.profile_image;
        }
      }
      
      // Update local user data
      updateUser(updatedUser);
      
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err?.response?.data?.detail || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h1>
      
      {error && <Alert type="error" message={error} className="mb-4" />}
      {success && <Alert type="success" message={success} className="mb-4" />}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                {user?.profile_image ? (
                  <img
                    src={`/uploads/${user.profile_image}`}
                    alt={user.full_name}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-blue-200 flex items-center justify-center">
                    <span className="text-blue-600 text-2xl font-medium">
                      {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Profile Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="text"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
              
              <div className="mt-4">
                <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  type="password"
                  id="current_password"
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="mt-4">
                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  id="new_password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="mt-4">
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="pt-5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;