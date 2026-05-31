export const dynamic = 'force-dynamic';
import AdminReviewsClient from './AdminReviewsClient';
import { prisma } from '@/lib/prisma';

export default async function AdminReviewsPage() {
  const [pending, approved] = await Promise.all([
    prisma.review.count({ where: { is_approved: false } }),
    prisma.review.count({ where: { is_approved: true } }),
  ]);
  return <AdminReviewsClient initialCounts={{ pending, approved }} />;
}
