import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createUserSession } from '@/lib/user-auth';
import { hashPassword } from '@/lib/auth';
import { checkRateLimit, loginLimiter } from '@/lib/rate-limit';
import { sendWelcomeEmail, sendNewUserNotification } from '@/lib/email';
import { z } from 'zod';

const signupSchema = z.object({
  name:     z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').max(100),
  email:    z.string().email('البريد الإلكتروني غير صحيح'),
  phone:    z.string().regex(/^[0-9+]{10,15}$/, 'رقم الهاتف غير صحيح — أدخل رقماً مصرياً صحيحاً'),
  district: z.string().optional(),
  password: z.string().min(8, 'كلمة المرور 8 أحرف على الأقل').max(100),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    const { success } = await checkRateLimit(loginLimiter, `signup:${ip}`);
    if (!success) {
      return NextResponse.json({ error: 'محاولات كثيرة. حاول بعد قليل.' }, { status: 429 });
    }

    let body: unknown;
    try { body = await req.json(); }
    catch { return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 }); }

    const result = signupSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 });
    }

    const { name, email, phone, district, password } = result.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'هذا البريد الإلكتروني مسجل مسبقاً' }, { status: 409 });
    }

    const password_hash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, phone, district: district || null, password_hash },
    });

    await createUserSession(user.id, user.email, user.name);

    // Fire-and-forget emails
    sendWelcomeEmail(user.name, user.email).catch(() => {});
    sendNewUserNotification({ id: user.id, name: user.name, email: user.email, phone: user.phone, district: user.district }).catch(() => {});

    return NextResponse.json(
      { success: true, user: { id: user.id, name: user.name, email: user.email } },
      { status: 201 }
    );
  } catch (err) {
    console.error('[signup]', err);
    const message = err instanceof Error ? err.message : 'حدث خطأ';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
