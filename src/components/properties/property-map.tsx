'use client';

import { useEffect, useRef } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

interface PropertyMapProps {
  lat: number;
  lng: number;
  title: string;
}

export default function PropertyMap({ lat, lng, title }: PropertyMapProps) {
  const mapRef  = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  useEffect(() => {
    if (initRef.current || !mapRef.current) return;
    initRef.current = true;

    /* dynamic import to avoid SSR issues */
    import('leaflet').then((L) => {
      /* fix default icon path */
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (!mapRef.current) return;

      const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false }).setView([lat, lng], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      /* gold custom marker */
      const icon = L.divIcon({
        html: `<div style="
          background:#B8860B; width:36px; height:36px; border-radius:50% 50% 50% 0;
          transform:rotate(-45deg); border:3px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.35);
        ">
          <div style="transform:rotate(45deg); color:white; font-size:16px; display:flex; align-items:center; justify-content:center; height:100%;">🏠</div>
        </div>`,
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -38],
      });

      L.marker([lat, lng], { icon })
        .addTo(map)
        .bindPopup(`<div dir="rtl" style="font-family:Cairo,sans-serif;font-size:13px;font-weight:600;padding:4px 2px">${title}</div>`, { maxWidth: 220 })
        .openPopup();
    });
  }, [lat, lng, title]);

  return (
    <div className="luxury-card overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gold" />
          <h3 className="font-bold">موقع العقار</h3>
        </div>
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
          className="text-xs text-gold hover:underline flex items-center gap-1">
          فتح في خرائط جوجل
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      {/* leaflet CSS */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
      <div ref={mapRef} className="w-full h-64" />
    </div>
  );
}
