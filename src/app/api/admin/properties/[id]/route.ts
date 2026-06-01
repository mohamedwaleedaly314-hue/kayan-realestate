import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import { propertySchema, ownerSchema } from '@/lib/validations';

interface Params { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: {
      images: { orderBy: [{ is_primary: 'desc' }, { sort_order: 'asc' }] },
      owner: true,
    },
  });

  if (!property) return NextResponse.json({ error: 'العقار غير موجود' }, { status: 404 });

  return NextResponse.json(property);
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

  const partialSchema = propertySchema.partial().extend({
    owner: ownerSchema.partial().optional(),
  });

  const result = partialSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message ?? 'بيانات غير صالحة' },
      { status: 400 }
    );
  }

  const { owner, ...propertyData } = result.data;

  // Check slug uniqueness if slug is being changed
  if (propertyData.slug) {
    const existing = await prisma.property.findFirst({
      where: { slug: propertyData.slug, NOT: { id: params.id } },
    });
    if (existing) {
      return NextResponse.json({ error: 'الـ slug مستخدم بالفعل' }, { status: 409 });
    }
  }

  const property = await prisma.property.update({
    where: { id: params.id },
    data: {
      ...propertyData,
      owner: owner
        ? {
            upsert: {
              create: {
                name: owner.name ?? null,
                whatsapp: owner.whatsapp ?? null,
                facebook_url: owner.facebook_url ?? null,
                instagram_url: owner.instagram_url ?? null,
                tiktok_url: owner.tiktok_url ?? null,
                youtube_url: owner.youtube_url ?? null,
                twitter_url: owner.twitter_url ?? null,
                notes: owner.notes ?? null,
                show_contact: owner.show_contact ?? false,
              },
              update: {
                name: owner.name,
                whatsapp: owner.whatsapp,
                facebook_url: owner.facebook_url,
                instagram_url: owner.instagram_url,
                tiktok_url: owner.tiktok_url,
                youtube_url: owner.youtube_url,
                twitter_url: owner.twitter_url,
                notes: owner.notes,
                show_contact: owner.show_contact,
              },
            },
          }
        : undefined,
    },
    include: { images: true, owner: true },
  });

  revalidatePath('/admin/properties');
  revalidatePath('/');
  revalidatePath('/properties');
  if (property.slug) revalidatePath(`/properties/${property.slug}`);

  return NextResponse.json(property);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const existing = await prisma.property.findUnique({
    where: { id: params.id },
    select: { id: true, slug: true },
  });
  if (!existing) return NextResponse.json({ error: 'العقار غير موجود' }, { status: 404 });

  try {
    // Remove related rows first so a foreign-key constraint can never block
    // the delete (regardless of how cascade is configured in the DB).
    await prisma.propertyImage.deleteMany({ where: { property_id: params.id } });
    await prisma.savedProperty.deleteMany({ where: { property_id: params.id } });
    await prisma.propertyOwner.deleteMany({ where: { property_id: params.id } });
    // Keep leads for the record, just detach them from the deleted property.
    await prisma.lead.updateMany({ where: { property_id: params.id }, data: { property_id: null } });

    await prisma.property.delete({ where: { id: params.id } });
  } catch (err) {
    console.error('[admin/properties][DELETE]', err);
    return NextResponse.json({ error: 'تعذّر حذف العقار' }, { status: 500 });
  }

  // Update the cached lists immediately so the property disappears at once.
  revalidatePath('/admin/properties');
  revalidatePath('/');
  revalidatePath('/properties');
  revalidatePath(`/properties/${existing.slug}`);

  return NextResponse.json({ success: true });
}
