'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

interface MapViewProps {
  markers?: { id: string; lat: number; lng: number; label?: string; active?: boolean }[];
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (id: string) => void;
  onMapClick?: (lat: number, lng: number) => void;
  className?: string;
}

// CartoDB tile URLs
const TILES_LIGHT = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const TILES_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

function ChangeView({ center, useMap }: { center: [number, number]; useMap: any }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

function MapEvents({ onClick, useMapEvents }: { onClick: (lat: number, lng: number) => void; useMapEvents: any }) {
  useMapEvents({
    click(e: any) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function MapView({
  markers = [],
  center = [12.9716, 77.5946],
  zoom = 12,
  onMarkerClick,
  onMapClick,
  className,
}: MapViewProps) {
  const { resolvedTheme } = useTheme();
  const [MapComponents, setMapComponents] = useState<any>(null);

  // Dynamic import to avoid SSR issues
  useEffect(() => {
    import('react-leaflet').then((mod) => {
      setMapComponents(mod);
    });
  }, []);

  if (!MapComponents) {
    return (
      <div className={`bg-[var(--muted-light)] animate-shimmer rounded-[var(--radius-lg)] ${className || ''}`} />
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } = MapComponents;
  const tileUrl = resolvedTheme === 'dark' ? TILES_DARK : TILES_LIGHT;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={`w-full h-full z-0 rounded-[var(--radius-lg)] ${className || ''}`}
      scrollWheelZoom={true}
    >
      <TileLayer url={tileUrl} attribution={ATTR} />
      <ChangeView center={center} useMap={useMap} />
      {onMapClick && <MapEvents onClick={onMapClick} useMapEvents={useMapEvents} />}
      {markers.map((m) => (
        <Marker
          key={m.id}
          position={[m.lat, m.lng]}
          eventHandlers={{
            click: () => onMarkerClick?.(m.id),
          }}
        >
          {m.label && <Popup>{m.label}</Popup>}
        </Marker>
      ))}
    </MapContainer>
  );
}
