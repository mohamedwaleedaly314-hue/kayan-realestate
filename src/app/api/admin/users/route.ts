import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function GET() {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const users = await prisma.user.findMany({
    orderBy: { created_at: 'desc' },
    select: {
      id: true, name: true, email: true, phone: true, created_at: true,
      _count: { select: { saves: true, leads: true } },
    },
  });

  return NextResponse.json({ users, total: users.length });
}
