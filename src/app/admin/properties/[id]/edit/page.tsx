import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import PropertyForm from '@/components/admin/property-form';

interface PageProps { params: { id: string } }

export const metadata: Metadata = { title: 'تعديل عقار' };

export default async function EditPropertyPage({ params }: PageProps) {
  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: {
      images: { orderBy: [{ is_primary: 'desc' }, { sort_order: 'asc' }] },
      owner: true,
    },
  });

  if (!property) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">تعديل العقار</h1>
        <p className="text-muted-foreground text-sm mt-1 truncate">{property.title_ar}</p>
      </div>
      <PropertyForm
        initialData={{
          ...property,
          price: Number(property.price),
          images: property.images,
          owner: property.owner ?? null,
        }}
      />
    </div>
  );
}
