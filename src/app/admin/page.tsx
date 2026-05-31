export const dynamic = 'force-dynamic';

import Link from 'next/link';
import {
  Building2, CheckCircle2, XCircle, Clock, MessageSquare,
  Eye, TrendingUp, TrendingDown, Users, Bell, ArrowLeft,
  AlertTriangle, Inbox, CalendarClock,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

async function getDashboardData() {
  const now       = new Date();
  const weekStart = new Date(now); weekStart.setDate(weekStart.getDate() - 7);
  const prevStart = new Date(now); prevStart.setDate(prevStart.getDate() - 14);
  const in7Days   = new Date(now); in7Days.setDate(in7Days.getDate() + 7);

  const [
    totalProperties, availableProperties, soldProperties, reservedProperties,
    totalLeads, newLeads, totalViewsAgg, featuredCount,
    totalUsers, totalAlerts,
    pendingSubmissions, expiringListings,
    leadsThisWeek, leadsPrevWeek,
    topProperties, recentLeads, leadsByStatus, propertiesByType,
  ] = await Promise.all([
    prisma.property.count({ where: { listing_status: 'APPROVED' } }),
    prisma.property.count({ where: { listing_status: 'APPROVED', status: 'AVAILABLE' } }),
    prisma.property.count({ where: { listing_status: 'APPROVED', status: 'SOLD' } }),
    prisma.property.count({ where: { listing_status: 'APPROVED', status: 'RESERVED' } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { status: 'NEW' } }),
    prisma.property.aggregate({ _sum: { views_count: true } }),
    prisma.property.count({ where: { featured: true, listing_status: 'APPROVED' } }),
    prisma.user.count(),
    prisma.searchAlert.count({ where: { is_active: true } }),
    /* عروض مالكين معلقة */
    prisma.property.count({ where: { listing_status: 'PENDING' } }),
    /* إعلانات مجانية تنتهي خلال 7 أيام */
    prisma.property.findMany({
      where: {
        is_free_listing: true,
        listing_status:  'APPROVED',
        free_listing_until: { gte: now, lte: in7Days },
      },
      select: { id: true, title_ar: true, slug: true, free_listing_until: true, owner: { select: { name: true, phone: true, whatsapp: true } } },
      orderBy: { free_listing_until: 'asc' },
    }),
    /* ليدز هذا الأسبوع */
    prisma.lead.count({ where: { created_at: { gte: weekStart } } }),
    /* ليدز الأسبوع الماضي (للمقارنة) */
    prisma.lead.count({ where: { created_at: { gte: prevStart, lt: weekStart } } }),
    /* top 5 most viewed */
    prisma.property.findMany({
      where: { listing_status: 'APPROVED' },
      take: 5,
      orderBy: { views_count: 'desc' },
      select: { id: true, title_ar: true, slug: true, views_count: true, district: true, price: true },
    }),
    /* recent 5 leads */
    prisma.lead.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: { property: { select: { title_ar: true, slug: true } } },
    }),
    /* leads by status */
    prisma.lead.groupBy({ by: ['status'], _count: { id: true } }),
    /* properties by type */
    prisma.property.groupBy({ by: ['type'], _count: { id: true }, where: { listing_status: 'APPROVED' } }),
  ]);

  const leadsGrowth = leadsPrevWeek > 0
    ? Math.round(((leadsThisWeek - leadsPrevWeek) / leadsPrevWeek) * 100)
    : leadsThisWeek > 0 ? 100 : 0;

  return {
    totalProperties, availableProperties, soldProperties, reservedProperties,
    totalLeads, newLeads,
    totalViews: totalViewsAgg._sum.views_count ?? 0,
    featuredCount, totalUsers, totalAlerts,
    pendingSubmissions, expiringListings,
    leadsThisWeek, leadsPrevWeek, leadsGrowth,
    topProperties, recentLeads, leadsByStatus, propertiesByType,
  };
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  NEW:       { label: 'جديد',        color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  CONTACTED: { label: 'تم التواصل',  color: 'text-blue-700 dark:text-blue-400',     bg: 'bg-blue-100 dark:bg-blue-900/30' },
  QUALIFIED: { label: 'مؤهل',        color: 'text-amber-700 dark:text-amber-400',    bg: 'bg-amber-100 dark:bg-amber-900/30' },
  CLOSED:    { label: 'مغلق',        color: 'text-red-700 dark:text-red-400',        bg: 'bg-red-100 dark:bg-red-900/30' },
};

