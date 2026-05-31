export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import LeadsTable from '@/components/admin/leads-table';

interface PageProps {
  searchParams: { page?: string; status?: string };
}

const PAGE_SIZE = 20;

export default async function AdminLeadsPage({ searchParams }: PageProps) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10));
  const status = searchParams.status;
  const skip = (page - 1) * PAGE_SIZE;

  const where: Record<string, unknown> = {};
  if (status && ['NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED'].includes(status)) {
    where.status = status;
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      skip,
      take: PAGE_SIZE,
      orderBy: { created_at: 'desc' },
      include: {
        property: {
          select: {
            title_ar: true, slug: true,
            owner: { select: { name: true, phone: true, whatsapp: true } },
          },
        },
      },
    }),
    prisma.lead.count({ where }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">الليدز والاستفسارات</h1>
        <p className="text-muted-foreground text-sm mt-1">{total} استفسار إجمالاً</p>
      </div>

      <LeadsTable
        leads={leads}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        currentStatus={status}
      />
    </div>
  );
}
