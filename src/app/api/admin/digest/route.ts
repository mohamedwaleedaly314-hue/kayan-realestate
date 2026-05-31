/**
 * GET /api/admin/digest
 * Call this daily (e.g. via cron job, Vercel cron, or Upstash QStash)
 * Protected by CRON_SECRET header
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendDailyDigest, sendStaleLeadsAlert, type StaleLead } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Simple secret check so only your cron can call this
  const secret = req.headers.get('x-cron-secret') ?? req.nextUrl.searchParams.get('secret');
  if (secret !== (process.env.CRON_SECRET ?? 'kayan-digest-secret')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000); // last 24h

  const [newLeads, newRequests, newUsers, viewsAgg, pendingLeads, staleLeads, topProperty] = await Promise.all([
    prisma.lead.count({ where: { created_at: { gte: since } } }),
    prisma.propertyRequest.count({ where: { created_at: { gte: since } } }),
    prisma.user.count({ where: { created_at: { gte: since } } }),
    prisma.property.aggregate({ _sum: { views_count: true } }),
    prisma.lead.count({ where: { status: 'NEW' } }),
    // Leads older than 24h still NEW (need follow-up)
    prisma.lead.findMany({
      where: { status: 'NEW', created_at: { lt: since } },
      select: { name: true, phone: true, created_at: true, property: { select: { title_ar: true } } },
      take: 20,
    }),
    prisma.property.findFirst({
      where: { status: 'AVAILABLE' },
      orderBy: { views_count: 'desc' },
      select: { title_ar: true, slug: true, views_count: true },
    }),
  ]);

  await sendDailyDigest({
    newLeads,
    newRequests,
    newUsers,
    totalViews: viewsAgg._sum.views_count ?? 0,
    pendingLeads,
    topProperty,
  });

  if (staleLeads.length > 0) {
    const stale: StaleLead[] = staleLeads.map(l => ({
      name:          l.name,
      phone:         l.phone,
      propertyTitle: l.property?.title_ar ?? null,
      hoursAgo:      Math.floor((Date.now() - new Date(l.created_at).getTime()) / 3_600_000),
    }));
    await sendStaleLeadsAlert(stale);
  }

  return NextResponse.json({
    ok: true,
    sent: { digest: true, staleAlert: staleLeads.length > 0 },
    stats: { newLeads, newRequests, newUsers, pendingLeads },
  });
}
