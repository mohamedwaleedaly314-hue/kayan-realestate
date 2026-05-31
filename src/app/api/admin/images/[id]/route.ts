import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import { deleteImage } from '@/lib/storage';

interface Params { params: { id: string } }

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const image = await prisma.propertyImage.findUnique({ where: { id: params.id } });
  if (!image) return NextResponse.json({ error: 'الصورة غير موجودة' }, { status: 404 });

  // Delete from storage (Supabase or local)
  await deleteImage(image.url);

  await prisma.propertyImage.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
  }

  const image = await prisma.propertyImage.findUnique({ where: { id: params.id } });
  if (!image) return NextResponse.json({ error: 'الصورة غير موجودة' }, { status: 404 });

  const { is_primary, sort_order, alt_text } = body as Record<string, unknown>;

  if (is_primary === true) {
    await prisma.propertyImage.updateMany({
      where: { property_id: image.property_id, is_primary: true },
      data: { is_primary: false },
    });
  }

  const updated = await prisma.propertyImage.update({
    where: { id: params.id },
    data: {
      ...(is_primary !== undefined && { is_primary: Boolean(is_primary) }),
      ...(sort_order !== undefined && { sort_order: Number(sort_order) }),
      ...(alt_text !== undefined && { alt_text: String(alt_text) }),
    },
  });

  return NextResponse.json(updated);
}
