// File: frontend/src/components/property/PropertyMap.tsx
// Simple map implementation without React Leaflet context issues

import React, { useEffect, useRef } from 'react';
import { MapPin, Navigation, Maximize2 } from 'lucide-react';

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  title: string;
  address?: string;
  zoom?: number;
  height?: string;
  showControls?: boolean;
}

const PropertyMap: React.FC<PropertyMapProps> = ({
  latitude,
  longitude,
  title,
  address,
  zoom = 15,
  height = 'h-80',
  showControls = true,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Validate coordinates before rendering map
  const isValidCoordinate = (lat: number, lng: number): boolean => {
    // Check if coordinates are valid numbers
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      console.warn('PropertyMap: Invalid coordinate types', { lat: typeof lat, lng: typeof lng });
      return false;
    }

    // Check if coordinates are not NaN or Infinity
    if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
      console.warn('PropertyMap: NaN or Infinity coordinates', { lat, lng });
      return false;
    }

    // Check if coordinates are within reasonable global bounds
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.warn('PropertyMap: Coordinates outside global bounds', { lat, lng });
      return false;
    }

    // Check if coordinates are reasonable (not 0,0 which often indicates missing data)
    if (lat === 0 && lng === 0) {
      console.warn('PropertyMap: Coordinates are 0,0 (likely invalid)', { lat, lng });
      return false;
    }

    return true;
  };

  // Convert coordinates to numbers and validate
  const numLat = Number(latitude);
  const numLng = Number(longitude);
  const isValid = isValidCoordinate(numLat, numLng);

  // Initialize map without React Leaflet
  useEffect(() => {
    if (!isValid || !mapRef.current) return;

    const initMap = async () => {
      try {
        // Dynamically import Leaflet to avoid SSR issues
        const L = await import('leaflet');
        
        // Fix default marker icons
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Create map
        const map = L.map(mapRef.current).setView([numLat, numLng], zoom);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Create custom icon
        const customIcon = L.divIcon({
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center;">
              <div style="position: relative; z-index: 2; filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.03 7.03 1 12 1S21 5.03 21 10Z" stroke="white" stroke-width="2" fill="#3B82F6"/>
                  <circle cx="12" cy="10" r="3" stroke="white" stroke-width="2" fill="white"/>
                </svg>
              </div>
              <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -60%); width: 30px; height: 30px; background: rgba(59, 130, 246, 0.3); border-radius: 50%; animation: pulse 2s infinite; z-index: 1;"></div>
            </div>
          `,
          className: '',
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40],
        });

        // Add marker
        const marker = L.marker([numLat, numLng], { icon: customIcon }).addTo(map);

        // Add popup
        const popupContent = `
          <div style="padding: 8px; min-width: 200px;">
            <div style="display: flex; align-items: flex-start; gap: 12px;">
              <div style="flex-shrink: 0; width: 32px; height: 32px; background: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.03 7.03 1 12 1S21 5.03 21 10Z" stroke="#2563eb" stroke-width="2" fill="#2563eb"/>
                  <circle cx="12" cy="10" r="3" stroke="white" stroke-width="2" fill="white"/>
                </svg>
              </div>
              <div style="flex: 1;">
                <h3 style="font-weight: 600; color: #111827; font-size: 14px; margin: 0 0 4px 0;">${title}</h3>
                ${address ? `<p style="font-size: 12px; color: #6b7280; margin: 0; line-height: 1.4;">${address}</p>` : ''}
              </div>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        // Store map instance for cleanup
        mapInstanceRef.current = map;

        // Add pulse animation styles
        const style = document.createElement('style');
        style.textContent = `
          @keyframes pulse {
            0% {
              transform: translate(-50%, -60%) scale(0.8);
              opacity: 1;
            }
            70% {
              transform: translate(-50%, -60%) scale(2);
              opacity: 0;
            }
            100% {
              transform: translate(-50%, -60%) scale(2.2);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(style);

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isValid, numLat, numLng, zoom, title, address]);

  // If coordinates are invalid, show fallback UI
  if (!isValid) {
    return (
      <div className={`${height} rounded-xl overflow-hidden border border-gray-200 shadow-lg bg-gray-50`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Map Unavailable</h3>
            <p className="text-gray-600 mb-4">
              {latitude === 0 && longitude === 0 
                ? "Location coordinates are being processed" 
                : "Invalid location coordinates"}
            </p>
            {address && (
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">{address}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Handle directions
  const handleDirections = () => {
    try {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${numLat},${numLng}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening directions:', error);
    }
  };

  // Handle fullscreen
  const handleFullscreen = () => {
    try {
      const url = `https://www.google.com/maps/place/${numLat},${numLng}/@${numLat},${numLng},${zoom}z`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening fullscreen map:', error);
    }
  };

  return (
    <div className="relative group">
      <div className={`${height} rounded-xl overflow-hidden border border-gray-200 shadow-lg`}>
        <div 
          ref={mapRef} 
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        />
      </div>
      
      {/* Map Controls */}
      {showControls && (
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            onClick={handleDirections}
            className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-200 shadow-lg"
            title="Get directions"
          >
            <Navigation className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleFullscreen}
            className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-200 shadow-lg"
            title="View in Google Maps"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Address overlay */}
      {address && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="text-sm text-gray-700 font-medium truncate">{address}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyMap;