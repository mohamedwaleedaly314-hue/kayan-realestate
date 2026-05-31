import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserSession } from '@/lib/user-auth';

// GET — list user's saved properties
export async function GET() {
  const session = await verifyUserSession();
  if (!session) return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });

  const saves = await prisma.savedProperty.findMany({
    where: { user_id: session.userId },
    orderBy: { created_at: 'desc' },
    include: {
      property: {
        include: {
          images: { where: { is_primary: true }, take: 1 },
        },
      },
    },
  });

  return NextResponse.json({ saves });
}

// POST — toggle save/unsave
export async function POST(req: NextRequest) {
  const session = await verifyUserSession();
  if (!session) return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 }); }

  const { property_id } = body as { property_id: string };
  if (!property_id) return NextResponse.json({ error: 'property_id مطلوب' }, { status: 400 });

  const existing = await prisma.savedProperty.findUnique({
    where: { user_id_property_id: { user_id: session.userId, property_id } },
  });

  if (existing) {
    await prisma.savedProperty.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  } else {
    await prisma.savedProperty.create({ data: { user_id: session.userId, property_id } });
    return NextResponse.json({ saved: true });
  }
}
