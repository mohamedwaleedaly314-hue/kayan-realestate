import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import { z } from 'zod';

interface Params { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
  }

  const schema = z.object({
    status: z.enum(['NEW', 'CONTACTED', 'CLOSED']),
  });

  const result = schema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: 'حالة غير صالحة' }, { status: 400 });

  const request = await prisma.propertyRequest.update({
    where: { id: params.id },
    data:  { status: result.data.status },
  });

  return NextResponse.json(request);
}
