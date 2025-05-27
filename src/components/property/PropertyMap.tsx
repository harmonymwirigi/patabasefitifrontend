// File: frontend/src/components/property/PropertyMap.tsx
// Improved map implementation with better tile loading and styling

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Maximize2, RefreshCw } from 'lucide-react';

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
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState(false);

  // Validate coordinates before rendering map
  const isValidCoordinate = (lat: number, lng: number): boolean => {
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      console.warn('PropertyMap: Invalid coordinate types', { lat: typeof lat, lng: typeof lng });
      return false;
    }

    if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
      console.warn('PropertyMap: NaN or Infinity coordinates', { lat, lng });
      return false;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.warn('PropertyMap: Coordinates outside global bounds', { lat, lng });
      return false;
    }

    if (lat === 0 && lng === 0) {
      console.warn('PropertyMap: Coordinates are 0,0 (likely invalid)', { lat, lng });
      return false;
    }

    return true;
  };

  const numLat = Number(latitude);
  const numLng = Number(longitude);
  const isValid = isValidCoordinate(numLat, numLng);

  // Initialize map
  const initMap = async () => {
    if (!isValid || !mapRef.current) return;

    try {
      setMapLoading(true);
      setMapError(false);

      // Load Leaflet CSS first
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      cssLink.crossOrigin = '';
      document.head.appendChild(cssLink);

      // Wait for CSS to load
      await new Promise((resolve) => {
        cssLink.onload = resolve;
        setTimeout(resolve, 1000); // Fallback timeout
      });

      // Dynamically import Leaflet
      const L = await import('leaflet');
      
      // Fix default marker icons with CDN URLs
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      // Create map with proper options
      const map = L.map(mapRef.current, {
        center: [numLat, numLng],
        zoom: zoom,
        zoomControl: false, // We'll add custom controls
        attributionControl: false,
        preferCanvas: true,
        maxZoom: 18,
        minZoom: 1
      });

      // Add custom zoom control
      L.control.zoom({
        position: 'bottomright'
      }).addTo(map);

      // Try multiple tile providers for better reliability
      const tileProviders = [
        {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        },
        {
          url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }
      ];

      let tileLayerAdded = false;

      for (const provider of tileProviders) {
        try {
          const tileLayer = L.tileLayer(provider.url, {
            attribution: provider.attribution,
            maxZoom: provider.maxZoom,
            crossOrigin: true
          });

          tileLayer.addTo(map);
          tileLayerAdded = true;
          break;
        } catch (error) {
          console.warn('Failed to load tile provider:', provider.url);
        }
      }

      if (!tileLayerAdded) {
        throw new Error('Failed to load any tile provider');
      }

      // Create custom marker
      const customIcon = L.divIcon({
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="position: relative; z-index: 2; filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.03 7.03 1 12 1S21 5.03 21 10Z" stroke="white" stroke-width="2" fill="#3B82F6"/>
                <circle cx="12" cy="10" r="3" stroke="white" stroke-width="2" fill="white"/>
              </svg>
            </div>
          </div>
        `,
        className: 'custom-map-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      // Add marker
      const marker = L.marker([numLat, numLng], { icon: customIcon }).addTo(map);

      // Create popup content
      const popupContent = `
        <div style="padding: 12px; min-width: 220px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <div style="flex-shrink: 0; width: 36px; height: 36px; background: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.03 7.03 1 12 1S21 5.03 21 10Z" stroke="#2563eb" stroke-width="2" fill="#2563eb"/>
                <circle cx="12" cy="10" r="3" stroke="white" stroke-width="2" fill="white"/>
              </svg>
            </div>
            <div style="flex: 1;">
              <h3 style="font-weight: 600; color: #111827; font-size: 16px; margin: 0 0 6px 0; line-height: 1.3;">${title}</h3>
              ${address ? `<p style="font-size: 13px; color: #6b7280; margin: 0; line-height: 1.4;">${address}</p>` : ''}
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
      });

      // Force map to resize properly
      setTimeout(() => {
        map.invalidateSize();
        setMapLoading(false);
      }, 100);

      // Store map instance
      mapInstanceRef.current = map;

      // Add custom styles
      const style = document.createElement('style');
      style.textContent = `
        .custom-map-marker {
          border: none !important;
          background: transparent !important;
        }
        
        .custom-popup .leaflet-popup-content-wrapper {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          border: none;
          padding: 0;
        }
        
        .custom-popup .leaflet-popup-tip {
          background: white;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .leaflet-control-zoom {
          border: none !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }
        
        .leaflet-control-zoom a {
          border: none !important;
          background: white !important;
          color: #374151 !important;
          font-size: 18px !important;
          font-weight: bold !important;
          width: 34px !important;
          height: 34px !important;
          line-height: 34px !important;
          transition: all 0.2s !important;
        }
        
        .leaflet-control-zoom a:hover {
          background: #f3f4f6 !important;
          color: #3b82f6 !important;
        }
        
        .leaflet-control-zoom a:first-child {
          border-top-left-radius: 8px !important;
          border-top-right-radius: 8px !important;
        }
        
        .leaflet-control-zoom a:last-child {
          border-bottom-left-radius: 8px !important;
          border-bottom-right-radius: 8px !important;
        }
      `;
      document.head.appendChild(style);

    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(true);
      setMapLoading(false);
    }
  };

  useEffect(() => {
    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isValid, numLat, numLng, zoom]);

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

  // Handle retry
  const handleRetry = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    initMap();
  };

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

  return (
    <div className="relative group">
      <div className={`${height} rounded-xl overflow-hidden border border-gray-200 shadow-lg relative`}>
        <div 
          ref={mapRef} 
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        />
        
        {/* Loading overlay */}
        {mapLoading && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
        
        {/* Error overlay */}
        {mapError && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
            <div className="text-center p-4">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Map Failed to Load</h3>
              <p className="text-gray-600 mb-4">There was an issue loading the map tiles.</p>
              <button
                onClick={handleRetry}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Map Controls */}
      {showControls && !mapLoading && !mapError && (
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
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
      {address && !mapLoading && !mapError && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
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