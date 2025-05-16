// File: frontend/src/components/home/HeroSection.tsx
// Updated with Google authentication modal integration

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import GoogleAuthModal from '../auth/GoogleAuthModal';

interface HeroSectionProps {
  onGetStarted?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [shouldAutoPrompt, setShouldAutoPrompt] = useState(false);

  // Check if we should auto-prompt for Google auth when the component mounts
  useEffect(() => {
    // Only auto-prompt if user is not authenticated and hasn't opted out
    if (!isAuthenticated && !localStorage.getItem('dontShowGooglePrompt')) {
      // Check if this is a returning visitor (has viewed the site before)
      const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
      
      if (hasVisitedBefore) {
        // Auto-prompt returning visitors after a short delay
        const timer = setTimeout(() => {
          setShouldAutoPrompt(true);
          setShowGoogleModal(true);
        }, 2000); // 2-second delay to avoid immediate pop-up
        
        return () => clearTimeout(timer);
      } else {
        // Mark as visited for future sessions
        localStorage.setItem('hasVisitedBefore', 'true');
      }
    }
  }, [isAuthenticated]);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      // If user is authenticated, use the provided callback or navigate to properties
      if (onGetStarted) {
        onGetStarted();
      } else {
        navigate('/properties');
      }
    } else {
      // If not authenticated, show Google auth modal
      setShouldAutoPrompt(false); // This is not an auto-prompt, but a user action
      setShowGoogleModal(true);
    }
  };

  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
            Find Your Perfect Home in Kenya
          </h1>
          <p className="text-xl mb-8">
            PataBaseFiti connects you with verified properties across Kenya. Save time and find your ideal home faster with our token-based system.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-white text-blue-700 hover:bg-gray-100"
              onClick={handleGetStarted}
            >
              Get Started Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-700"
              onClick={() => navigate('/properties')}
            >
              Browse Properties
            </Button>
          </div>
        </div>
      </div>

      {/* Google Auth Modal - will show either on auto-prompt or when user clicks Get Started */}
      <GoogleAuthModal 
        isOpen={showGoogleModal} 
        onClose={() => setShowGoogleModal(false)}
        autoPrompt={shouldAutoPrompt}
      />
    </div>
  );
};

export default HeroSection;