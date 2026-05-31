import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import PropertyCard from './property-card';

const PAGE_SIZE = 12;

type SortKey = 'featured' | 'newest' | 'price_asc' | 'price_desc' | 'area_asc' | 'area_desc' | 'views';

function getOrderBy(sort?: string): Record<string, unknown>[] {
  switch (sort as SortKey) {
    case 'newest':     return [{ created_at: 'desc' }];
    case 'price_asc':  return [{ price: 'asc' }];
    case 'price_desc': return [{ price: 'desc' }];
    case 'area_asc':   return [{ area_m2: 'asc' }];
    case 'area_desc':  return [{ area_m2: 'desc' }];
    case 'views':      return [{ views_count: 'desc' }];
    default:           return [{ featured: 'desc' }, { created_at: 'desc' }];
  }
}

interface PropertiesListProps {
  searchParams: {
    type?: string;
    status?: string;
    district?: string;
    min_price?: string;
    max_price?: string;
    min_area?: string;
    max_area?: string;
    rooms?: string;
    floor?: string;
    elevator?: string;
    featured?: string;
    search?: string;
    sort?: string;
    page?: string;
  };
}

export default async function PropertiesList({ searchParams }: PropertiesListProps) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where: Record<string, unknown> = {
    listing_status: 'APPROVED', // only show admin-approved listings publicly
  };

  if (searchParams.type && ['SALE', 'RENT'].includes(searchParams.type)) {
    where.type = searchParams.type;
  }
  if (searchParams.status && ['AVAILABLE', 'SOLD', 'RESERVED'].includes(searchParams.status)) {
    where.status = searchParams.status;
  }
  if (searchParams.district) {
    where.district = searchParams.district;
  }
  if (searchParams.rooms) {
    const rooms = parseInt(searchParams.rooms, 10);
    if (!isNaN(rooms)) {
      // '5' in filter means "5 and above" (٥+ غرف)
      where.rooms = rooms >= 5 ? { gte: 5 } : rooms;
    }
  }
  if (searchParams.search) {
    where.OR = [
      { title_ar: { contains: searchParams.search } },
      { district: { contains: searchParams.search } },
      { description_ar: { contains: searchParams.search } },
    ];
  }
  if (searchParams.min_price || searchParams.max_price) {
    const priceFilter: Record<string, number> = {};
    if (searchParams.min_price) priceFilter.gte = parseFloat(searchParams.min_price);
    if (searchParams.max_price) priceFilter.lte = parseFloat(searchParams.max_price);
    where.price = priceFilter;
  }
  if (searchParams.min_area || searchParams.max_area) {
    const areaFilter: Record<string, number> = {};
    if (searchParams.min_area) areaFilter.gte = parseFloat(searchParams.min_area);
    if (searchParams.max_area) areaFilter.lte = parseFloat(searchParams.max_area);
    where.area_m2 = areaFilter;
  }
  if (searchParams.floor) {
    const floor = parseInt(searchParams.floor, 10);
    if (!isNaN(floor)) {
      // '5' means "5th floor and above" (خامس+)
      where.floor = floor >= 5 ? { gte: floor } : floor;
    }
  }
  if (searchParams.elevator && searchParams.elevator !== '0') {
    where.has_elevator = true;
  }
  if (searchParams.featured && searchParams.featured !== '0') {
    where.featured = true;
  }

  const orderBy = getOrderBy(searchParams.sort);

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      skip,
      take: PAGE_SIZE,
      // eslint-disable-next-line
      orderBy: orderBy as unknown as never,
      select: {
        id: true, title_ar: true, slug: true, price: true,
        area_m2: true, rooms: true, floor: true, type: true,
        status: true, district: true, featured: true,
        views_count: true, created_at: true,
        images: {
          where: { is_primary: true },
          take: 1,
          select: { url: true, alt_text: true, is_primary: true },
        },
      },
    }),
    prisma.property.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (properties.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-6xl mb-4">🏠</p>
        <h3 className="text-xl font-bold text-foreground mb-2">لا توجد عقارات</h3>
        <p className="text-muted-foreground mb-4">جرّب تغيير معايير البحث أو الفلاتر</p>
        <Button variant="gold" asChild>
          <Link href="/properties">عرض الكل</Link>
        </Button>
      </div>
    );
  }

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (searchParams.type)      params.set('type',      searchParams.type);
    if (searchParams.status)    params.set('status',    searchParams.status);
    if (searchParams.district)  params.set('district',  searchParams.district);
    if (searchParams.rooms)     params.set('rooms',     searchParams.rooms);
    if (searchParams.floor)     params.set('floor',     searchParams.floor);
    if (searchParams.search)    params.set('search',    searchParams.search);
    if (searchParams.sort)      params.set('sort',      searchParams.sort);
    if (searchParams.min_price) params.set('min_price', searchParams.min_price);
    if (searchParams.max_price) params.set('max_price', searchParams.max_price);
    if (searchParams.min_area)  params.set('min_area',  searchParams.min_area);
    if (searchParams.max_area)  params.set('max_area',  searchParams.max_area);
    if (searchParams.elevator)  params.set('elevator',  searchParams.elevator);
    if (searchParams.featured)  params.set('featured',  searchParams.featured);
    params.set('page', String(p));
    return `/properties?${params.toString()}`;
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          عرض <strong className="text-foreground">{skip + 1}–{Math.min(skip + PAGE_SIZE, total)}</strong> من{' '}
          <strong className="text-foreground">{total}</strong> عقار
        </p>
        {totalPages > 1 && (
          <p className="text-xs text-muted-foreground">صفحة {page} من {totalPages}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={{
              ...property,
              price: Number(property.price),
              images: property.images,
            }}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <Button variant="outline" size="sm" disabled={page <= 1} asChild={page > 1}>
            {page > 1 ? (
              <Link href={buildPageUrl(page - 1)}>
                <ChevronRight className="w-4 h-4 ml-1" /> السابق
              </Link>
            ) : (
              <span><ChevronRight className="w-4 h-4 ml-1" /> السابق</span>
            )}
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.min(
                Math.max(page - 2, 1) + i,
                totalPages - Math.min(5, totalPages) + i + 1
              );
              if (p < 1 || p > totalPages) return null;
              return (
                <Button key={p} variant={p === page ? 'gold' : 'outline'} size="sm" asChild={p !== page}>
                  {p !== page ? <Link href={buildPageUrl(p)}>{p}</Link> : <span>{p}</span>}
                </Button>
              );
            })}
          </div>

          <Button variant="outline" size="sm" disabled={page >= totalPages} asChild={page < totalPages}>
            {page < totalPages ? (
              <Link href={buildPageUrl(page + 1)}>
                التالي <ChevronLeft className="w-4 h-4 mr-1" />
              </Link>
            ) : (
              <span>التالي <ChevronLeft className="w-4 h-4 mr-1" /></span>
            )}
          </Button>
        </div>
      )}
    </>
  );
}
