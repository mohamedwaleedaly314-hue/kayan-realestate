import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

export const contactFormLimiter = new Ratelimit({
  redis: getRedis() ?? ({} as Redis),
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  analytics: false,
  prefix: 'ratelimit:contact',
});

export const loginLimiter = new Ratelimit({
  redis: getRedis() ?? ({} as Redis),
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: false,
  prefix: 'ratelimit:login',
});

export const apiLimiter = new Ratelimit({
  redis: getRedis() ?? ({} as Redis),
  limiter: Ratelimit.slidingWindow(60, '1 m'),
  analytics: false,
  prefix: 'ratelimit:api',
});

export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  try {
    const r = getRedis();
    if (!r) return { success: true, remaining: 999, reset: 0 };

    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch {
    return { success: true, remaining: 999, reset: 0 };
  }
}
