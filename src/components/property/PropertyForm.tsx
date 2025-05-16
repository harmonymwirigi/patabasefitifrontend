// File: frontend/src/components/property/PropertyForm.tsx
// Status: COMPLETE
// Dependencies: react, formik, yup, api/properties

import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { FileUploader } from '../common/FileUploader';
import { Alert } from '../common/Alert';

// Validation schema
const PropertySchema = Yup.object().shape({
  title: Yup.string()
    .min(5, 'Title is too short')
    .max(100, 'Title is too long')
    .required('Title is required'),
  description: Yup.string()
    .min(20, 'Description is too short')
    .max(1000, 'Description is too long')
    .required('Description is required'),
  property_type: Yup.string()
    .required('Property type is required'),
  rent_amount: Yup.number()
    .min(1, 'Rent must be greater than 0')
    .required('Rent amount is required'),
  bedrooms: Yup.number()
    .min(0, 'Bedrooms cannot be negative')
    .required('Number of bedrooms is required'),
  bathrooms: Yup.number()
    .min(0, 'Bathrooms cannot be negative')
    .required('Number of bathrooms is required'),
  size_sqm: Yup.number()
    .min(1, 'Size must be greater than 0')
    .nullable(),
  address: Yup.string()
    .required('Address is required'),
  neighborhood: Yup.string(),
  city: Yup.string()
    .required('City is required'),
  landmark: Yup.string(),
  amenities: Yup.array().of(Yup.string()),
});

// Form initial values
const initialValues = {
  title: '',
  description: '',
  property_type: 'apartment',
  rent_amount: '',
  bedrooms: '',
  bathrooms: '',
  size_sqm: '',
  address: '',
  neighborhood: '',
  city: 'nairobi',
  landmark: '',
  amenities: [],
};

// Property types
const propertyTypes = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'villa', label: 'Villa' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'studio', label: 'Studio' },
  { value: 'bedsitter', label: 'Bedsitter' },
  { value: 'single_room', label: 'Single Room' },
];

// Cities
const cities = [
  { value: 'nairobi', label: 'Nairobi' },
  { value: 'mombasa', label: 'Mombasa' },
  { value: 'kisumu', label: 'Kisumu' },
  { value: 'nakuru', label: 'Nakuru' },
  { value: 'eldoret', label: 'Eldoret' },
];

// Amenities
const amenityOptions = [
  { value: 'wifi', label: 'Wi-Fi' },
  { value: 'parking', label: 'Parking' },
  { value: 'security', label: 'Security' },
  { value: 'water', label: 'Water' },
  { value: 'gym', label: 'Gym' },
  { value: 'swimming_pool', label: 'Swimming Pool' },
  { value: 'furnished', label: 'Furnished' },
  { value: 'balcony', label: 'Balcony' },
];

interface PropertyFormProps {
  initialData?: any;
  onSubmit: (values: any, images: File[]) => Promise<void>;
  isSubmitting?: boolean;
  error?: string | null;
}

