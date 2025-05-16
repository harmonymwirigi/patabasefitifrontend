// File: frontend/src/components/token/TokenPurchaseModal.tsx
// Status: COMPLETE
// Dependencies: react, api/tokens, formik, yup

import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { getTokenPackages, purchaseTokens } from '../../api/tokens';
import { useAuth } from '../../hooks/useAuth';
import { Modal } from '../common/Modal';
import { Alert } from '../common/Alert';

// Validation schema
const PurchaseSchema = Yup.object().shape({
  package_id: Yup.number().required('Please select a token package'),
  phone_number: Yup.string()
    .matches(/^(\+254|0)[17]\d{8}$/, 'Please enter a valid Kenyan phone number')
    .required('Phone number is required'),
});

interface TokenPackage {
  id: number;
  name: string;
  token_count: number;
  price: number;
  currency: string;
  description?: string;
}

interface TokenPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const TokenPurchaseModal: React.FC<TokenPurchaseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { token, user, updateUser } = useAuth();
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  useEffect(() => {
    // Reset state on open
    if (isOpen) {
      setError(null);
      setSuccess(null);
      fetchPackages();
    }
  }, [isOpen]);

  const fetchPackages = async () => {
    setLoading(true);
    
    try {
      const data = await getTokenPackages();
      setPackages(data);
    } catch (err) {
      console.error('Error fetching token packages:', err);
      setError('Failed to load token packages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: { package_id: number; phone_number: string }) => {
    if (!token) return;
    
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    try {
      const result = await purchaseTokens(token, values.package_id, values.phone_number);
      
      setSuccess(
        'Payment request sent successfully! Please check your phone to complete the M-Pesa payment.'
      );
      
      // Update user token balance if available in response
      if (result.new_balance !== undefined && user) {
        updateUser({ token_balance: result.new_balance });
      }
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 3000);
      }
    } catch (err: any) {
      console.error('Token purchase error:', err);
      
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to process payment. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatPrice = (amount: number, currency: string = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Purchase Tokens">
      <div className="p-4">
        {error && <Alert type="error" message={error} className="mb-4" />}
        {success && <Alert type="success" message={success} className="mb-4" />}
        
        {loading && !packages.length ? (
          <div className="py-8 text-center">
            <svg className="animate-spin mx-auto h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-gray-600">Loading packages...</p>
          </div>
        ) : (
          <Formik
            initialValues={{
              package_id: 0,
              phone_number: user?.phone_number || '',
            }}
            validationSchema={PurchaseSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Token Package
                  </label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {packages.map((pkg) => (
                      <label
                        key={pkg.id}
                        className="relative border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <Field
                          type="radio"
                          name="package_id"
                          value={pkg.id}
                          className="absolute h-4 w-4 top-4 right-4"
                        />
                        <div className="pr-6">
                          <h3 className="font-medium text-gray-900">{pkg.name}</h3>
                          <p className="mt-1 text-sm text-gray-500">{pkg.description}</p>
                          <div className="mt-2 flex justify-between items-center">
                            <span className="text-blue-600 font-bold">
                              {pkg.token_count} Tokens
                            </span>
                            <span className="text-gray-900">
                              {formatPrice(pkg.price, pkg.currency)}
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <ErrorMessage name="package_id" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                
                <div>
                  <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                    M-Pesa Phone Number
                  </label>
                  <Field
                    id="phone_number"
                    name="phone_number"
                    type="text"
                    placeholder="07XXXXXXXX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter the phone number that will receive the M-Pesa payment request
                  </p>
                  <ErrorMessage name="phone_number" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                  >
                    {isSubmitting || loading ? 'Processing...' : 'Pay with M-Pesa'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </Modal>
  );
};

export default TokenPurchaseModal;