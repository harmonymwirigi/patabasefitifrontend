// File: frontend/src/components/property/VerificationPrompt.tsx
// Status: COMPLETE
// Dependencies: react, api/verifications

import React, { useState } from 'react';
import { respondToVerification } from '../../api/verifications';
import { useAuth } from '../../hooks/useAuth';
import { Alert } from '../common/Alert';

interface VerificationPromptProps {
  verificationId: number;
  propertyId: number;
  propertyTitle: string;
  onComplete: () => void;
}

const VerificationPrompt: React.FC<VerificationPromptProps> = ({
  verificationId,
  propertyId,
  propertyTitle,
  onComplete,
}) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleResponse = async (response: 'yes' | 'no') => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await respondToVerification(token, verificationId, response);
      
      setSuccess(
        response === 'yes'
          ? 'Thank you for confirming your property is still available.'
          : 'Thank you for updating your property status. We have marked it as rented/sold.'
      );
      
      // Notify parent component
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (err: any) {
      console.error('Verification response error:', err);
      
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to process your response. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {error && <Alert type="error" message={error} className="mb-4" />}
      {success && <Alert type="success" message={success} className="mb-4" />}
      
      <div className="text-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        
        <h2 className="mt-4 text-xl font-bold text-gray-900">Verify Property Status</h2>
        
        <p className="mt-2 text-gray-600">
          Is your property <span className="font-semibold">"{propertyTitle}"</span> still available for rent?
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <button
          onClick={() => handleResponse('yes')}
          disabled={loading}
          className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          {loading ? 'Processing...' : 'Yes, Still Available'}
        </button>
        
        <button
          onClick={() => handleResponse('no')}
          disabled={loading}
          className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          {loading ? 'Processing...' : 'No, Already Rented/Sold'}
        </button>
      </div>
      
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>
          Responding helps keep our listings accurate and earns you token rewards.
        </p>
      </div>
    </div>
  );
};

export default VerificationPrompt;