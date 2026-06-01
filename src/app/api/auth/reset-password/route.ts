import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { createUserSession } from '@/lib/user-auth';
import { verifyResetToken, fingerprintMatches } from '@/lib/password-reset';
import { checkRateLimit, loginLimiter } from '@/lib/rate-limit';
import { z } from 'zod';

const schema = z.object({
  token:    z.string().min(10, 'رابط غير صالح'),
  password: z.string().min(8, 'كلمة المرور 8 أحرف على الأقل').max(100),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const { success } = await checkRateLimit(loginLimiter, `reset:${ip}`);
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

  const { token, password } = result.data;

  const payload = await verifyResetToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'الرابط غير صالح أو انتهت صلاحيته. اطلب رابطاً جديداً.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.uid },
    select: { id: true, name: true, email: true, password_hash: true },
  });

  // The fingerprint is bound to the password hash at issue time — if it no
  // longer matches, the token was already used or the password changed.
  if (!user || !fingerprintMatches(payload, user.password_hash)) {
    return NextResponse.json({ error: 'الرابط غير صالح أو تم استخدامه. اطلب رابطاً جديداً.' }, { status: 400 });
  }

  const password_hash = await hashPassword(password);
  await prisma.user.update({ where: { id: user.id }, data: { password_hash } });

  // Log the user straight in after a successful reset.
  await createUserSession(user.id, user.email, user.name);

  return NextResponse.json({ success: true });
}
