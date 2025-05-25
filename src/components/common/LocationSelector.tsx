// File: frontend/src/components/common/LocationSelector.tsx
// Component for selecting and geocoding addresses

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Target, Check, AlertCircle } from 'lucide-react';
import { geocodeAddress, getLocationSuggestions, getCurrentLocation, validateCoordinates } from '../../api/locations';
import { useAuth } from '../../hooks/useAuth';

interface LocationSelectorProps {
  initialAddress?: string;
  initialCity?: string;
  initialLatitude?: number;
  initialLongitude?: number;
  onLocationSelect: (location: {
    address: string;
    city: string;
    latitude?: number;
    longitude?: number;
    formatted_address?: string;
  }) => void;
  required?: boolean;
  disabled?: boolean;
  showCoordinates?: boolean;
  allowManualCoordinates?: boolean;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  initialAddress = '',
  initialCity = '',
  initialLatitude,
  initialLongitude,
  onLocationSelect,
  required = false,
  disabled = false,
  showCoordinates = false,
  allowManualCoordinates = false,
}) => {
  const { token } = useAuth();
  const [address, setAddress] = useState(initialAddress);
  const [city, setCity] = useState(initialCity);
  const [latitude, setLatitude] = useState<number | undefined>(initialLatitude);
  const [longitude, setLongitude] = useState<number | undefined>(initialLongitude);
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'valid' | 'invalid' | 'unknown'>('unknown');
  const [error, setError] = useState<string | null>(null);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Handle address/city changes and trigger geocoding
  const handleAddressChange = async (newAddress: string, newCity: string) => {
    setAddress(newAddress);
    setCity(newCity);
    setError(null);
    
    if (newAddress.length > 3 && token) {
      setIsGeocoding(true);
      
      try {
        const result = await geocodeAddress(token, {
          address: newAddress,
          city: newCity,
          country: 'Kenya'
        });
        
        if (result.success && result.latitude && result.longitude) {
          setLatitude(result.latitude);
          setLongitude(result.longitude);
          setValidationStatus('valid');
          
          onLocationSelect({
            address: newAddress,
            city: newCity,
            latitude: result.latitude,
            longitude: result.longitude,
            formatted_address: result.formatted_address,
          });
        } else {
          setLatitude(undefined);
          setLongitude(undefined);
          setValidationStatus('invalid');
          setError(result.error || 'Could not find location');
        }
      } catch (err) {
        console.error('Geocoding error:', err);
        setError('Failed to geocode address');
        setValidationStatus('invalid');
      } finally {
        setIsGeocoding(false);
      }
    } else {
      // Clear coordinates if address is too short
      setLatitude(undefined);
      setLongitude(undefined);
      setValidationStatus('unknown');
      
      onLocationSelect({
        address: newAddress,
        city: newCity,
      });
    }
  };

  // Handle manual coordinate changes
  const handleCoordinateChange = async (newLat: number, newLng: number) => {
    setLatitude(newLat);
    setLongitude(newLng);
    setIsValidating(true);
    setError(null);
    
    try {
      const result = await validateCoordinates(newLat, newLng);
      
      if (result.valid) {
        setValidationStatus('valid');
        onLocationSelect({
          address,
          city,
          latitude: newLat,
          longitude: newLng,
        });
      } else {
        setValidationStatus('invalid');
        setError('Coordinates are outside Kenya bounds');
      }
    } catch (err) {
      console.error('Validation error:', err);
      setError('Failed to validate coordinates');
      setValidationStatus('invalid');
    } finally {
      setIsValidating(false);
    }
  };

  // Get current location
  const handleGetCurrentLocation = async () => {
    setIsGeocoding(true);
    setError(null);
    
    try {
      const location = await getCurrentLocation();
      setLatitude(location.latitude);
      setLongitude(location.longitude);
      
      // Validate coordinates
      const validation = await validateCoordinates(location.latitude, location.longitude);
      if (validation.valid) {
        setValidationStatus('valid');
        onLocationSelect({
          address,
          city,
          latitude: location.latitude,
          longitude: location.longitude,
        });
      } else {
        setValidationStatus('invalid');
        setError('Your current location is outside Kenya');
      }
    } catch (err: any) {
      console.error('Current location error:', err);
      setError('Could not get current location: ' + err.message);
      setValidationStatus('invalid');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Get suggestions for city
  const handleCitySearch = async (query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(async () => {
      if (query.length > 2) {
        try {
          const result = await getLocationSuggestions(query, 5, token);
          if (result.success) {
            setSuggestions(result.suggestions);
            setShowSuggestions(true);
          }
        } catch (err) {
          console.error('Suggestions error:', err);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const getStatusIcon = () => {
    if (isGeocoding || isValidating) {
      return <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />;
    }
    
    switch (validationStatus) {
      case 'valid':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'invalid':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <MapPin className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Address Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <input
            type="text"
            value={address}
            onChange={(e) => handleAddressChange(e.target.value, city)}
            disabled={disabled}
            placeholder="Enter street address"
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            required={required}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {getStatusIcon()}
          </div>
        </div>
      </div>

      {/* City Field with Suggestions */}
      <div className="relative" ref={suggestionRef}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          City {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <input
            type="text"
            value={city}
            onChange={(e) => {
              const newCity = e.target.value;
              setCity(newCity);
              handleCitySearch(newCity);
              handleAddressChange(address, newCity);
            }}
            disabled={disabled}
            placeholder="Enter city name"
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            required={required}
          />
          <Search className="absolute inset-y-0 right-0 pr-3 w-4 h-4 text-gray-400 flex items-center pointer-events-none" style={{ right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
        
        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setCity(suggestion);
                  setShowSuggestions(false);
                  handleAddressChange(address, suggestion);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current Location Button */}
      <button
        type="button"
        onClick={handleGetCurrentLocation}
        disabled={disabled || isGeocoding}
        className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Target className="w-4 h-4" />
        Use Current Location
      </button>

      {/* Manual Coordinates */}
      {allowManualCoordinates && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              value={latitude || ''}
              onChange={(e) => {
                const newLat = parseFloat(e.target.value);
                if (!isNaN(newLat) && longitude !== undefined) {
                  handleCoordinateChange(newLat, longitude);
                }
              }}
              disabled={disabled}
              placeholder="-1.2921"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              value={longitude || ''}
              onChange={(e) => {
                const newLng = parseFloat(e.target.value);
                if (!isNaN(newLng) && latitude !== undefined) {
                  handleCoordinateChange(latitude, newLng);
                }
              }}
              disabled={disabled}
              placeholder="36.8219"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>
        </div>
      )}

      {/* Coordinates Display */}
      {showCoordinates && latitude && longitude && (
        <div className="bg-gray-50 rounded-md p-3">
          <div className="text-sm text-gray-600">
            <strong>Coordinates:</strong> {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </div>
          {validationStatus === 'valid' && (
            <div className="text-sm text-green-600 flex items-center gap-1 mt-1">
              <Check className="w-3 h-3" />
              Location verified in Kenya
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="text-sm text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;