// File: frontend/src/pages/Properties/PropertyEdit.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropertyForm from '../../components/property/PropertyForm';
import { getProperty, updateProperty } from '../../api/properties';
import { useAuth } from '../../hooks/useAuth';

const PropertyEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProperty();
  }, [id, token]);

  const fetchProperty = async () => {
    if (!token || !id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getProperty(token, parseInt(id));
      setProperty(data);
    } catch (err: any) {
      console.error('Error fetching property:', err);
      setError(err?.response?.data?.detail || 'Failed to load property');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any, images: File[]) => {
    if (!token || !id) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await updateProperty(token, parseInt(id), values);
      navigate(`/properties/${id}`);
    } catch (err: any) {
      console.error('Error updating property:', err);
      setError(err?.response?.data?.detail || 'Failed to update property');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Property</h1>
      {property && (
        <PropertyForm 
          initialData={property}
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting}
          error={error}
        />
      )}
    </div>
  );
};

export default PropertyEdit;