import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createUserSession } from '@/lib/user-auth';
import { verifyPassword } from '@/lib/auth';
import { checkRateLimit, loginLimiter } from '@/lib/rate-limit';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(1, 'أدخل كلمة المرور'),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const { success } = await checkRateLimit(loginLimiter, `user-login:${ip}`);
  if (!success) {
    return NextResponse.json({ error: 'تجاوزت عدد المحاولات المسموح بها. حاول بعد 15 دقيقة.' }, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 }); }

  const result = loginSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 });
  }

  const { email, password } = result.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return NextResponse.json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, { status: 401 });
  }

  await createUserSession(user.id, user.email, user.name);
  return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
}
