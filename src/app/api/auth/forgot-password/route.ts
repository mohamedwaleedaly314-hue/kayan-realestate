import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createResetToken } from '@/lib/password-reset';
import { checkRateLimit, loginLimiter } from '@/lib/rate-limit';
import { z } from 'zod';

const schema = z.object({
  phone: z.string().regex(/^[0-9+]{10,15}$/, 'رقم الهاتف غير صحيح'),
});

const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

// Best-effort conversion of a local Egyptian number to international WhatsApp format.
function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('20')) return digits;
  if (digits.startsWith('0')) return `20${digits.slice(1)}`;
  return digits;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const { success } = await checkRateLimit(loginLimiter, `forgot:${ip}`);
  if (!success) {
    return NextResponse.json({ error: 'محاولات كثيرة. حاول بعد قليل.' }, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 }); }

  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 });
  }

  const { phone } = result.data;

  // Always respond the same way — never reveal whether a phone is registered.
  const genericOk = NextResponse.json({
    success: true,
    message: 'لو الرقم مسجّل عندنا، هنبعتلك رابط إعادة التعيين على واتساب.',
  });

  const user = await prisma.user.findFirst({
    where: { phone },
    select: { id: true, name: true, email: true, phone: true, password_hash: true },
  });
  if (!user) return genericOk;

  const token = await createResetToken(user.id, user.password_hash);
  const resetUrl = `${BASE_URL}/auth/reset?token=${encodeURIComponent(token)}`;

  // Primary self-service channel: WhatsApp to the account phone (free, no domain
  // needed). Works automatically once WhatsApp Cloud API is configured; until
  // then the office can send the link from the admin users page.
  try {
    const { sendWhatsApp } = await import('@/lib/whatsapp');
    const msg = [
      `🔐 *إعادة تعيين كلمة المرور — كيان للعقارات*`,
      ``,
      `مرحباً ${user.name ?? ''}،`,
      `اضغط الرابط لتعيين كلمة مرور جديدة (صالح 30 دقيقة):`,
      resetUrl,
      ``,
      `لو مش انت اللي طلبت، تجاهل الرسالة.`,
    ].join('\n');
    await sendWhatsApp(toWhatsAppNumber(user.phone ?? phone), msg);
  } catch (err) {
    console.error('[forgot-password][whatsapp]', err);
  }

  // Bonus channel: email, only when the user added a real one.
  const realEmail = user.email && !user.email.endsWith('@phone.kayan') ? user.email : null;
  if (realEmail) {
    import('@/lib/email')
      .then(({ sendPasswordResetEmail }) => sendPasswordResetEmail(realEmail, user.name, resetUrl))
      .catch((err) => console.error('[forgot-password][email]', err));
  }

  return genericOk;
}
