// File: frontend/src/pages/Properties/PropertyCreate.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyForm from '../../components/property/PropertyForm';
import { createProperty } from '../../api/properties';
import { useAuth } from '../../hooks/useAuth';

const PropertyCreate: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: any, images: File[]) => {
    if (!token) {
      setError("Authentication required. Please log in.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log("Submitting property data:", values);
      
      // Transform single_room to room if needed
      if (values.property_type === 'single_room') {
        values.property_type = 'room';
      }
      
      // Make sure all required fields are valid
      const requiredFields = ['title', 'property_type', 'rent_amount', 'bedrooms', 'bathrooms', 'address', 'city'];
      for (const field of requiredFields) {
        if (!values[field]) {
          setError(`${field} is required`);
          setIsSubmitting(false);
          return;
        }
      }
      
      // Create property
      const property = await createProperty(token, values);
      
      // Handle images if needed (as a separate step)
      if (images.length > 0) {
        try {
          // Upload images for the new property
          // Note: You'll need to implement this function
          // await uploadPropertyImages(token, property.id, images);
        } catch (imageError) {
          console.error('Error uploading images:', imageError);
          // Continue even if image upload fails
        }
      }
      
      // Navigate to property detail page
      navigate(`/properties/${property.id}`);
    } catch (err: any) {
      console.error('Error creating property:', err);
      
      // Extract validation error messages
      if (err.response?.status === 422 && err.response?.data?.detail) {
        // Handle validation errors from FastAPI
        const validationErrors = err.response.data.detail;
        if (Array.isArray(validationErrors)) {
          // Format validation errors nicely
          const errorMessage = validationErrors.map((error: any) => {
            return `${error.loc[1]}: ${error.msg}`;
          }).join(', ');
          setError(errorMessage || 'Validation error');
        } else {
          // If it's not an array, just show whatever we got
          setError(typeof validationErrors === 'string' 
            ? validationErrors 
            : 'Invalid property data. Please check your inputs.');
        }
      } else {
        setError(err.response?.data?.detail || 'Failed to create property');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Property</h1>
      <PropertyForm 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting}
        error={error}
      />
    </div>
  );
};

export default PropertyCreate;