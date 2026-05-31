import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserSession } from '@/lib/user-auth';
import { sendPropertyRequestNotification } from '@/lib/email';
import { z } from 'zod';

const schema = z.object({
  name:      z.string().min(2).max(100),
  phone:     z.string().min(8).max(20),
  email:     z.string().email().optional().or(z.literal('')),
  type:      z.enum(['SALE', 'RENT']).default('SALE'),
  district:  z.string().optional(),
  min_price: z.number().optional(),
  max_price: z.number().optional(),
  rooms:     z.number().int().optional(),
  notes:     z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 }); }

  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors[0]?.message ?? 'بيانات غير صالحة' }, { status: 400 });
  }

  const session = await verifyUserSession();

  const request = await prisma.propertyRequest.create({
    data: {
      ...result.data,
      email:   result.data.email || null,
      user_id: session?.userId ?? null,
    },
  });

  // Email admin with full details
  sendPropertyRequestNotification({
    name:      result.data.name,
    phone:     result.data.phone,
    type:      result.data.type,
    district:  result.data.district,
    min_price: result.data.min_price,
    max_price: result.data.max_price,
    rooms:     result.data.rooms,
    notes:     result.data.notes,
  }).catch(() => {});

  return NextResponse.json(request, { status: 201 });
}
