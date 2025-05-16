// File: frontend/src/components/auth/GoogleOneTap.tsx
// This is the core component for Google One Tap integration

import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { googleAuth } from '../../api/auth';

interface GoogleOneTapProps {
  autoPrompt?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          disableAutoSelect: () => void;
          cancel: () => void;
        };
      };
    };
  }
}

const GoogleOneTap: React.FC<GoogleOneTapProps> = ({ 
  autoPrompt = true,
  onSuccess,
  onError
}) => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const googleScriptLoaded = useRef(false);

  useEffect(() => {
    // Skip if user is already authenticated or script has been loaded
    if (isAuthenticated || googleScriptLoaded.current) {
      return;
    }

    // Check if Google One Tap should be disabled
    const dontShowPrompt = localStorage.getItem('dontShowGooglePrompt') === 'true';
    
    if (dontShowPrompt && autoPrompt) {
      return;
    }

    // Function to initialize Google One Tap
    const initializeGoogleOneTap = () => {
      if (!window.google || !window.google.accounts || !window.google.accounts.id) {
        console.error('Google Identity Services not loaded properly');
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: autoPrompt,
          cancel_on_tap_outside: true,
          context: 'signin' // or 'signup' or 'use'
        });

        // Only show prompt automatically if autoPrompt is true
        if (autoPrompt) {
          window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              // One Tap isn't displayed for some reason
              console.log('One Tap not displayed:', notification.getNotDisplayedReason());
            } else if (notification.isDismissedMoment()) {
              // User dismissed the prompt
              console.log('One Tap dismissed:', notification.getDismissedReason());
            }
          });
        }
      } catch (error) {
        console.error('Error initializing Google One Tap:', error);
        if (onError) onError('Failed to initialize Google authentication');
      }
    };

    // Load Google Identity Services script
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        googleScriptLoaded.current = true;
        initializeGoogleOneTap();
      };
      script.onerror = () => {
        console.error('Failed to load Google Identity Services');
        if (onError) onError('Failed to load Google authentication services');
      };
      document.body.appendChild(script);
    };

    loadGoogleScript();

    // Cleanup
    return () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.cancel();
      }
    };
  }, [isAuthenticated, autoPrompt, onError]);

  const handleCredentialResponse = async (response: any) => {
    if (!response.credential) {
      console.error('No credential received from Google');
      if (onError) onError('Authentication failed. Please try again.');
      return;
    }

    try {
      // Send the credential token to your backend
      const token = await googleAuth(response.credential);
      
      if (token) {
        // Store the token and update auth context
        await login(token);
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        } else {
          // Default behavior: redirect to dashboard
          navigate('/dashboard');
        }
      } else {
        console.error('No access token received from server');
        if (onError) onError('Authentication failed on server. Please try again.');
      }
    } catch (error) {
      console.error('Google auth error:', error);
      if (onError) onError('An error occurred during authentication. Please try again.');
    }
  };

  // This component doesn't render anything visible
  return null;
};

export default GoogleOneTap;