import { MapPin, Maximize2, BedDouble, Layers, CheckCircle2, Eye, Clock, Calendar, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatArea, getPropertyTypeLabel, getPropertyStatusLabel, formatDate } from '@/lib/utils';

interface Property {
  id: string;
  title_ar: string;
  description_ar?: string | null;
  price: number;
  area_m2: number;
  rooms?: number | null;
  floor?: number | null;
  has_elevator: boolean;
  type: string;
  status: string;
  district: string;
  views_count: number;
  created_at: Date;
  // Viewing schedule (set by owner)
  viewing_days?: string | null;     // JSON string
  viewing_time_from?: string | null;
  viewing_time_to?: string | null;
}

export default function PropertyDetails({ property }: { property: Property }) {
  const statusVariant = property.status === 'AVAILABLE' ? 'available' : property.status === 'SOLD' ? 'sold' : 'reserved';

  return (
    <div className="luxury-card p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant={property.type === 'SALE' ? 'sale' : 'rent'}>
            {getPropertyTypeLabel(property.type)}
          </Badge>
          <Badge variant={statusVariant}>{getPropertyStatusLabel(property.status)}</Badge>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-relaxed">
          {property.title_ar}
        </h1>
        <div className="flex items-center gap-2 text-muted-foreground text-sm mt-2">
          <MapPin className="w-4 h-4 text-gold" />
          {property.district} — مدينة 15 مايو
          <span className="mr-auto flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {property.views_count.toLocaleString('ar-EG')} مشاهدة
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="bg-gold/10 rounded-xl p-4">
        <p className="text-sm text-muted-foreground mb-1">السعر</p>
        <p className="text-3xl font-bold text-gold">{formatPrice(property.price)}</p>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-muted/50 rounded-xl">
          <Maximize2 className="w-5 h-5 mx-auto text-gold mb-2" />
          <p className="text-sm text-muted-foreground">المساحة</p>
          <p className="font-bold">{formatArea(property.area_m2)}</p>
        </div>
        {property.rooms != null && (
          <div className="text-center p-4 bg-muted/50 rounded-xl">
            <BedDouble className="w-5 h-5 mx-auto text-gold mb-2" />
            <p className="text-sm text-muted-foreground">الغرف</p>
            <p className="font-bold">{property.rooms} غرف</p>
          </div>
        )}
        {property.floor != null && (
          <div className="text-center p-4 bg-muted/50 rounded-xl">
            <Layers className="w-5 h-5 mx-auto text-gold mb-2" />
            <p className="text-sm text-muted-foreground">الطابق</p>
            <p className="font-bold">الطابق {property.floor}</p>
          </div>
        )}
        <div className="text-center p-4 bg-muted/50 rounded-xl">
          <CheckCircle2 className={`w-5 h-5 mx-auto mb-2 ${property.has_elevator ? 'text-green-500' : 'text-muted-foreground'}`} />
          <p className="text-sm text-muted-foreground">مصعد</p>
          <p className="font-bold">{property.has_elevator ? 'يوجد' : 'لا يوجد'}</p>
        </div>
      </div>

      {/* Description */}
      {property.description_ar && (
        <div>
          <h3 className="font-bold text-lg mb-3">وصف العقار</h3>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {property.description_ar}
          </p>
        </div>
      )}

      {/* Viewing schedule */}
      {(property.viewing_days || property.viewing_time_from) && (() => {
        const days = property.viewing_days
          ? (() => { try { return JSON.parse(property.viewing_days!); } catch { return []; } })()
          : [];
        return (
          <div className="border border-border rounded-xl p-4">
            <h3 className="font-bold text-base mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gold" />
              مواعيد المعاينة
            </h3>
            {days.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {(days as string[]).map((d: string) => (
                  <span key={d} className="px-3 py-1 bg-gold/10 text-gold border border-gold/25 rounded-full text-xs font-semibold">
                    {d}
                  </span>
                ))}
              </div>
            )}
            {(property.viewing_time_from || property.viewing_time_to) && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold shrink-0" />
                {property.viewing_time_from && `من ${property.viewing_time_from}`}
                {property.viewing_time_to   && ` حتى ${property.viewing_time_to}`}
              </p>
            )}
            <div className="mt-3 p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                لحجز موعد معاينة — تواصل مع مكتب كيان للعقارات
              </p>
            </div>
          </div>
        );
      })()}

      <p className="text-xs text-muted-foreground">
        أُضيف في {formatDate(property.created_at)}
      </p>
    </div>
  );
}
