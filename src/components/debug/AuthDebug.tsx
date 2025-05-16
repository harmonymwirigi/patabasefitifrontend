// File: frontend/src/components/debug/AuthDebug.tsx
// Add this file temporarily to help debug auth issues

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';

const AuthDebug: React.FC = () => {
  const { user, token, isAuthenticated } = useAuth();
  const [apiResult, setApiResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testApi = async (endpoint: string) => {
    setError(null);
    setApiResult(null);
    
    try {
      const response = await axios.get(endpoint, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setApiResult(response.data);
    } catch (err: any) {
      console.error('API test error:', err);
      setError(err.response?.data?.detail || err.message || 'Unknown error');
    }
  };

  return (
    <div className="fixed bottom-0 right-0 bg-white border border-gray-300 shadow-lg p-4 m-4 max-w-sm rounded-lg">
      <h3 className="text-lg font-bold mb-2">Auth Debug</h3>
      
      <div className="mb-3 text-xs overflow-auto max-h-40">
        <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
        <p><strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'None'}</p>
        <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'None'}</p>
      </div>
      
      <div className="mb-3">
        <button 
          onClick={() => testApi('http://localhost:8000/api/v1/users/me')}
          className="bg-blue-500 text-white px-2 py-1 text-xs rounded mr-2"
        >
          Test /users/me
        </button>
        <button 
          onClick={() => testApi('http://localhost:8000/')}
          className="bg-green-500 text-white px-2 py-1 text-xs rounded"
        >
          Test root API
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-800 p-2 rounded text-xs mb-2">
          {error}
        </div>
      )}
      
      {apiResult && (
        <div className="bg-green-100 border border-green-300 text-green-800 p-2 rounded text-xs">
          <pre>{JSON.stringify(apiResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default AuthDebug;