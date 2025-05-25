// File: frontend/src/components/admin/BatchGeocodingTool.tsx
// Admin tool for batch geocoding existing properties

import React, { useState } from 'react';
import { MapPin, Play, RefreshCw, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react';
import { batchGeocodeProperties } from '../../api/locations';
import { useAuth } from '../../hooks/useAuth';

interface BatchResults {
  total_processed: number;
  successful_geocodes: number;
  failed_geocodes: number;
  errors: string[];
}

const BatchGeocodingTool: React.FC = () => {
  const { token } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BatchResults | null>(null);
  const [limit, setLimit] = useState(100);
  const [error, setError] = useState<string | null>(null);

  const handleBatchGeocode = async () => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    setIsRunning(true);
    setError(null);
    setResults(null);

    try {
      const response = await batchGeocodeProperties(token, limit);
      
      if (response.success) {
        setResults(response.results);
      } else {
        setError('Batch geocoding failed');
      }
    } catch (err: any) {
      console.error('Batch geocoding error:', err);
      setError(err.response?.data?.detail || 'Failed to run batch geocoding');
    } finally {
      setIsRunning(false);
    }
  };

  const getSuccessRate = () => {
    if (!results || results.total_processed === 0) return 0;
    return Math.round((results.successful_geocodes / results.total_processed) * 100);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
          <MapPin className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Batch Geocoding Tool</h2>
          <p className="text-gray-600">Automatically add coordinates to properties without location data</p>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div>
            <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-1">
              Properties to Process
            </label>
            <input
              id="limit"
              type="number"
              min="1"
              max="1000"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 100)}
              disabled={isRunning}
              className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleBatchGeocode}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Geocoding
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Text */}
        <div className="text-sm text-gray-600 bg-blue-50 rounded-md p-3">
          <p>This tool will automatically add latitude and longitude coordinates to properties that don't have them yet. It uses the property's address and city to find accurate coordinates.</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700 font-medium">Error</span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Processed</p>
                  <p className="text-2xl font-bold text-blue-900">{results.total_processed}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Successful</p>
                  <p className="text-2xl font-bold text-green-900">{results.successful_geocodes}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm text-red-600 font-medium">Failed</p>
                  <p className="text-2xl font-bold text-red-900">{results.failed_geocodes}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Success Rate */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Success Rate</span>
              <span className="text-sm font-bold text-gray-900">{getSuccessRate()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getSuccessRate()}%` }}
              ></div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Batch Results</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Properties processed:</span>
                <span className="font-medium">{results.total_processed}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Successfully geocoded:</span>
                <span className="font-medium text-green-600">{results.successful_geocodes}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Failed to geocode:</span>
                <span className="font-medium text-red-600">{results.failed_geocodes}</span>
              </div>
            </div>

            {/* Error Details */}
            {results.errors && results.errors.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Errors:</h4>
                <div className="bg-red-50 rounded-md p-3 max-h-40 overflow-y-auto">
                  {results.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600 mb-1">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {results.successful_geocodes > 0 && (
                <span className="text-green-600">
                  ✓ {results.successful_geocodes} properties now have coordinates
                </span>
              )}
            </div>
            
            {results.failed_geocodes > 0 && (
              <button
                onClick={handleBatchGeocode}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Retry Failed Properties
              </button>
            )}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">How it works:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Finds properties without latitude/longitude coordinates</li>
          <li>• Uses the property's address and city to find accurate coordinates</li>
          <li>• Validates that coordinates are within Kenya bounds</li>
          <li>• Updates properties with the geocoded coordinates</li>
          <li>• Properties with coordinates will show maps and enable location-based features</li>
        </ul>
      </div>
    </div>
  );
};

export default BatchGeocodingTool;