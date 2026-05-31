import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status') ?? 'PENDING';
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit  = 20;
  const skip   = (page - 1) * limit;

  // For APPROVED tab, only show user-submitted properties (is_free_listing=true)
  // Admin-created properties also have listing_status=APPROVED but is_free_listing=false
  const where: Record<string, unknown> = { listing_status: status };
  if (status === 'APPROVED') where.is_free_listing = true;

  const [submissions, total] = await Promise.all([
    prisma.property.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        images: { where: { is_primary: true }, take: 1 },
        owner: true,
      },
    }),
    prisma.property.count({ where }),
  ]);

  return NextResponse.json({ submissions, total, page, limit });
}
