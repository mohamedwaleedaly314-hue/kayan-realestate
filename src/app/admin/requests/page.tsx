export const dynamic = 'force-dynamic';

import { ClipboardList } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import RequestsTable from '@/components/admin/requests-table';

interface PageProps {
  searchParams: { page?: string; status?: string };
}

const PAGE_SIZE = 20;

export default async function AdminRequestsPage({ searchParams }: PageProps) {
  const page   = Math.max(1, parseInt(searchParams.page ?? '1', 10));
  const status = searchParams.status;
  const skip   = (page - 1) * PAGE_SIZE;

  const where: Record<string, unknown> = {};
  if (status && ['NEW', 'CONTACTED', 'CLOSED'].includes(status)) where.status = status;

  const [requests, total] = await Promise.all([
    prisma.propertyRequest.findMany({
      where, skip, take: PAGE_SIZE,
      orderBy: { created_at: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.propertyRequest.count({ where }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="w-7 h-7 text-gold" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">طلبات العقارات</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{total} طلب إجمالاً</p>
        </div>
      </div>

      <RequestsTable
        requests={requests}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        currentStatus={status}
      />
    </div>
  );
}
