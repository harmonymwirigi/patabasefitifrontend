// File: frontend/src/components/auth/RegisterForm.tsx

import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import { Alert } from '../common/Alert';
import { registerUser, loginUser } from '../../api/auth';

// Validation schema
const RegisterSchema = Yup.object().shape({
  full_name: Yup.string()
    .min(2, 'Name is too short')
    .max(50, 'Name is too long')
    .required('Full name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .required('Password is required'),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  phone_number: Yup.string()
    .matches(/^(\+254|0)[17]\d{8}$/, 'Please enter a valid Kenyan phone number')
    .required('Phone number is required'),
  role: Yup.string()
    .oneOf(['tenant', 'owner'], 'Please select a valid role')
    .required('Role is required'),
});

interface RegisterFormProps {
  onSuccess?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: {
    full_name: string;
    email: string;
    password: string;
    confirm_password: string;
    phone_number: string;
    role: string;
  }) => {
    setError(null);
    setIsLoading(true);
    
    try {
      // Register user
      const registerResponse = await registerUser({
        full_name: values.full_name,
        email: values.email,
        password: values.password,
        phone_number: values.phone_number,
        role: values.role,
      });
      
      console.log("Register response:", registerResponse);
      
      // Check if registration was successful - look for user id or email
      if (registerResponse && (registerResponse.id || registerResponse.email)) {
        try {
          // Auto-login after registration
          const loginResponse = await loginUser(values.email, values.password);
          console.log("Login response after registration:", loginResponse);
          
          // Handle different token structures
          let token = null;
          if (loginResponse.token && loginResponse.token.access_token) {
            token = loginResponse.token.access_token;
          } else if (loginResponse.access_token) {
            token = loginResponse.access_token;
          }
          
          if (token) {
            await login(token);
            if (onSuccess) onSuccess();
          } else {
            setError('Registration successful but login failed. Please log in manually.');
          }
        } catch (loginErr: any) {
          console.error('Login after registration failed:', loginErr);
          setError('Registration successful but login failed. Please log in manually.');
          
          // Still redirect to login page after registration
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('An error occurred. Please try again.');
      }
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>
      
      {error && <Alert type="error" message={error} className="mb-4" />}
      
      <Formik
        initialValues={{
          full_name: '',
          email: '',
          password: '',
          confirm_password: '',
          phone_number: '',
          role: 'tenant',
        }}
        validationSchema={RegisterSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <Field
                id="full_name"
                name="full_name"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
              <ErrorMessage name="full_name" component="div" className="mt-1 text-sm text-red-600" />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Field
                id="email"
                name="email"
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              />
              <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
            </div>
            
            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <Field
                id="phone_number"
                name="phone_number"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0712345678"
              />
              <ErrorMessage name="phone_number" component="div" className="mt-1 text-sm text-red-600" />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Field
                id="password"
                name="password"
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
              <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-600" />
            </div>
            
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <Field
                id="confirm_password"
                name="confirm_password"
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
              <ErrorMessage name="confirm_password" component="div" className="mt-1 text-sm text-red-600" />
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                I am a
              </label>
              <Field
                as="select"
                id="role"
                name="role"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="tenant">Tenant looking for property</option>
                <option value="owner">Property Owner</option>
              </Field>
              <ErrorMessage name="role" component="div" className="mt-1 text-sm text-red-600" />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </Form>
        )}
      </Formik>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:text-blue-800">
            Log In
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;