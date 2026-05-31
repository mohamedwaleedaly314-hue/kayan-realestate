'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Clock } from 'lucide-react';

interface RecentProperty {
  id: string;
  title_ar: string;
  slug: string;
  price: number;
  district: string;
  type: string;
  primaryImage?: string;
}

interface RecentlyViewedProps {
  currentId: string;
}

const KEY = 'kayan_recently_viewed';
const MAX = 6;

export function trackView(property: RecentProperty) {
  if (typeof window === 'undefined') return;
  try {
    const stored: RecentProperty[] = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    const filtered = stored.filter((p) => p.id !== property.id);
    const next = [property, ...filtered].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch { /* ignore */ }
}

export default function RecentlyViewed({ currentId }: RecentlyViewedProps) {
  const [items, setItems] = useState<RecentProperty[]>([]);

  useEffect(() => {
    try {
      const stored: RecentProperty[] = JSON.parse(localStorage.getItem(KEY) ?? '[]');
      setItems(stored.filter((p) => p.id !== currentId).slice(0, 4));
    } catch { /* ignore */ }
  }, [currentId]);

  if (items.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="flex items-center gap-2 mb-5">
        <Clock className="w-5 h-5 text-gold" />
        <h2 className="text-xl font-bold text-foreground">شاهدتها مؤخراً</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((p) => (
          <Link key={p.id} href={`/properties/${p.slug}`} className="group">
            <div className="luxury-card overflow-hidden">
              <div className="relative aspect-[4/3]">
                {p.primaryImage ? (
                  <Image
                    src={p.primaryImage} alt={p.title_ar} fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="25vw"
                  />
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}
                <div className="absolute top-2 right-2 text-xs bg-black/60 text-white px-2 py-0.5 rounded-full">
                  {p.type === 'SALE' ? 'بيع' : 'إيجار'}
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs font-medium line-clamp-2 group-hover:text-gold transition-colors leading-relaxed">
                  {p.title_ar}
                </p>
                <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1.5">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{p.district}</span>
                </div>
                <p className="text-gold font-bold text-sm mt-1.5">
                  {p.price.toLocaleString('ar-EG')} ج.م
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
