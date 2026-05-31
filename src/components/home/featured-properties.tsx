import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import PropertyCard from '@/components/properties/property-card';
import { Button } from '@/components/ui/button';

async function getFeaturedProperties() {
  return prisma.property.findMany({
    where: { featured: true, status: 'AVAILABLE', listing_status: 'APPROVED' },
    take: 6,
    orderBy: { created_at: 'desc' },
    include: {
      images: {
        orderBy: [{ is_primary: 'desc' }, { sort_order: 'asc' }],
        take: 1,
      },
    },
  });
}

export default async function FeaturedProperties() {
  const properties = await getFeaturedProperties();

  if (properties.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>لا توجد عقارات مميزة حالياً</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={{
              ...property,
              price: Number(property.price),
              rooms: property.rooms,
              images: property.images.map((img) => ({
                url: img.url,
                alt_text: img.alt_text,
                is_primary: img.is_primary,
              })),
            }}
          />
        ))}
      </div>
      <div className="text-center mt-10">
        <Button variant="outline" size="lg" asChild>
          <Link href="/properties" className="gap-2">
            عرض جميع العقارات
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </>
  );
}
