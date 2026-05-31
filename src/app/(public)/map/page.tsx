export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { Map, List } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import AllPropertiesMap from '@/components/properties/all-properties-map';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'خريطة العقارات',
  description: 'تصفح جميع عقارات كيان على خريطة تفاعلية لمدينة 15 مايو',
};

export default async function MapPage() {
  const properties = await prisma.property.findMany({
    where: {
      status: 'AVAILABLE',
      NOT: [{ lat: null }, { lng: null }],
    },
    select: {
      id: true, slug: true, title_ar: true, price: true,
      area_m2: true, district: true, type: true, status: true,
      lat: true, lng: true,
    },
    orderBy: { created_at: 'desc' },
  });

  /* safe cast — we've already filtered nulls */
  const mappableProps = properties.map(p => ({
    ...p,
    lat: p.lat!,
    lng: p.lng!,
    price: Number(p.price),
  }));

  return (
    <div className="pt-20 min-h-screen bg-background">
      {/* Header */}
      <div className="bg-navy py-10">
        <div className="container-kayan">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Map className="w-8 h-8 text-gold" />
                خريطة العقارات
              </h1>
              <p className="text-ivory/60 mt-1">
                {mappableProps.length} عقار على الخريطة — مدينة 15 مايو
              </p>
            </div>
            <Button variant="outline" asChild
              className="border-white/30 text-white hover:bg-white/10 hover:text-white gap-2">
              <Link href="/properties">
                <List className="w-4 h-4" />
                عرض القائمة
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container-kayan py-8">
        {mappableProps.length === 0 ? (
          <div className="text-center py-24">
            <Map className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">لا توجد عقارات على الخريطة</h2>
            <p className="text-muted-foreground mb-6">
              العقارات تظهر على الخريطة عند إضافة إحداثيات الموقع (Lat/Lng) لها
            </p>
            <Button variant="gold" asChild>
              <Link href="/properties">تصفح جميع العقارات</Link>
            </Button>
          </div>
        ) : (
          <AllPropertiesMap properties={mappableProps} />
        )}
      </div>
    </div>
  );
}
