import { SignJWT, jwtVerify } from 'jose';
import { createHash } from 'crypto';

/**
 * Stateless password-reset tokens.
 *
 * No DB table is needed: the token is a short-lived signed JWT that carries
 * the user id plus a fingerprint of the user's CURRENT password hash. Once the
 * password is changed the hash (and therefore the fingerprint) changes, so any
 * previously issued token stops validating — making each token effectively
 * single-use without any server-side storage.
 */

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? 'fallback-secret');
const RESET_TTL = 30 * 60; // 30 minutes

/** Short, non-reversible fingerprint of the password hash. */
function fingerprint(passwordHash: string): string {
  return createHash('sha256').update(passwordHash).digest('hex').slice(0, 24);
}

export async function createResetToken(userId: string, passwordHash: string): Promise<string> {
  return new SignJWT({ uid: userId, fp: fingerprint(passwordHash), kind: 'pwreset' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${RESET_TTL}s`)
    .sign(JWT_SECRET);
}

export interface ResetTokenPayload {
  uid: string;
  fp: string;
}

/** Verify signature, expiry and kind. Returns payload or null. */
export async function verifyResetToken(token: string): Promise<ResetTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.kind !== 'pwreset') return null;
    return { uid: payload.uid as string, fp: payload.fp as string };
  } catch {
    return null;
  }
}

/** Confirm the token's fingerprint still matches the current password hash. */
export function fingerprintMatches(token: ResetTokenPayload, currentHash: string): boolean {
  return token.fp === fingerprint(currentHash);
}
