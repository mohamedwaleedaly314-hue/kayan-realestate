import { NextResponse } from 'next/server';
import { verifyUserSession } from '@/lib/user-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await verifyUserSession();
  if (!session) {
    return NextResponse.json({ user: null }, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, phone: true, avatar_url: true, created_at: true, _count: { select: { saves: true, leads: true } } },
  });

  return NextResponse.json({ user }, {
    headers: { 'Cache-Control': 'private, max-age=60' }, // cache 60s per user
  });
}
