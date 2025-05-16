// File: frontend/src/routes/AdminRoute.tsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is an admin
  if (user?.role !== 'admin') {
    // Redirect to dashboard if not admin
    return <Navigate to="/dashboard" replace />;
  }

  // Render the protected admin component
  return <>{children}</>;
};

export default AdminRoute;