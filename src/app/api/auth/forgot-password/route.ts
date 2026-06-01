import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createResetToken } from '@/lib/password-reset';
import { checkRateLimit, loginLimiter } from '@/lib/rate-limit';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
});

const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

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

  const email = result.data.email.trim().toLowerCase();

  // Always respond the same way — never reveal whether an email is registered.
  const genericOk = NextResponse.json({
    success: true,
    message: 'لو الإيميل مسجّل عندنا، هتلاقي رابط إعادة التعيين وصلك على بريدك.',
  });

  // Ignore the synthetic placeholder addresses we store for phone-only accounts.
  if (email.endsWith('@phone.kayan')) return genericOk;

  const user = await prisma.user.findFirst({
    where: { email },
    select: { id: true, name: true, email: true, password_hash: true },
  });
  if (!user) return genericOk;

  const token = await createResetToken(user.id, user.password_hash);
  const resetUrl = `${BASE_URL}/auth/reset?token=${encodeURIComponent(token)}`;

  // Email is the delivery channel (Resend — free, no extra setup needed).
  try {
    const { sendPasswordResetEmail } = await import('@/lib/email');
    await sendPasswordResetEmail(user.email, user.name, resetUrl);
  } catch (err) {
    console.error('[forgot-password][email]', err);
  }

  return genericOk;
}
