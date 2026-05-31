import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
const SESSION_DURATION = 30 * 24 * 60 * 60; // 30 days

export interface UserSessionPayload {
  userId: string;
  email: string;
  name: string;
}

export async function createUserSession(userId: string, email: string, name: string) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION * 1000);
  const token = await new SignJWT({ userId, email, name })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(JWT_SECRET);

  cookies().set('user_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  return token;
}

export async function verifyUserSession(): Promise<UserSessionPayload | null> {
  const token = cookies().get('user_session')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

export async function deleteUserSession() {
  cookies().delete('user_session');
}
