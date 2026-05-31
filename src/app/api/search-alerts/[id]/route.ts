import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserSession } from '@/lib/user-auth';

interface Params { params: { id: string } }

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await verifyUserSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  await prisma.searchAlert.updateMany({
    where: { id: params.id, user_id: session.userId },
    data:  { is_active: false },
  });

  return NextResponse.json({ ok: true });
}
