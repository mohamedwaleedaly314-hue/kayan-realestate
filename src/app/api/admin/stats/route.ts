import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function GET() {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const [
    totalProperties,
    availableProperties,
    soldProperties,
    reservedProperties,
    totalLeads,
    newLeads,
    totalViews,
    featuredCount,
  ] = await Promise.all([
    prisma.property.count(),
    prisma.property.count({ where: { status: 'AVAILABLE' } }),
    prisma.property.count({ where: { status: 'SOLD' } }),
    prisma.property.count({ where: { status: 'RESERVED' } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { status: 'NEW' } }),
    prisma.property.aggregate({ _sum: { views_count: true } }),
    prisma.property.count({ where: { featured: true } }),
  ]);

  return NextResponse.json({
    totalProperties,
    availableProperties,
    soldProperties,
    reservedProperties,
    totalLeads,
    newLeads,
    totalViews: totalViews._sum.views_count ?? 0,
    featuredCount,
  });
}
