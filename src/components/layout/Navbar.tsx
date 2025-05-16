// File: frontend/src/components/layout/Navbar.tsx
// Complete implementation with Google Auth integration

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import TokenBalance from '../token/TokenBalance';
import TokenPurchaseModal from '../token/TokenPurchaseModal';
import GoogleAuthModal from '../auth/GoogleAuthModal';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showGoogleAuthModal, setShowGoogleAuthModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  // Check if the current route is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                PataBasefiti
              </Link>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/') ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Home
              </Link>
              
              <Link
                to="/properties"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/properties') ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Properties
              </Link>
              
              {isAuthenticated && user?.role === 'owner' && (
                <Link
                  to="/my-properties"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/my-properties') ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Properties
                </Link>
              )}
              
              {isAuthenticated && (
                <Link
                  to="/messages"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/messages') ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Messages
                </Link>
              )}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <>
                <TokenBalance 
                  showBuyButton={false}
                  onClickBuy={() => setShowTokenModal(true)}
                  className="mr-4"
                />
                
                <button
                  onClick={() => setShowTokenModal(true)}
                  className="mr-4 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md"
                >
                  Buy Tokens
                </button>
                
                <div className="ml-3 relative">
                  <div>
                    <button
                      onClick={toggleProfileMenu}
                      className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <span className="sr-only">Open user menu</span>
                      {user?.profile_image ? (
                        <img
                          className="h-8 w-8 rounded-full"
                          src={`/uploads/${user.profile_image}`}
                          alt={user.full_name}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                  
                  {profileMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <div className="font-medium">{user?.full_name}</div>
                        <div className="text-gray-500">{user?.email}</div>
                      </div>
                      
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        Your Profile
                      </Link>
                      
                      <Link
                        to="/tokens"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        Token History
                      </Link>
                      
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Google auth buttons */}
                <button
                  onClick={() => setShowGoogleAuthModal(true)}
                  className="text-gray-700 hover:text-gray-900 text-sm font-medium"
                >
                  Log in
                </button>
                
                <button
                  onClick={() => setShowGoogleAuthModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/') 
                  ? 'border-blue-500 text-blue-700 bg-blue-50' 
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            
            <Link
              to="/properties"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/properties') 
                  ? 'border-blue-500 text-blue-700 bg-blue-50' 
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Properties
            </Link>
            
            {isAuthenticated && user?.role === 'owner' && (
              <Link
                to="/my-properties"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive('/my-properties') 
                    ? 'border-blue-500 text-blue-700 bg-blue-50' 
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                My Properties
              </Link>
            )}
            
            {isAuthenticated && (
              <Link
                to="/messages"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive('/messages') 
                    ? 'border-blue-500 text-blue-700 bg-blue-50' 
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Messages
              </Link>
            )}
          </div>
          
          {isAuthenticated ? (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  {user?.profile_image ? (
                    <img
                      className="h-10 w-10 rounded-full"
                      src={`/uploads/${user.profile_image}`}
                      alt={user.full_name}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user?.full_name}</div>
                  <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                </div>
              </div>
              
              <div className="mt-3 space-y-1">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Your Profile
                </Link>
                
                <Link
                  to="/tokens"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Token History
                </Link>
                
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
              
              <div className="mt-3 px-4 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <TokenBalance showBuyButton={false} className="mr-2" />
                  
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowTokenModal(true);
                    }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md"
                  >
                    Buy Tokens
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center justify-around">
                {/* Google auth buttons for mobile */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowGoogleAuthModal(true);
                  }}
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Log in
                </button>
                
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowGoogleAuthModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md"
                >
                  Sign up
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <TokenPurchaseModal
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
      />

      {/* Google Authentication Modal */}
      <GoogleAuthModal
        isOpen={showGoogleAuthModal}
        onClose={() => setShowGoogleAuthModal(false)}
        autoPrompt={false}
      />
    </nav>
  );
};

export default Navbar;