import { prisma } from '@/lib/prisma';
import PropertyCard from './property-card';

interface SimilarPropertiesProps {
  currentId: string;
  district: string;
  type: string;
}

export default async function SimilarProperties({ currentId, district, type }: SimilarPropertiesProps) {
  const properties = await prisma.property.findMany({
    where: {
      id: { not: currentId },
      status: 'AVAILABLE',
      OR: [{ district }, { type }],
    },
    take: 3,
    orderBy: [{ featured: 'desc' }, { created_at: 'desc' }],
    include: {
      images: { where: { is_primary: true }, take: 1 },
    },
  });

  if (properties.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold text-foreground mb-6">عقارات مشابهة</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {properties.map((p) => (
          <PropertyCard
            key={p.id}
            property={{
              ...p,
              price: Number(p.price),
              images: p.images.map((img) => ({ url: img.url, alt_text: img.alt_text, is_primary: img.is_primary })),
            }}
          />
        ))}
      </div>
    </section>
  );
}
