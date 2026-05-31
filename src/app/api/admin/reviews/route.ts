import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const status = req.nextUrl.searchParams.get('status') ?? 'pending';
  const where = status === 'pending' ? { is_approved: false } : { is_approved: true };

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { created_at: 'desc' },
  });
  return NextResponse.json({ reviews });
}
