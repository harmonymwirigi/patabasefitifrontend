// File: frontend/src/App.tsx
// Status: COMPLETE
// Dependencies: react, react-router-dom, components

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from './config/constants';

// Layout components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
// In App.tsx or any component
import AuthDebug from './components/debug/AuthDebug';

// Then in your JSX
{process.env.NODE_ENV === 'development' && <AuthDebug />}
// Pages
import HomePage from './pages/Home';
import PropertyListing from './pages/Properties/PropertyListing';
import PropertyDetail from './pages/Properties/PropertyDetail';
import PropertyCreate from './pages/Properties/PropertyCreate';
import PropertyEdit from './pages/Properties/PropertyEdit';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Profile from './pages/Auth/Profile';
import TokenPackages from './pages/Tokens/TokenPackages';
import TokenCheckout from './pages/Tokens/TokenCheckout';
import Inbox from './pages/Messages/Inbox';
import Conversation from './pages/Messages/Conversation';
import OwnerDashboard from './pages/Dashboard/OwnerDashboard';
import TenantDashboard from './pages/Dashboard/TenantDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import PropertyVerification from './pages/Dashboard/Admin/PropertyVerification';
import UserManagement from './pages/Dashboard/Admin/UserManagement';
import Analytics from './pages/Dashboard/Admin/Analytics';
// Protected route component
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';

const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected routes */}
                <Route path="/properties" element={<PropertyListing />} />
                <Route path="/properties/:id" element={<PropertyDetail />} />
                
                <Route 
                  path="/properties/create" 
                  element={
                    <PrivateRoute>
                      <PropertyCreate />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/properties/:id/edit" 
                  element={
                    <PrivateRoute>
                      <PropertyEdit />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/profile" 
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/tokens" 
                  element={
                    <PrivateRoute>
                      <TokenPackages />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/tokens/checkout/:packageId" 
                  element={
                    <PrivateRoute>
                      <TokenCheckout />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/messages" 
                  element={
                    <PrivateRoute>
                      <Inbox />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/messages/:conversationId" 
                  element={
                    <PrivateRoute>
                      <Conversation />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/my-properties" 
                  element={
                    <PrivateRoute allowedRoles={['owner', 'admin']}>
                      <OwnerDashboard />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/dashboard" 
                  element={
                    <PrivateRoute>
                      {({ user }) => {
                        if (user?.role === 'owner') {
                          return <Navigate to="/my-properties" />;
                        } else if (user?.role === 'admin') {
                          return <Navigate to="/admin" />;
                        } else {
                          return <TenantDashboard />;
                        }
                      }}
                    </PrivateRoute>
                  } 
                />
                
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/properties" element={<AdminRoute><PropertyVerification /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
                <Route path="/admin/analytics" element={<AdminRoute><Analytics /></AdminRoute>} />
                
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;