// File: frontend/src/components/auth/GoogleAuthButton.tsx

import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../hooks/useAuth';
import { googleAuth } from '../../api/auth';

interface GoogleAuthButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ onSuccess, onError }) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Enable debug mode in development
  const isDebugMode = process.env.NODE_ENV === 'development';
  
  useEffect(() => {
    // Setup Google One Tap debugging if in development mode
    if (isDebugMode && window.google && window.google.accounts) {
      window.google.accounts.id.debug = true;
      console.log("Google One Tap debug mode enabled");
    }
  }, [isDebugMode]);

const handleGoogleSuccess = async (response: any) => {
  if (!response.credential) {
    const errorMsg = 'Google authentication failed: No credential returned';
    console.error(errorMsg);
    if (onError) onError(errorMsg);
    return;
  }
  
  setIsLoading(true);
  
  // Log token info safely (only in development)
  if (isDebugMode) {
    console.log('Google auth response received');
    console.log('Credential length:', response.credential.length);
    console.log('First 10 chars:', response.credential.substring(0, 10) + '...');
    console.log('Last 10 chars:', '...' + response.credential.substring(response.credential.length - 10));
  }
  
  try {
    // Send token to backend
    console.log('Sending token to backend...');
    const authResponse = await googleAuth(response.credential);
    
    if (isDebugMode) {
      console.log('Backend response:', authResponse);
    }
    
    // Check if response is a token string or an object with access_token
    const accessToken = typeof authResponse === 'string' 
      ? authResponse 
      : authResponse?.access_token;
    
    if (accessToken) {
      // Login with token
      console.log('Access token received, logging in...');
      await login(accessToken);
      if (onSuccess) onSuccess();
    } else {
      const errorMsg = 'Google authentication failed: No access token received from server';
      console.error(errorMsg);
      setDebugInfo({ 
        error: 'No access token in response',
        response: authResponse 
      });
      if (onError) onError(errorMsg);
    }
  } catch (err: any) {
    console.error('Google auth error:', err);
    
    // Log detailed error information for debugging
    const errorDetails = {
      message: err.message,
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
    };
    
    console.error('Error details:', errorDetails);
    setDebugInfo(errorDetails);
    
    // Format a user-friendly error message
    let errorMsg = 'An error occurred during Google authentication.';
    if (err.response?.data?.detail) {
      errorMsg += ` ${err.response.data.detail}`;
    }
    
    if (onError) onError(errorMsg);
  } finally {
    setIsLoading(false);
  }
};
  const handleGoogleError = () => {
    const errorMsg = 'Google authentication failed. Please try again.';
    console.error(errorMsg);
    if (onError) onError(errorMsg);
  };

  return (
    <div className="w-full">
      <div className="flex justify-center my-4">
        {isLoading ? (
          <button
            disabled
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 opacity-70"
          >
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connecting...
          </button>
        ) : (
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            type="standard"
            theme="outline"
            shape="rectangular"
            text="continue_with"
            locale="en_US"
          />
        )}
      </div>
      
      {/* Debug information panel (only in development) */}
      {isDebugMode && debugInfo && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded text-sm text-left">
          <h4 className="font-semibold text-orange-800 mb-1">Debug Information</h4>
          <pre className="text-xs overflow-auto max-h-40">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default GoogleAuthButton;