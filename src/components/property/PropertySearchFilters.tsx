// File: frontend/src/components/property/PropertySearchFilters.tsx
// Status: COMPLETE
// Dependencies: react, formik, yup

import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// Validation schema
const SearchFilterSchema = Yup.object().shape({
  property_type: Yup.string().nullable(),
  min_price: Yup.number().nullable().min(0, 'Minimum price cannot be negative'),
  max_price: Yup.number().nullable().min(0, 'Maximum price cannot be negative'),
  bedrooms: Yup.number().nullable().min(0, 'Bedrooms cannot be negative'),
  city: Yup.string().nullable(),
  keyword: Yup.string().nullable(),
});

interface SearchFiltersProps {
  onSearch: (filters: any) => void;
  initialValues?: any;
}

const PropertySearchFilters: React.FC<SearchFiltersProps> = ({
  onSearch,
  initialValues = {},
}) => {
  const [expanded, setExpanded] = useState(false);
  
  // Default filter values
  const defaultValues = {
    property_type: '',
    min_price: '',
    max_price: '',
    bedrooms: '',
    city: '',
    keyword: '',
    amenities: [],
    ...initialValues,
  };
  
  // Available amenities
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
  
  // Available property types
  const propertyTypes = [
    { value: '', label: 'All Types' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'villa', label: 'Villa' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'studio', label: 'Studio' },
    { value: 'bedsitter', label: 'Bedsitter' },
    { value: 'single_room', label: 'Single Room' },
  ];
  
  // Available cities
  const cities = [
    { value: '', label: 'All Cities' },
    { value: 'nairobi', label: 'Nairobi' },
    { value: 'mombasa', label: 'Mombasa' },
    { value: 'kisumu', label: 'Kisumu' },
    { value: 'nakuru', label: 'Nakuru' },
    { value: 'eldoret', label: 'Eldoret' },
  ];
  
  const handleSubmit = (values: any) => {
    // Format values for API
    const filters = { ...values };
    
    // Convert empty strings to null
    Object.keys(filters).forEach(key => {
      if (filters[key] === '') {
        filters[key] = null;
      }
    });
    
    // Remove amenities if empty
    if (filters.amenities && filters.amenities.length === 0) {
      delete filters.amenities;
    }
    
    onSearch(filters);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <Formik
        initialValues={defaultValues}
        validationSchema={SearchFilterSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, isSubmitting, resetForm }) => (
          <Form>
            <div className="flex flex-wrap -mx-2">
              {/* Keyword search */}
              <div className="w-full px-2 mb-4">
                <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <Field
                  id="keyword"
                  name="keyword"
                  type="text"
                  placeholder="Search for properties..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Basic filters (always visible) */}
              <div className="w-full md:w-1/3 px-2 mb-4">
                <label htmlFor="property_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type
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
              </div>
              
              <div className="w-full md:w-1/3 px-2 mb-4">
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
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
              </div>
              
              <div className="w-full md:w-1/3 px-2 mb-4">
                <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrooms
                </label>
                <Field
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  placeholder="Any"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage name="bedrooms" component="div" className="mt-1 text-sm text-red-600" />
              </div>
              
              {/* Advanced filters (expandable) */}
              {expanded && (
                <>
                  <div className="w-full md:w-1/2 px-2 mb-4">
                    <label htmlFor="min_price" className="block text-sm font-medium text-gray-700 mb-1">
                      Min Price (KES)
                    </label>
                    <Field
                      id="min_price"
                      name="min_price"
                      type="number"
                      placeholder="Minimum"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <ErrorMessage name="min_price" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                  
                  <div className="w-full md:w-1/2 px-2 mb-4">
                    <label htmlFor="max_price" className="block text-sm font-medium text-gray-700 mb-1">
                      Max Price (KES)
                    </label>
                    <Field
                      id="max_price"
                      name="max_price"
                      type="number"
                      placeholder="Maximum"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <ErrorMessage name="max_price" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                  
                  <div className="w-full px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amenities
                    </label>
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
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none"
              >
                {expanded ? 'Less Filters' : 'More Filters'}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 inline ml-1 transform ${expanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    onSearch({});
                  }}
                  className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 font-medium focus:outline-none"
                >
                  Reset
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Searching...
                    </span>
                  ) : (
                    'Search Properties'
                  )}
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default PropertySearchFilters;