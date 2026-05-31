import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession, verifyPassword } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { checkRateLimit, loginLimiter } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
  const { success } = await checkRateLimit(loginLimiter, ip);

  if (!success) {
    return NextResponse.json(
      { error: 'تجاوزت عدد المحاولات المسموح بها. حاول بعد 15 دقيقة.' },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
  }

  const result = loginSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message ?? 'بيانات غير صالحة' },
      { status: 400 }
    );
  }

  const { email, password } = result.data;

  // Check admin in DB first
  const admin = await prisma.adminUser.findUnique({ where: { email } });

  // Fallback to env vars if no DB admin
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminHash = process.env.ADMIN_PASSWORD_HASH;

  let isValid = false;
  let adminId = '';

  if (admin) {
    isValid = await verifyPassword(password, admin.password_hash);
    adminId = admin.id;
  } else if (adminEmail && adminHash && email === adminEmail) {
    isValid = await verifyPassword(password, adminHash);
    adminId = 'env-admin';
  }

  if (!isValid) {
    return NextResponse.json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, { status: 401 });
  }

  await createSession(adminId, email);

  return NextResponse.json({ success: true });
}
