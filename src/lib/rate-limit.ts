import { Ratelimit, type Duration } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Rate limiting with a graceful fallback.
 *
 * If Upstash Redis is configured (UPSTASH_REDIS_REST_URL/TOKEN) it is used —
 * that's the robust, multi-instance option. If not, we fall back to an
 * in-memory sliding window so the app is still protected against rapid
 * brute-force / spam bursts on a warm serverless instance (instead of having
 * no protection at all, which is what previously happened).
 */

export interface LimitConfig {
  limit: number;
  window: Duration; // e.g. '1 h'
  windowMs: number; // same window in milliseconds (for the in-memory path)
  prefix: string;
}

export const contactFormLimiter: LimitConfig = { limit: 3,  window: '1 h',  windowMs: 60 * 60 * 1000, prefix: 'contact' };
export const loginLimiter:       LimitConfig = { limit: 5,  window: '15 m', windowMs: 15 * 60 * 1000, prefix: 'login' };
export const apiLimiter:         LimitConfig = { limit: 60, window: '1 m',  windowMs: 60 * 1000,      prefix: 'api' };

// ── Upstash (used only when configured) ──────────────────────────────────────
let redis: Redis | null = null;
function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

const upstashCache = new Map<string, Ratelimit>();
function upstashFor(c: LimitConfig): Ratelimit | null {
  const r = getRedis();
  if (!r) return null;
  if (!upstashCache.has(c.prefix)) {
    upstashCache.set(c.prefix, new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(c.limit, c.window),
      analytics: false,
      prefix: `ratelimit:${c.prefix}`,
    }));
  }
  return upstashCache.get(c.prefix)!;
}

// ── In-memory sliding window fallback ────────────────────────────────────────
const memStore = new Map<string, number[]>();
function memLimit(c: LimitConfig, identifier: string) {
  const key = `${c.prefix}:${identifier}`;
  const now = Date.now();
  const hits = (memStore.get(key) ?? []).filter((t) => now - t < c.windowMs);
  if (hits.length >= c.limit) {
    memStore.set(key, hits);
    return { success: false, remaining: 0, reset: hits[0] + c.windowMs };
  }
  hits.push(now);
  memStore.set(key, hits);
  // Opportunistic cleanup so the map doesn't grow unbounded.
  if (memStore.size > 5000) {
    for (const [k, v] of memStore) {
      if (v.every((t) => now - t >= c.windowMs)) memStore.delete(k);
    }
  }
  return { success: true, remaining: c.limit - hits.length, reset: now + c.windowMs };
}

export async function checkRateLimit(
  config: LimitConfig,
  identifier: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  try {
    const u = upstashFor(config);
    if (u) {
      const result = await u.limit(identifier);
      return { success: result.success, remaining: result.remaining, reset: result.reset };
    }
    return memLimit(config, identifier);
  } catch {
    // Never block a legitimate user because the limiter itself errored.
    return { success: true, remaining: 999, reset: 0 };
  }
}
