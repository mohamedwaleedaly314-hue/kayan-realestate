import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import { createResetToken } from '@/lib/password-reset';

const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

interface Params { params: { id: string } }

/**
 * Admin-only: generate a one-time password-reset link for a user.
 * Lets the office help customers who registered with a phone but no email
 * (so they can't use the self-service email reset). The link is the same
 * stateless, single-use, 30-minute token used by the public flow.
 */
export async function POST(_req: Request, { params }: Params) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, phone: true, password_hash: true },
  });
  if (!user) return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });

  const token = await createResetToken(user.id, user.password_hash);
  const url = `${BASE_URL}/auth/reset?token=${encodeURIComponent(token)}`;

  return NextResponse.json({ url, name: user.name, phone: user.phone });
}
