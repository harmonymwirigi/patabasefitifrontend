// File: frontend/src/components/auth/GoogleAuthModal.tsx
// This is the modal component that displays Google authentication options

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import GoogleOneTap from './GoogleOneTap';
import { GoogleLogin } from '@react-oauth/google';
import { googleAuth } from '../../api/auth';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoPrompt?: boolean;
}

const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ 
  isOpen, 
  onClose,
  autoPrompt = false
}) => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAutoPrompt, setShowAutoPrompt] = useState(autoPrompt);

  useEffect(() => {
    // Check if Google session is available
    if (autoPrompt && !isAuthenticated && isOpen) {
      setShowAutoPrompt(true);
    } else {
      setShowAutoPrompt(false);
    }
  }, [autoPrompt, isAuthenticated, isOpen]);

  // Don't show modal if user is already authenticated
  if (isAuthenticated) {
    return null;
  }

  const handleGoogleSuccess = async (response: any) => {
    if (!response.credential) {
      setError('Google authentication failed. Please try again.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Send token to backend
      const token = await googleAuth(response.credential);
      
      if (token) {
        // Login with token
        await login(token);
        onClose();
        navigate('/dashboard');
      } else {
        setError('Authentication failed on server. Please try again.');
      }
    } catch (err) {
      console.error('Google auth error:', err);
      setError('An error occurred during authentication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google authentication failed. Please try again.');
  };

  const handleDontShowAgain = () => {
    // Set localStorage flag to not show auto prompt again
    localStorage.setItem('dontShowGooglePrompt', 'true');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-y-auto z-50">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        {/* Modal content */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {showAutoPrompt ? 'Sign in with Google' : 'Welcome to PataBaseFiti'}
                </h3>
                
                {error && (
                  <div className="mb-4 p-2 bg-red-50 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div className="mt-2">
                  {showAutoPrompt ? (
                    <>
                      <p className="text-sm text-gray-500 mb-4">
                        Continue with your Google account for a faster experience
                      </p>
                      
                      <div className="flex justify-center my-6">
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="ml-2">Authenticating...</span>
                          </div>
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
                      
                      <div className="flex justify-between mt-6 text-sm">
                        <button 
                          onClick={handleDontShowAgain}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          Don't show again
                        </button>
                        <button 
                          onClick={onClose}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          Not now
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500 mb-6">
                        Sign in to access exclusive property listings and features
                      </p>
                      
                      <div className="flex justify-center my-6">
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="ml-2">Authenticating...</span>
                          </div>
                        ) : (
                          <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            useOneTap={false}
                            type="standard"
                            theme="outline"
                            shape="rectangular"
                            text="signin_with"
                            locale="en_US"
                          />
                        )}
                      </div>
                      
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">or</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <button 
                          onClick={() => {
                            onClose();
                            navigate('/login');
                          }}
                          className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                          Sign in with Email
                        </button>
                        
                        <button 
                          onClick={() => {
                            onClose();
                            navigate('/register');
                          }}
                          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                        >
                          Create an Account
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthModal;