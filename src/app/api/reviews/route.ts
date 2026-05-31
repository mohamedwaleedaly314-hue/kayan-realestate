import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const reviewSchema = z.object({
  author_name: z.string().min(2).max(80),
  rating:      z.number().int().min(1).max(5),
  content:     z.string().min(10).max(800),
  deal_type:   z.enum(['بيع', 'إيجار']).optional(),
  district:    z.string().max(80).optional(),
});

// Simple IP rate limit — 2 reviews per day
const reviewLimits = new Map<string, { count: number; reset: number }>();
function checkLimit(ip: string) {
  const now = Date.now();
  const e = reviewLimits.get(ip);
  if (!e || e.reset < now) { reviewLimits.set(ip, { count: 1, reset: now + 86400000 }); return true; }
  if (e.count >= 2) return false;
  e.count++; return true;
}

export async function GET() {
  const reviews = await prisma.review.findMany({
    where:   { is_approved: true },
    orderBy: [{ is_featured: 'desc' }, { created_at: 'desc' }],
    take: 20,
  });
  return NextResponse.json({ reviews });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkLimit(ip)) return NextResponse.json({ error: 'حاول مرة أخرى غداً' }, { status: 429 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 }); }

  const result = reviewSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message ?? 'بيانات غير صالحة' }, { status: 400 });

  await prisma.review.create({ data: { ...result.data, is_approved: false } });
  return NextResponse.json({ success: true }, { status: 201 });
}
