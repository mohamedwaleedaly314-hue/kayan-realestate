'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MapPin, List, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapProperty {
  id:       string;
  slug:     string;
  title_ar: string;
  price:    number;
  area_m2:  number;
  district: string;
  type:     string;
  status:   string;
  lat:      number;
  lng:      number;
}

interface AllPropertiesMapProps {
  properties: MapProperty[];
}

export default function AllPropertiesMap({ properties }: AllPropertiesMapProps) {
  const mapRef    = useRef<HTMLDivElement>(null);
  const initRef   = useRef(false);
  const [selected, setSelected] = useState<MapProperty | null>(null);

  useEffect(() => {
    if (initRef.current || !mapRef.current) return;
    initRef.current = true;

    /* center on 15 Mayo City */
    const CENTER: [number, number] = [29.9285, 31.3207];

    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (!mapRef.current) return;
      const map = L.map(mapRef.current, { scrollWheelZoom: true }).setView(CENTER, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      properties.forEach(p => {
        const isSale    = p.type === 'SALE';
        const color     = isSale ? '#B8860B' : '#2B5281';
        const typeLabel = isSale ? 'بيع' : 'إيجار';

        const icon = L.divIcon({
          html: `<div style="
            background:${color}; color:white; font-size:10px; font-weight:700;
            padding:3px 7px; border-radius:12px; white-space:nowrap;
            box-shadow:0 2px 6px rgba(0,0,0,0.3); border:2px solid white;
            font-family:Cairo,sans-serif;
          ">${typeLabel}</div>`,
          className: '',
          iconAnchor: [20, 12],
          popupAnchor: [0, -16],
        });

        L.marker([p.lat, p.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div dir="rtl" style="font-family:Cairo,sans-serif; min-width:180px;">
              <p style="font-weight:700; font-size:13px; margin:0 0 4px; color:#1A2B4A">${p.title_ar}</p>
              <p style="font-size:12px; color:#666; margin:0 0 6px">📍 ${p.district}</p>
              <p style="font-size:14px; font-weight:700; color:#B8860B; margin:0 0 8px">
                ${p.price.toLocaleString('ar-EG')} ج.م
              </p>
              <a href="/properties/${p.slug}"
                 style="display:block; background:#B8860B; color:white; text-align:center;
                        padding:6px; border-radius:6px; text-decoration:none; font-size:12px; font-weight:600">
                عرض التفاصيل ←
              </a>
            </div>
          `, { maxWidth: 220 });
      });
    });
  }, [properties]);

  return (
    <div className="relative">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />

      {/* Legend */}
      <div className="absolute top-4 right-4 z-[999] bg-card/95 backdrop-blur-sm rounded-xl border border-border shadow-lg p-3 text-xs space-y-1.5">
        <p className="font-semibold text-foreground mb-2">الخريطة</p>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-gold text-white font-bold text-[10px]">بيع</span>
          <span className="text-muted-foreground">عقارات للبيع</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-navy text-white font-bold text-[10px]">إيجار</span>
          <span className="text-muted-foreground">عقارات للإيجار</span>
        </div>
        <p className="text-muted-foreground border-t border-border pt-1.5 mt-1">
          {properties.length} عقار على الخريطة
        </p>
      </div>

      <div ref={mapRef} className="w-full h-[600px] rounded-2xl overflow-hidden" />

      {selected && (
        <div className="mt-3 p-4 bg-card border border-border rounded-xl flex items-center justify-between">
          <div>
            <p className="font-semibold">{selected.title_ar}</p>
            <p className="text-sm text-muted-foreground">{selected.district} • {selected.price.toLocaleString('ar-EG')} ج.م</p>
          </div>
          <Button variant="gold" size="sm" asChild>
            <Link href={`/properties/${selected.slug}`}>عرض</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
