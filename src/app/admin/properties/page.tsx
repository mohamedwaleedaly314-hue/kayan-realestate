export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import AdminPropertiesTable from '@/components/admin/properties-table';

interface PageProps {
  searchParams: { page?: string; search?: string; status?: string; type?: string };
}

const PAGE_SIZE = 20;

export default async function AdminPropertiesPage({ searchParams }: PageProps) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10));
  const skip = (page - 1) * PAGE_SIZE;
  const search = searchParams.search ?? '';
  const status = searchParams.status;
  const type = searchParams.type;

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { title_ar: { contains: search, mode: 'insensitive' } },
      { district: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (status && ['AVAILABLE', 'SOLD', 'RESERVED'].includes(status)) where.status = status;
  if (type && ['SALE', 'RENT'].includes(type)) where.type = type;

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      skip,
      take: PAGE_SIZE,
      orderBy: { created_at: 'desc' },
      include: {
        images: { where: { is_primary: true }, take: 1 },
        _count: { select: { leads: true } },
      },
    }),
    prisma.property.count({ where }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة العقارات</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {total} عقار في قاعدة البيانات
          </p>
        </div>
        <Button variant="gold" asChild>
          <Link href="/admin/properties/new" className="gap-2">
            <Plus className="w-4 h-4" />
            إضافة عقار
          </Link>
        </Button>
      </div>

      <AdminPropertiesTable
        properties={properties.map((p) => ({
          ...p,
          price: Number(p.price),
          images: p.images,
          _count: p._count,
        }))}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        searchParams={searchParams}
      />
    </div>
  );
}
