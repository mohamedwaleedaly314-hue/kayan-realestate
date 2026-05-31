import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { leadSchema } from '@/lib/validations';
import { checkRateLimit, contactFormLimiter } from '@/lib/rate-limit';
import { sendLeadNotification } from '@/lib/email';
import { verifyUserSession } from '@/lib/user-auth';

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
  const { success } = await checkRateLimit(contactFormLimiter, ip);
  if (!success) {
    return NextResponse.json(
      { error: 'لقد تجاوزت الحد المسموح به. حاول مرة أخرى بعد ساعة.' },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
  }

  const result = leadSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message ?? 'بيانات غير صالحة' },
      { status: 400 }
    );
  }

  const { name, phone, message, property_id, source } = result.data;

  // Verify property exists if provided (also fetch owner info for email notification)
  let property: { id: string; title_ar: string; slug: string; owner?: { name?: string | null; phone?: string | null; whatsapp?: string | null } | null } | null = null;
  if (property_id) {
    property = await prisma.property.findUnique({
      where: { id: property_id },
      select: {
        id: true, title_ar: true, slug: true,
        owner: { select: { name: true, phone: true, whatsapp: true } },
      },
    });
    if (!property) {
      return NextResponse.json({ error: 'العقار غير موجود' }, { status: 404 });
    }
  }

  // Attach user_id if a user is logged in (for data collection)
  const userSession = await verifyUserSession();

  const lead = await prisma.lead.create({
    data: {
      name,
      phone,
      message: message ?? null,
      property_id: property_id ?? null,
      user_id: userSession?.userId ?? null,
      source,
      status: 'NEW',
    },
  });

  // WhatsApp instant notification to admin (if API configured)
  import('@/lib/whatsapp').then(({ notifyAdminNewLead }) =>
    notifyAdminNewLead({ leadName: name, leadPhone: phone, propertyTitle: property?.title_ar, leadMessage: message })
  ).catch(() => {});

  // Send email notification to admin — include owner info for WhatsApp forwarding
  sendLeadNotification({
    leadName:      name,
    leadPhone:     phone,
    leadMessage:   message,
    propertyTitle: property?.title_ar,
    propertySlug:  property?.slug,
    ownerName:     property?.owner?.name,
    ownerPhone:    property?.owner?.phone,
    ownerWhatsapp: property?.owner?.whatsapp,
  }).catch((err) => console.error('[Lead email]', err));

  return NextResponse.json({ success: true, id: lead.id }, { status: 201 });
}
