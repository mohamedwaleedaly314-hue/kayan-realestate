import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import { z } from 'zod';

const imageSchema = z.object({
  property_id: z.string().min(1),
  url: z.string().min(1), // accept both full URLs (Supabase) and relative paths (/uploads/...)
  alt_text: z.string().max(200).optional().nullable(),
  sort_order: z.number().int().min(0).default(0),
  is_primary: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
  }

  const result = imageSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 });
  }

  const { property_id, url, alt_text, sort_order, is_primary } = result.data;

  // If this is primary, remove primary flag from other images
  if (is_primary) {
    await prisma.propertyImage.updateMany({
      where: { property_id, is_primary: true },
      data: { is_primary: false },
    });
  }

  const image = await prisma.propertyImage.create({
    data: { property_id, url, alt_text: alt_text ?? null, sort_order, is_primary },
  });

  return NextResponse.json(image, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
  }

  // Bulk reorder
  const reorderSchema = z.array(z.object({ id: z.string().min(1), sort_order: z.number().int() }));
  const result = reorderSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });

  await Promise.all(
    result.data.map(({ id, sort_order }) =>
      prisma.propertyImage.update({ where: { id }, data: { sort_order } })
    )
  );

  return NextResponse.json({ success: true });
}
