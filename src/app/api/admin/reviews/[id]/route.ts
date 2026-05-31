import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if ('is_approved' in body)  data.is_approved  = Boolean(body.is_approved);
  if ('is_featured' in body)  data.is_featured  = Boolean(body.is_featured);

  const review = await prisma.review.update({ where: { id: params.id }, data });
  return NextResponse.json({ success: true, review });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  await prisma.review.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
