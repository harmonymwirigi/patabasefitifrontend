// File: frontend/src/components/property/PropertyMap.tsx
// Status: COMPLETE
// Dependencies: react, leaflet

import React from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix marker icon issues
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  title: string;
  zoom?: number;
}

const PropertyMap: React.FC<PropertyMapProps> = ({
  latitude,
  longitude,
  title,
  zoom = 15,
}) => {
  const position: [number, number] = [latitude, longitude];

  return (
    <div className="h-64 rounded-lg overflow-hidden border">
      <MapContainer
        center={position}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>{title}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default PropertyMap;