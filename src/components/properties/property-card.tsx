'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin, Maximize2, BedDouble, Star, Eye,
  TrendingUp, Zap, BarChart3, Check, ArrowLeft,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  formatPrice, formatArea,
  getPropertyTypeLabel, getPropertyStatusLabel,
} from '@/lib/utils';
import FavoriteButton from './favorite-button';
import { useComparison } from '@/hooks/useComparison';

interface PropertyCardProps {
  property: {
    id: string;
    title_ar: string;
    slug: string;
    price: number | string;
    area_m2: number;
    rooms?: number | null;
    floor?: number | null;
    type: string;
    status: string;
    district: string;
    featured: boolean;
    views_count?: number;
    created_at?: Date | string;
    images: Array<{ url: string; alt_text?: string | null; is_primary: boolean }>;
  };
  savedPropertyIds?: string[];
}

function isNew(createdAt?: Date | string): boolean {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
}

export default function PropertyCard({ property, savedPropertyIds = [] }: PropertyCardProps) {
  const primaryImage  = property.images.find(i => i.is_primary) ?? property.images[0];
  const statusVariant = property.status === 'AVAILABLE' ? 'available'
                      : property.status === 'SOLD'      ? 'sold'
                      : 'reserved';
  const typeVariant   = property.type === 'SALE' ? 'sale' : 'rent';
  const isSaved       = savedPropertyIds.includes(property.id);
  const priceNum      = Number(property.price);
  const pricePerM2    = property.area_m2 > 0 ? Math.round(priceNum / property.area_m2) : null;
  const newProperty   = isNew(property.created_at);

  const { toggle, isInComparison, isFull } = useComparison();
  const inCompare = isInComparison(property.id);

  function handleCompare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!inCompare && isFull) return;
    toggle({
      id:       property.id,
      slug:     property.slug,
      title_ar: property.title_ar,
      price:    priceNum,
      area_m2:  property.area_m2,
      rooms:    property.rooms,
      district: property.district,
      type:     property.type,
      image:    primaryImage?.url,
    });
  }

  return (
    <Link href={`/properties/${property.slug}`} className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-2xl">
      <article className="relative overflow-hidden rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-2xl hover:shadow-gold/10 hover:-translate-y-1.5 transition-all duration-500 flex flex-col h-full">

        {/* ── Image ──────────────────────────────────────────── */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
          {primaryImage ? (
            <>
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt_text ?? property.title_ar}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />

              {/* Permanent subtle gradient for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              {/* Hover overlay brightens top */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted/80 to-muted/40 flex items-center justify-center">
              <div className="text-center text-muted-foreground/60">
                <div className="text-5xl mb-2">🏠</div>
                <p className="text-xs font-medium">لا توجد صورة</p>
              </div>
            </div>
          )}

          {/* ── Top-left actions (favorite + compare) ── */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
            <FavoriteButton propertyId={property.id} initialSaved={isSaved} />
            <button
              onClick={handleCompare}
              title={inCompare ? 'إزالة من المقارنة' : isFull ? 'المقارنة ممتلئة (3 عقارات)' : 'إضافة للمقارنة'}
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-all duration-200
                ${inCompare
                  ? 'bg-gold text-white scale-110 shadow-gold/40'
                  : isFull
                    ? 'bg-black/40 text-white/40 cursor-not-allowed'
                    : 'bg-black/50 text-white hover:bg-gold hover:scale-110 hover:shadow-gold/40'
                }`}
            >
              {inCompare ? <Check className="w-3.5 h-3.5" /> : <BarChart3 className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* ── Top-right labels ── */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            <Badge variant={typeVariant} className="shadow-md text-xs font-semibold">
              {getPropertyTypeLabel(property.type)}
            </Badge>
            <Badge variant={statusVariant} className="shadow-md text-xs">
              {getPropertyStatusLabel(property.status)}
            </Badge>
          </div>

          {/* ── Featured / New pill ── */}
          {(property.featured || newProperty) && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
              {property.featured ? (
                <span className="inline-flex items-center gap-1 bg-gold text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-gold/30 ring-1 ring-gold/60">
                  <Star className="w-3 h-3 fill-current" /> مميز
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg ring-1 ring-emerald-400/50">
                  <Zap className="w-3 h-3 fill-current" /> جديد
                </span>
              )}
            </div>
          )}

          {/* ── Views counter ── */}
          {(property.views_count ?? 0) > 0 && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full shadow z-10">
              <Eye className="w-3 h-3 opacity-80" />
              <span>{property.views_count?.toLocaleString('ar-EG')}</span>
            </div>
          )}

          {/* ── Hover CTA bar (slides up from bottom) ── */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 py-3 bg-gold/90 backdrop-blur-sm translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
            <span className="text-black text-sm font-bold">عرض التفاصيل</span>
            <ArrowLeft className="w-4 h-4 text-black" />
          </div>
        </div>

        {/* ── Content ──────────────────────────────────────── */}
        <div className="p-5 flex flex-col flex-1 gap-3">

          {/* Title */}
          <h3 className="font-bold text-foreground text-[15px] leading-relaxed line-clamp-2 group-hover:text-gold transition-colors duration-200">
            {property.title_ar}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
            <span className="truncate">{property.district}</span>
          </div>

          {/* Price — always visible, prominent */}
          <div className="flex items-end justify-between gap-2 pt-1">
            <p className="text-gold font-extrabold text-xl leading-none">
              {formatPrice(property.price)}
            </p>
            {pricePerM2 && (
              <p className="text-muted-foreground text-[11px] leading-none mb-0.5">
                {pricePerM2.toLocaleString('ar-EG')} ج.م/م²
              </p>
            )}
          </div>

          {/* Specs row */}
          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-3 border-t border-border/40 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-gold/80 shrink-0" />
              <span className="font-medium">{formatArea(property.area_m2)}</span>
            </span>
            {property.rooms != null && property.rooms > 0 && (
              <span className="flex items-center gap-1.5">
                <BedDouble className="w-3.5 h-3.5 text-gold/80 shrink-0" />
                <span className="font-medium">{property.rooms} غرف</span>
              </span>
            )}
            {property.floor != null && (
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-gold/80 shrink-0" />
                <span className="font-medium">طابق {property.floor}</span>
              </span>
            )}
          </div>
        </div>

        {/* ── Gold accent line at bottom ── */}
        <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-gold via-amber-300 to-gold transition-all duration-500 ease-out" />
      </article>
    </Link>
  );
}