const PropertyForm: React.FC<PropertyFormProps> = ({
  initialData = null,
  onSubmit,
  isSubmitting = false,
  error = null,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Combine initial values with provided data
  const formInitialValues = initialData 
    ? { ...initialValues, ...initialData } 
    : initialValues;

  const handleFilesChange = (files: File[]) => {
    setUploadedFiles(files);
    setUploadError(null);
  };

  const handleFormSubmit = async (values: any) => {
    // Validate images for new property
    if (!initialData && uploadedFiles.length === 0) {
      setUploadError('Please upload at least one property image');
      return;
    }
    
    // Submit form
    await onSubmit(values, uploadedFiles);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {error && <Alert type="error" message={error} className="mb-6" />}
      
      <Formik
        initialValues={formInitialValues}
        validationSchema={PropertySchema}
        onSubmit={handleFormSubmit}
      >
        {({ values, setFieldValue, isSubmitting: formSubmitting }) => (
          <Form className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Property Title *
                </label>
                <Field
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g. Modern 2 Bedroom Apartment in Kilimani"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage name="title" component="div" className="mt-1 text-sm text-red-600" />
              </div>
              
              <div>
                <label htmlFor="property_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type *
                </label>
                <Field
                  as="select"
                  id="property_type"
                  name="property_type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {propertyTypes.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="property_type" component="div" className="mt-1 text-sm text-red-600" />
              </div>
              
              <div>
                <label htmlFor="rent_amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Rent (KES) *
                </label>
                <Field
                  id="rent_amount"
                  name="rent_amount"
                  type="number"
                  placeholder="e.g. 25000"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage name="rent_amount" component="div" className="mt-1 text-sm text-red-600" />
              </div>
              
              <div>
                <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrooms *
                </label>
                <Field
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage name="bedrooms" component="div" className="mt-1 text-sm text-red-600" />
              </div>
              
              <div>
                <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                  Bathrooms *
                </label>
                <Field
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage name="bathrooms" component="div" className="mt-1 text-sm text-red-600" />
              </div>
              
              <div>
                <label htmlFor="size_sqm" className="block text-sm font-medium text-gray-700 mb-1">
                  Size (Square Meters)
                </label>
                <Field
                  id="size_sqm"
                  name="size_sqm"
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage name="size_sqm" component="div" className="mt-1 text-sm text-red-600" />
              </div>
              
              <div className="col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <Field
                  as="textarea"
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Describe your property in detail..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
              </div>
              
              <div className="col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <Field
                  id="address"
                  name="address"
                  type="text"
                  placeholder="e.g. 123 Ngong Road"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage name="address" component="div" className="mt-1 text-sm text-red-600" />
              </div>
              
              <div>
                <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-1">
                  Neighborhood
                </label>
                <Field
                  id="neighborhood"
                  name="neighborhood"
                  type="text"
                  placeholder="e.g. Kilimani"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage name="neighborhood" component="div" className="mt-1 text-sm text-red-600" />
              </div>
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <Field
                  as="select"
                  id="city"
                  name="city"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {cities.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="city" component="div" className="mt-1 text-sm text-red-600" />
              </div>
              
              <div>
                <label htmlFor="landmark" className="block text-sm font-medium text-gray-700 mb-1">
                  Landmark
                </label>
                <Field
                  id="landmark"
                  name="landmark"
                  type="text"
                  placeholder="e.g. Near Junction Mall"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage name="landmark" component="div" className="mt-1 text-sm text-red-600" />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities
                </label>
                <FieldArray
                  name="amenities"
                  render={() => (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {amenityOptions.map(option => (
                        <div key={option.value} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`amenity-${option.value}`}
                            checked={values.amenities.includes(option.value)}
                            onChange={e => {
                              const checked = e.target.checked;
                              const amenities = [...values.amenities];
                              
                              if (checked) {
                                amenities.push(option.value);
                              } else {
                                const index = amenities.indexOf(option.value);
                                if (index >= 0) {
                                  amenities.splice(index, 1);
                                }
                              }
                              
                              setFieldValue('amenities', amenities);
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label 
                            htmlFor={`amenity-${option.value}`}
                            className="ml-2 block text-sm text-gray-700"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Images {!initialData && '*'}
                </label>
                <FileUploader
                  multiple
                  accept="image/*"
                  onFilesChange={handleFilesChange}
                  maxFiles={10}
                  maxSize={5 * 1024 * 1024} // 5MB
                />
                {uploadError && (
                  <div className="mt-1 text-sm text-red-600">{uploadError}</div>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Upload up to 10 images (max 5MB each). First image will be the main property image.
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={formSubmitting || isSubmitting}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
              >
                {formSubmitting || isSubmitting ? 'Saving...' : initialData ? 'Update Property' : 'Create Property'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default PropertyForm;