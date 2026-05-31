import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserSession } from '@/lib/user-auth';
import { z } from 'zod';

const schema = z.object({
  email:     z.string().email(),
  type:      z.string().optional(),
  district:  z.string().optional(),
  min_price: z.number().optional(),
  max_price: z.number().optional(),
  rooms:     z.number().optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
  }

  const result = schema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: result.error.errors[0]?.message ?? 'بيانات غير صالحة' }, { status: 400 });

  const session = await verifyUserSession();
  const user_id = session?.userId ?? null;

  /* prevent duplicate alert for same user/email + same filters */
  const existing = await prisma.searchAlert.findFirst({
    where: {
      email:    result.data.email,
      type:     result.data.type    ?? null,
      district: result.data.district ?? null,
    },
  });
  if (existing) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const alert = await prisma.searchAlert.create({
    data: {
      user_id,
      email:     result.data.email,
      type:      result.data.type    ?? null,
      district:  result.data.district ?? null,
      min_price: result.data.min_price ?? null,
      max_price: result.data.max_price ?? null,
      rooms:     result.data.rooms    ?? null,
    },
  });

  return NextResponse.json(alert);
}

export async function GET() {
  const session = await verifyUserSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const alerts = await prisma.searchAlert.findMany({
    where:   { user_id: session.userId, is_active: true },
    orderBy: { created_at: 'desc' },
  });

  return NextResponse.json(alerts);
}