export default async function AdminDashboard() {
  const d = await getDashboardData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">نظرة عامة</h1>
        <p className="text-muted-foreground text-sm mt-1">لوحة تحكم كيان للعقارات</p>
      </div>

      {/* ── Alerts Row ── */}
      <div className="flex flex-wrap gap-3">
        {d.pendingSubmissions > 0 && (
          <Link href="/admin/submissions"
            className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-2xl hover:border-amber-500 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
              <Inbox className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                {d.pendingSubmissions} عرض مالك ينتظر مراجعتك
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">انقر للمراجعة والموافقة</p>
            </div>
            <ArrowLeft className="w-4 h-4 text-amber-500 mr-2 group-hover:-translate-x-1 transition-transform" />
          </Link>
        )}
        {d.newLeads > 0 && (
          <Link href="/admin/leads?status=NEW"
            className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-2xl hover:border-red-500 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-800 dark:text-red-300">
                {d.newLeads} استفسار لم يُرَد عليه
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">يحتاج رد سريع</p>
            </div>
            <ArrowLeft className="w-4 h-4 text-red-500 mr-2 group-hover:-translate-x-1 transition-transform" />
          </Link>
        )}
        {d.expiringListings.length > 0 && (
          <Link href="/admin/submissions?status=APPROVED"
            className="flex items-center gap-3 px-4 py-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 rounded-2xl hover:border-orange-500 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center shrink-0">
              <CalendarClock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-orange-800 dark:text-orange-300">
                {d.expiringListings.length} إعلان مجاني ينتهي قريباً
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400">تواصل مع المالكين للتجديد</p>
            </div>
            <ArrowLeft className="w-4 h-4 text-orange-500 mr-2 group-hover:-translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي العقارات',  value: d.totalProperties,                       icon: Building2,     color: 'bg-navy/10 text-navy dark:bg-navy/30 dark:text-ivory' },
          { label: 'متاح للبيع/إيجار', value: d.availableProperties,                   icon: CheckCircle2,  color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
          { label: 'مباع / مؤجر',      value: d.soldProperties + d.reservedProperties, icon: XCircle,       color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
          { label: 'إجمالي المشاهدات', value: d.totalViews.toLocaleString('ar-EG'),     icon: Eye,           color: 'bg-gold/10 text-gold' },
          { label: 'إجمالي الليدز',    value: d.totalLeads,                             icon: MessageSquare, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
          { label: 'مستخدمون مسجلون',  value: d.totalUsers,                             icon: Users,         color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
          { label: 'تنبيهات بحث نشطة', value: d.totalAlerts,                            icon: Bell,          color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
          // Leads this week with growth indicator
          { label: 'ليدز هذا الأسبوع', value: d.leadsThisWeek,                          icon: d.leadsGrowth >= 0 ? TrendingUp : TrendingDown,
            color: d.leadsGrowth >= 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            badge: d.leadsPrevWeek > 0 ? `${d.leadsGrowth >= 0 ? '+' : ''}${d.leadsGrowth}% vs الأسبوع الماضي` : undefined,
          },
        ].map((card) => (
          <div key={card.label} className="bg-card rounded-2xl border border-border p-5 hover:border-gold/40 transition-colors">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
            {'badge' in card && card.badge && (
              <p className={`text-[10px] font-semibold mt-1 ${d.leadsGrowth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {card.badge}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Most viewed properties */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-bold flex items-center gap-2">
              <Eye className="w-4 h-4 text-gold" />
              أكثر العقارات مشاهدة
            </h2>
            <Link href="/admin/properties" className="text-xs text-gold hover:underline flex items-center gap-1">
              الكل <ArrowLeft className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {d.topProperties.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">لا توجد عقارات بعد</p>
            ) : d.topProperties.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center
                  ${i === 0 ? 'bg-gold text-white' : i === 1 ? 'bg-navy/20 text-navy dark:bg-ivory/20 dark:text-ivory' : 'bg-muted text-muted-foreground'}`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <Link href={`/properties/${p.slug}`} target="_blank"
                    className="text-sm font-medium hover:text-gold transition-colors truncate block">
                    {p.title_ar}
                  </Link>
                  <p className="text-xs text-muted-foreground">{p.district} • {p.price.toLocaleString('ar-EG')} ج.م</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <Eye className="w-3 h-3" />
                  {p.views_count.toLocaleString('ar-EG')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent leads */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-bold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gold" />
              آخر الاستفسارات
            </h2>
            <Link href="/admin/leads" className="text-xs text-gold hover:underline flex items-center gap-1">
              الكل <ArrowLeft className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {d.recentLeads.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">لا توجد استفسارات بعد</p>
            ) : d.recentLeads.map(lead => {
              const cfg = statusConfig[lead.status] ?? statusConfig.NEW;
              return (
                <div key={lead.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-navy/10 dark:bg-ivory/10 flex items-center justify-center
                                  text-sm font-bold text-navy dark:text-ivory shrink-0">
                    {lead.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{lead.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {lead.property?.title_ar ?? 'استفسار عام'} • {formatDate(lead.created_at)}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.bg} ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leads by status */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gold" />
            الليدز حسب الحالة
          </h2>
          <div className="space-y-3">
            {['NEW','CONTACTED','QUALIFIED','CLOSED'].map(s => {
              const count = d.leadsByStatus.find(r => r.status === s)?._count.id ?? 0;
              const pct   = d.totalLeads > 0 ? Math.round((count / d.totalLeads) * 100) : 0;
              const cfg   = statusConfig[s];
              return (
                <div key={s}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{cfg.label}</span>
                    <span className="text-sm font-bold">{count} <span className="text-xs text-muted-foreground">({pct}%)</span></span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gold transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expiring free listings */}
        {d.expiringListings.length > 0 && (
          <div className="bg-card rounded-2xl border border-orange-200 dark:border-orange-800 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
              <h2 className="font-bold flex items-center gap-2 text-orange-800 dark:text-orange-300">
                <CalendarClock className="w-4 h-4" />
                إعلانات تنتهي خلال 7 أيام
              </h2>
              <span className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full font-bold border border-orange-200 dark:border-orange-700">
                {d.expiringListings.length} إعلان
              </span>
            </div>
            <div className="divide-y divide-border/50">
              {d.expiringListings.map(p => {
                const daysLeft = Math.ceil((new Date(p.free_listing_until!).getTime() - Date.now()) / 86400000);
                const ownerContact = p.owner?.whatsapp || p.owner?.phone;
                const renewMsg = ownerContact
                  ? encodeURIComponent(`مرحباً ${p.owner?.name ?? 'أخي'}،\nمن مكتب كيان للعقارات 🏢\n\nفترة الإعلان المجاني لعقارك "${p.title_ar}" ستنتهي خلال ${daysLeft} أيام.\n\nهل تريد تجديد الإعلان؟`)
                  : null;
                return (
                  <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <Link href={`/properties/${p.slug}`} target="_blank"
                        className="text-sm font-medium hover:text-gold transition-colors truncate block">
                        {p.title_ar}
                      </Link>
                      <p className="text-xs text-muted-foreground">{p.owner?.name ?? '—'}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        daysLeft <= 2 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                      }`}>
                        {daysLeft} يوم
                      </span>
                      {renewMsg && ownerContact && (
                        <a
                          href={`https://wa.me/${ownerContact.replace(/\D/g,'')}?text=${renewMsg}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold hover:bg-emerald-200 transition-colors border border-emerald-200 dark:border-emerald-800"
                        >
                          📲 تجديد
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Properties by type */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gold" />
            العقارات حسب النوع والحالة
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'للبيع',     filter: 'SALE',      icon: '🏠', color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
              { label: 'للإيجار',   filter: 'RENT',      icon: '🔑', color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' },
              { label: 'متاح',      filter: 'AVAILABLE', icon: '✅', color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
              { label: 'محجوز/مباع',filter: 'SOLD',      icon: '🔴', color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
            ].map(item => {
              const count = item.filter === 'SALE' || item.filter === 'RENT'
                ? (d.propertiesByType.find(r => r.type === item.filter)?._count.id ?? 0)
                : item.filter === 'AVAILABLE' ? d.availableProperties
                : d.soldProperties + d.reservedProperties;
              return (
                <div key={item.filter} className={`rounded-xl border p-4 ${item.color}`}>
                  <p className="text-2xl mb-1">{item.icon}</p>
                  <p className="text-xl font-bold text-foreground">{count}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">العقارات المميزة ⭐</span>
              <span className="font-bold text-gold">{d.featuredCount}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
