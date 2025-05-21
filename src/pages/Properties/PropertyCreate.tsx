// File: frontend/src/pages/Properties/PropertyCreate.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyForm from '../../components/property/PropertyForm';
import { createProperty, uploadPropertyImages } from '../../api/properties';
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
      console.log("Images to upload:", images);
      
      // Make sure all required fields are valid
      const requiredFields = ['title', 'property_type', 'rent_amount', 'bedrooms', 'bathrooms', 'address', 'city'];
      for (const field of requiredFields) {
        if (!values[field] && values[field] !== 0) {
          setError(`${field} is required`);
          setIsSubmitting(false);
          return;
        }
      }
      
      // Create property
      const property = await createProperty(token, values);
      console.log("Property created successfully:", property);
      
      // Upload images if available
      if (images.length > 0) {
        try {
          console.log(`Uploading ${images.length} images for property ID ${property.id}`);
          
          // Use a timeout to ensure the property is fully created in the database
          setTimeout(async () => {
            try {
              const uploadedImages = await uploadPropertyImages(token, property.id, images);
              console.log("Images uploaded successfully:", uploadedImages);
              
              // Navigate to property detail page after successful image upload
              navigate(`/properties/${property.id}`);
            } catch (uploadError: any) {
              console.error('Error uploading images during timeout:', uploadError);
              setError('Property created but image upload failed. You can add images later.');
              navigate(`/properties/${property.id}`);
            }
          }, 1000);
        } catch (imageError: any) {
          console.error('Error uploading images:', imageError);
          setError('Property created but image upload failed. You can add images later.');
          // Continue anyway since the property was created
          navigate(`/properties/${property.id}`);
        }
      } else {
        // Navigate immediately if no images to upload
        navigate(`/properties/${property.id}`);
      }
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