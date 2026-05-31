export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import AdminSubmissionsClient from './AdminSubmissionsClient';

async function getCounts() {
  const [pending, approved, rejected] = await Promise.all([
    prisma.property.count({ where: { listing_status: 'PENDING' } }),
    prisma.property.count({ where: { listing_status: 'APPROVED', is_free_listing: true } }),
    prisma.property.count({ where: { listing_status: 'REJECTED' } }),
  ]);
  return { pending, approved, rejected };
}

export default async function AdminSubmissionsPage() {
  const counts = await getCounts();
  return <AdminSubmissionsClient initialCounts={counts} />;
}
