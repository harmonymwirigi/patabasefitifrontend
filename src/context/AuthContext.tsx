// File: frontend/src/context/AuthContext.tsx
// Updated with proper JWT decoding and token handling

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';  // Updated import syntax
import { getUserProfile } from '../api/users';

interface User {
  id: number;
  email: string;
  role: string;
  full_name: string;
  profile_image?: string;
  phone_number?: string;
  token_balance?: number;
  [key: string]: any;  // Allow any additional properties
}

interface DecodedToken {
  sub: number;
  email?: string;
  role?: string;
  exp: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
  updateUser: () => {},
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Function to fetch user profile
  const fetchUserProfile = async (authToken: string) => {
    try {
      const userData = await getUserProfile(authToken);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        try {
          // Validate token (check expiration)
          const decodedToken = jwtDecode<DecodedToken>(storedToken);
          const currentTime = Date.now() / 1000;
          
          if (decodedToken.exp > currentTime) {
            // Token is still valid
            setToken(storedToken);
            setIsAuthenticated(true);
            
            // Set basic user from token claims
            if (decodedToken.sub) {
              setUser({
                id: decodedToken.sub,
                email: decodedToken.email || '',
                role: decodedToken.role || '',
                full_name: ''
              });
              
              // Fetch full user profile
              await fetchUserProfile(storedToken);
            }
          } else {
            // Token expired, clear auth state
            console.log('Token expired, removing from storage');
            localStorage.removeItem('token');
          }
        } catch (error) {
          // Invalid token, clear auth state
          console.error('Invalid token:', error);
          localStorage.removeItem('token');
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (newToken: string): Promise<void> => {
    try {
      // Store token
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setIsAuthenticated(true);
      
      // Decode token to get basic user info
      try {
        const decodedToken = jwtDecode<DecodedToken>(newToken);
        
        // Set basic user from token claims
        if (decodedToken.sub) {
          setUser({
            id: decodedToken.sub,
            email: decodedToken.email || '',
            role: decodedToken.role || '',
            full_name: ''
          });
          
          // Fetch full user profile
          await fetchUserProfile(newToken);
        }
      } catch (decodeError) {
        console.error('Error decoding token:', decodeError);
        // Even if decode fails, we'll still be authenticated with the token
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData: Partial<User>): void => {
    setUser(prevUser => {
      if (!prevUser) return userData as User;
      return { ...prevUser, ...userData };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        login,
        logout,
        updateUser,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};