// File: frontend/src/components/auth/GoogleAuthButton.tsx
// Updated to handle role selection for new users

import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../hooks/useAuth';
import { verifyGoogleToken, completeGoogleAuth, googleAuth } from '../../api/auth';
import RoleSelectionModal from './RoleSelectionModal';

interface GoogleAuthButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ onSuccess, onError }) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

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
      // First, verify the token and check if user exists
      console.log('Verifying Google token...');
      const verifyResponse = await verifyGoogleToken(response.credential);
      
      if (isDebugMode) {
        console.log('Verify response:', verifyResponse);
      }
      
      if (verifyResponse.user_exists) {
        // User exists, proceed with direct login
        console.log('User exists, logging in directly...');
        
        try {
          const accessToken = await googleAuth(response.credential);
          
          if (accessToken) {
            await login(accessToken);
            if (onSuccess) onSuccess();
          } else {
            const errorMsg = 'Login failed: No access token received';
            console.error(errorMsg);
            if (onError) onError(errorMsg);
          }
        } catch (loginError: any) {
          console.error('Direct login failed:', loginError);
          if (onError) onError('Login failed. Please try again.');
        }
      } else {
        // New user, show role selection modal
        console.log('New user detected, showing role selection...');
        setPendingToken(response.credential);
        setUserInfo(verifyResponse.user_info);
        setShowRoleModal(true);
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

  const handleRoleSelect = async (role: 'tenant' | 'owner') => {
    if (!pendingToken) {
      if (onError) onError('Authentication token not found. Please try again.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Completing Google auth with role:', role);
      const accessToken = await completeGoogleAuth(pendingToken, role);
      
      if (accessToken) {
        await login(accessToken);
        setShowRoleModal(false);
        setPendingToken(null);
        setUserInfo(null);
        if (onSuccess) onSuccess();
      } else {
        if (onError) onError('Registration failed: No access token received from server');
      }
    } catch (err: any) {
      console.error('Role selection completion error:', err);
      
      let errorMsg = 'Registration failed. Please try again.';
      if (err.response?.data?.detail) {
        errorMsg += ` ${err.response.data.detail}`;
      }
      
      if (onError) onError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleCancel = () => {
    setShowRoleModal(false);
    setPendingToken(null);
    setUserInfo(null);
    setIsLoading(false);
  };

  const handleGoogleError = () => {
    const errorMsg = 'Google authentication failed. Please try again.';
    console.error(errorMsg);
    if (onError) onError(errorMsg);
  };

  return (
    <div className="w-full">
      <div className="flex justify-center my-4">
        {isLoading && !showRoleModal ? (
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
      
      {/* Role Selection Modal */}
      {showRoleModal && userInfo && (
        <RoleSelectionModal
          isOpen={showRoleModal}
          userInfo={userInfo}
          onRoleSelect={handleRoleSelect}
          onCancel={handleRoleCancel}
          isLoading={isLoading}
        />
      )}
      
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