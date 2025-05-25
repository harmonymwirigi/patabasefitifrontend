import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import IntegratedAuthModal from '../../components/auth/IntegratedAuthModal';

const UpdatedLogin: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(true);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    navigate('/dashboard');
  };

  const handleClose = () => {
    setShowAuthModal(false);
    navigate('/'); // Navigate to home or wherever you want
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <IntegratedAuthModal
        isOpen={showAuthModal}
        onClose={handleClose}
        onSuccess={handleAuthSuccess}
        defaultTab="login"
      />
      
      {/* Optional: Background content */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to PataBaseFiti
        </h1>
        <p className="text-lg text-gray-600">
          Find your perfect property in Kenya
        </p>
      </div>
    </div>
  );
};

export default UpdatedLogin;