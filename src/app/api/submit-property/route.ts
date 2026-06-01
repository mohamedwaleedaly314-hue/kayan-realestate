import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { generateSlug } from '@/lib/utils';
import { verifyUserSession } from '@/lib/user-auth';

const submissionSchema = z.object({
  // Property basics
  type:          z.enum(['SALE', 'RENT']),
  district:      z.string().min(2).max(100),
  title_ar:      z.string().min(3).max(200),
  description_ar: z.string().max(3000).optional().nullable(),
  price:         z.number().positive().max(999_999_999),
  area_m2:       z.number().positive(),
  rooms:         z.number().int().min(0).max(20).optional().nullable(),
  floor:         z.number().int().min(0).max(100).optional().nullable(),
  has_elevator:  z.boolean().default(false),
  // Viewing schedule
  viewing_days:      z.array(z.string()).max(7).optional(),
  viewing_time_from: z.string().optional().nullable(),
  viewing_time_to:   z.string().optional().nullable(),
  // Owner info (phone is private)
  owner_name:    z.string().max(100).optional().nullable(),
  owner_phone:   z.string().regex(/^[0-9+]{7,15}$/, 'رقم الهاتف غير صحيح').optional().nullable(),
  owner_whatsapp: z.string().regex(/^[0-9+]{7,15}$/).optional().or(z.literal('')).or(z.null()),
  owner_email:   z.string().email().optional().or(z.literal('')).or(z.null()),
  // Images
  image_urls:    z.array(z.string().min(1)).max(8).optional(),
});

// Simple IP-based rate limit (no Redis needed)
const submissionCounts = new Map<string, { count: number; reset: number }>();
function checkSubmitLimit(ip: string): boolean {
  const now = Date.now();
  const entry = submissionCounts.get(ip);
  if (!entry || entry.reset < now) {
    submissionCounts.set(ip, { count: 1, reset: now + 24 * 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 3) return false; // max 3 submissions per day per IP
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  // Check if a registered user is submitting (optional — works anonymously too).
  // Verify the user still exists to avoid a foreign-key violation from a stale session.
  const userSession = await verifyUserSession();
  let validUserId: string | null = null;
  if (userSession?.userId) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userSession.userId },
      select: { id: true },
    });
    validUserId = existingUser ? userSession.userId : null;
  }

  if (!checkSubmitLimit(ip)) {
    return NextResponse.json(
      { error: 'تجاوزت الحد المسموح به من الطلبات (3 طلبات يومياً). حاول غداً.' },
      { status: 429 }
    );
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 }); }

  const result = submissionSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message ?? 'بيانات غير صالحة' },
      { status: 400 }
    );
  }

  const {
    type, district, title_ar, description_ar, price, area_m2,
    rooms, floor, has_elevator,
    viewing_days, viewing_time_from, viewing_time_to,
    owner_name, owner_phone, owner_whatsapp, owner_email,
    image_urls,
  } = result.data;

  // Generate a unique slug
  let slug = generateSlug(title_ar);
  const existing = await prisma.property.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  // Free listing: 30 days from submission
  const freeListing = new Date();
  freeListing.setDate(freeListing.getDate() + 30);

  try {
    const property = await prisma.property.create({
      data: {
        title_ar,
        slug,
        description_ar: description_ar ?? null,
        price,
        area_m2,
        rooms: rooms ?? null,
        floor: floor ?? null,
        has_elevator: has_elevator ?? false,
        type,
        status: 'AVAILABLE',
        district,
        listing_status: 'PENDING',
        is_free_listing: true,
        free_listing_until: freeListing,
        viewing_days: viewing_days?.length ? JSON.stringify(viewing_days) : null,
        viewing_time_from: viewing_time_from ?? null,
        viewing_time_to:   viewing_time_to   ?? null,
        owner: {
          create: {
            name:     owner_name     ?? null,
            phone:    owner_phone    ?? null,
            email:    (owner_email && owner_email !== '') ? owner_email : null,
            whatsapp: (owner_whatsapp && owner_whatsapp !== '') ? owner_whatsapp : null,
            show_contact: false,
            user_id: validUserId, // link to user account if logged in (verified to exist)
          },
        },
        images: image_urls?.length ? {
          create: image_urls.map((url, i) => ({
            url,
            sort_order: i,
            is_primary: i === 0,
          })),
        } : undefined,
      },
    });

    // Notify admin
    notifyAdmin(property, owner_name, owner_phone).catch(() => {});

    return NextResponse.json({ success: true, id: property.id }, { status: 201 });
  } catch (err) {
    console.error('[PropertySubmission]', err);
    return NextResponse.json({ error: 'حدث خطأ، حاول مرة أخرى' }, { status: 500 });
  }
}

async function notifyAdmin(
  property: { title_ar: string; district: string; price: number; type: string },
  ownerName: string | null | undefined,
  ownerPhone: string | null | undefined,
) {
  const { sendPropertySubmissionNotification } = await import('@/lib/email');
  await sendPropertySubmissionNotification({ property, ownerName, ownerPhone });
}
