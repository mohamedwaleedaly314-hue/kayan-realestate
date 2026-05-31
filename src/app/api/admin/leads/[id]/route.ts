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
    status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED']).optional(),
    admin_notes: z.string().max(2000).optional(),
  });

  const result = schema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });

  const lead = await prisma.lead.update({
    where: { id: params.id },
    data: result.data,
  });

  return NextResponse.json(lead);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  await prisma.lead.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
