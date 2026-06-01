import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import { z } from 'zod';

const actionSchema = z.object({
  action:           z.enum(['approve', 'reject']),
  rejection_reason: z.string().max(500).optional().nullable(),
  featured:         z.boolean().optional(),
});

interface Params { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 }); }

  const result = actionSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 });
  }

  const { action, rejection_reason, featured } = result.data;

  const property = await prisma.property.findUnique({
    where:   { id: params.id },
    include: { owner: true },
  });
  if (!property) return NextResponse.json({ error: 'العقار غير موجود' }, { status: 404 });

  const updated = await prisma.property.update({
    where: { id: params.id },
    data: {
      listing_status:   action === 'approve' ? 'APPROVED' : 'REJECTED',
      rejection_reason: action === 'reject'  ? (rejection_reason ?? null) : null,
      featured: action === 'approve' && featured ? true : property.featured,
    },
  });

  const owner = property.owner;

  if (action === 'approve') {
    // 1. WhatsApp to owner
    if (owner?.whatsapp || owner?.phone) {
      const ownerContact = owner.whatsapp || owner.phone!;
      import('@/lib/whatsapp').then(({ notifyOwnerApproved }) =>
        notifyOwnerApproved({
          ownerPhone:    ownerContact,
          ownerName:     owner?.name,
          propertyTitle: property.title_ar,
          propertySlug:  property.slug,
        })
      ).catch(() => {});
    }

    // 2. Email to owner (if they provided an email)
    const ownerEmail = owner?.email ?? (owner?.user_id
      ? await prisma.user.findUnique({ where: { id: owner.user_id }, select: { email: true } }).then(u => u?.email ?? null)
      : null);

    if (ownerEmail) {
      import('@/lib/email').then(({ sendListingApprovedEmail }) =>
        sendListingApprovedEmail({
          toEmail:       ownerEmail,
          ownerName:     owner?.name,
          propertyTitle: property.title_ar,
          propertySlug:  property.slug,
        })
      ).catch(() => {});
    }

    // 3. In-site notification (if owner is a registered user)
    if (owner?.user_id) {
      prisma.notification.create({
        data: {
          user_id: owner.user_id,
          type:    'LISTING_APPROVED',
          title:   '✅ تمت الموافقة على إعلانك',
          message: `تمت مراجعة إعلانك "${property.title_ar}" وقبوله. إعلانك الآن ظاهر للعملاء.`,
          link:    `/properties/${property.slug}`,
        },
      }).catch(() => {});
    }
  }

  if (action === 'reject') {
    // 1. Email to owner on rejection
    const ownerEmail = owner?.email ?? (owner?.user_id
      ? await prisma.user.findUnique({ where: { id: owner.user_id }, select: { email: true } }).then(u => u?.email ?? null)
      : null);

    if (ownerEmail) {
      import('@/lib/email').then(({ sendListingRejectedEmail }) =>
        sendListingRejectedEmail({
          toEmail:          ownerEmail,
          ownerName:        owner?.name,
          propertyTitle:    property.title_ar,
          rejectionReason:  rejection_reason ?? null,
        })
      ).catch(() => {});
    }

    // 2. In-site notification on rejection
    if (owner?.user_id) {
      prisma.notification.create({
        data: {
          user_id: owner.user_id,
          type:    'LISTING_REJECTED',
          title:   '⚠️ لم يتم قبول إعلانك',
          message: rejection_reason
            ? `لم يتم قبول إعلانك "${property.title_ar}". السبب: ${rejection_reason}`
            : `لم يتم قبول إعلانك "${property.title_ar}". تواصل مع المكتب لمعرفة التفاصيل.`,
          link: '/profile?tab=listings',
        },
      }).catch(() => {});
    }
  }

  // Refresh the public listings immediately so an approved/rejected property
  // appears/disappears without waiting out the read cache window.
  revalidatePath('/');
  revalidatePath('/properties');
  revalidatePath(`/properties/${property.slug}`);

  return NextResponse.json({ success: true, listing_status: updated.listing_status });
}
