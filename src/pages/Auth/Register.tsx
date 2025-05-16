// File: frontend/src/pages/Auth/Register.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../../components/auth/RegisterForm';
import GoogleAuthButton from '../../components/auth/GoogleAuthButton';

const Register: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create a new account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              log in to your existing account
            </a>
          </p>
        </div>
        
        <RegisterForm onSuccess={handleSuccess} />
        <GoogleAuthButton onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default Register;