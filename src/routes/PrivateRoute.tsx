// File: frontend/src/routes/PrivateRoute.tsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface PrivateRouteProps {
  children: React.ReactNode | ((props: any) => React.ReactNode);
  allowedRoles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect to login page, but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if role restrictions apply
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // User doesn't have the required role, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // If children is a function, pass the user and other props
  if (typeof children === 'function') {
    return <>{children({ user })}</>;
  }

  // Render the protected component
  return <>{children}</>;
};

export default PrivateRoute;