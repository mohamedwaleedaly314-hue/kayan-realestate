import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserSession } from '@/lib/user-auth';

// GET /api/notifications — fetch notifications for logged-in user
export async function GET() {
  const session = await verifyUserSession();
  if (!session) return NextResponse.json({ notifications: [] });

  const notifications = await prisma.notification.findMany({
    where:   { user_id: session.userId },
    orderBy: { created_at: 'desc' },
    take:    30,
  });

  return NextResponse.json({ notifications });
}

// PATCH /api/notifications — mark all as read (or specific IDs)
export async function PATCH(req: NextRequest) {
  const session = await verifyUserSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  let ids: string[] | undefined;
  try {
    const body = await req.json();
    ids = Array.isArray(body.ids) ? body.ids : undefined;
  } catch { /* mark all */ }

  await prisma.notification.updateMany({
    where: {
      user_id: session.userId,
      ...(ids ? { id: { in: ids } } : {}),
    },
    data: { is_read: true },
  });

  return NextResponse.json({ success: true });
}
