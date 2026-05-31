export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import type { Metadata } from 'next';
import PropertiesList from '@/components/properties/properties-list';
import PropertiesFilters from '@/components/properties/properties-filters';
import PropertyCardSkeleton from '@/components/properties/property-card-skeleton';
import SaveSearch from '@/components/properties/save-search';

export const metadata: Metadata = {
  title: 'العقارات',
  description: 'تصفح جميع العقارات المتاحة للبيع والإيجار في مدينة 15 مايو',
};

interface PageProps {
  searchParams: {
    type?: string;
    status?: string;
    district?: string;
    min_price?: string;
    max_price?: string;
    rooms?: string;
    search?: string;
    sort?: string;
    page?: string;
  };
}

export default function PropertiesPage({ searchParams }: PageProps) {
  return (
    <div className="pt-20 min-h-screen bg-background">
      <div className="bg-navy py-12">
        <div className="container-kayan text-center text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">العقارات المتاحة</h1>
              <p className="text-ivory/70">اكتشف أفضل العروض العقارية في مدينة 15 مايو</p>
            </div>
            <SaveSearch filters={searchParams} />
          </div>
        </div>
      </div>

      <div className="container-kayan py-8">
        <PropertiesFilters initialFilters={searchParams} />

        <Suspense
          key={JSON.stringify(searchParams)}
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {Array.from({ length: 9 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <PropertiesList searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
