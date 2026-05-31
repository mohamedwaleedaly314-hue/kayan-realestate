import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import { propertySchema, ownerSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20', 10));
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { title_ar: { contains: search } },
      { district: { contains: search } },
      { slug: { contains: search } },
    ];
  }
  if (status && ['AVAILABLE', 'SOLD', 'RESERVED'].includes(status)) where.status = status;
  if (type && ['SALE', 'RENT'].includes(type)) where.type = type;

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        images: { where: { is_primary: true }, take: 1 },
        _count: { select: { leads: true } },
      },
    }),
    prisma.property.count({ where }),
  ]);

  return NextResponse.json({ properties, total, page, limit });
}

const createPropertySchema = propertySchema.extend({
  owner: ownerSchema.optional(),
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

  const result = createPropertySchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message ?? 'بيانات غير صالحة', issues: result.error.issues },
      { status: 400 }
    );
  }

  const { owner, ...propertyData } = result.data;

  // Check slug uniqueness
  const existing = await prisma.property.findUnique({ where: { slug: propertyData.slug } });
  if (existing) {
    return NextResponse.json({ error: 'الـ slug مستخدم بالفعل، اختر اسماً مختلفاً' }, { status: 409 });
  }

  let property;
  try {
    property = await prisma.property.create({
      data: {
        ...propertyData,
        price: propertyData.price,
        owner: owner
          ? {
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
            }
          : undefined,
      },
      include: { images: true, owner: true },
    });
  } catch (err) {
    console.error('[Property Create]', err);
    return NextResponse.json({ error: 'فشل إنشاء العقار، تأكد من البيانات وحاول مرة أخرى' }, { status: 500 });
  }

  /* ── notify matching search alerts ── */
  notifySearchAlerts(property).catch(() => {});

  return NextResponse.json(property, { status: 201 });
}

/* Fire-and-forget: find all active alerts that match the new property and email them */
async function notifySearchAlerts(property: {
  title_ar: string; slug: string; price: number;
  area_m2: number; type: string; district: string;
}) {
  const { sendSearchAlertEmail } = await import('@/lib/email');
  const alerts = await prisma.searchAlert.findMany({ where: { is_active: true } });

  for (const alert of alerts) {
    const matchType     = !alert.type     || alert.type === property.type;
    const matchDistrict = !alert.district || alert.district === property.district;
    const matchMin      = !alert.min_price || property.price >= alert.min_price;
    const matchMax      = !alert.max_price || property.price <= alert.max_price;

    if (matchType && matchDistrict && matchMin && matchMax) {
      await sendSearchAlertEmail(alert.email, property).catch(() => {});
    }
  }
}
