'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface PropertyRequest {
  id:         string;
  name:       string;
  phone:      string;
  email?:     string | null;
  type:       string;
  district?:  string | null;
  min_price?: number | null;
  max_price?: number | null;
  rooms?:     number | null;
  notes?:     string | null;
  status:     string;
  created_at: Date;
  user?:      { name: string; email: string } | null;
}

interface Props {
  requests:      PropertyRequest[];
  total:         number;
  page:          number;
  pageSize:      number;
  currentStatus?: string;
}

const statusConfig: Record<string, { label: string; badge: string }> = {
  NEW:       { label: 'جديد',       badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  CONTACTED: { label: 'تم التواصل', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  CLOSED:    { label: 'مغلق',       badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export default function RequestsTable({ requests, total, page, pageSize, currentStatus }: Props) {
  const router       = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const totalPages   = Math.ceil(total / pageSize);

  function buildUrl(params: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    if (currentStatus) p.set('status', currentStatus);
    Object.entries(params).forEach(([k, v]) => { if (v) p.set(k, v); else p.delete(k); });
    return `/admin/requests?${p.toString()}`;
  }

  async function updateStatus(id: string, status: string) {
    setLoading(id);
    try {
      await fetch(`/api/admin/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } catch {
      toast.error('حدث خطأ');
    } finally {
      setLoading(null);
    }
  }

  function buildWAMessage(r: PropertyRequest) {
    const type      = r.type === 'SALE' ? 'للشراء' : 'للإيجار';
    const district  = r.district ? `في ${r.district}` : '';
    const priceMin  = r.min_price ? ` من ${r.min_price.toLocaleString('ar-EG')} ج.م` : '';
    const priceMax  = r.max_price ? ` حتى ${r.max_price.toLocaleString('ar-EG')} ج.م` : '';
    const rooms     = r.rooms ? `، ${r.rooms} غرف` : '';
    return encodeURIComponent(
      `مرحباً ${r.name}،\nتواصلنا معك من كيان للعقارات بخصوص طلبك للحصول على عقار ${type} ${district}${priceMin}${priceMax}${rooms}.\n\nهل أنت متاح الآن للحديث؟`
    );
  }

  return (
    <div className="space-y-4">
      {/* Status filters */}
      <div className="flex gap-1.5 flex-wrap">
        {[undefined, 'NEW', 'CONTACTED', 'CLOSED'].map(s => (
          <button key={s ?? 'all'}
            onClick={() => router.push(buildUrl({ status: s, page: '1' }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentStatus === s
                ? 'bg-gold text-white shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {s ? statusConfig[s]?.label : `الكل (${total})`}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/60 border-b border-border">
                <th className="text-right px-4 py-3 font-semibold text-xs">الاسم</th>
                <th className="text-right px-4 py-3 font-semibold text-xs">الهاتف</th>
                <th className="text-right px-4 py-3 font-semibold text-xs">تفاصيل الطلب</th>
                <th className="text-right px-4 py-3 font-semibold text-xs">المنطقة</th>
                <th className="text-right px-4 py-3 font-semibold text-xs">الميزانية</th>
                <th className="text-right px-4 py-3 font-semibold text-xs">الحالة</th>
                <th className="text-right px-4 py-3 font-semibold text-xs">التاريخ</th>
                <th className="text-right px-4 py-3 font-semibold text-xs">واتساب</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground">لا توجد طلبات</td>
                </tr>
              )}
              {requests.map(r => {
                const cfg = statusConfig[r.status] ?? statusConfig.NEW;
                return (
                  <tr key={r.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${loading === r.id ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-navy/10 dark:bg-ivory/10 flex items-center justify-center text-xs font-bold text-navy dark:text-ivory shrink-0">
                          {r.name[0]}
                        </div>
                        <span className="font-medium text-sm">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" dir="ltr">{r.phone}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.type === 'SALE' ? 'bg-gold/10 text-gold' : 'bg-navy/10 text-navy dark:bg-ivory/10 dark:text-ivory'}`}>
                          {r.type === 'SALE' ? 'شراء' : 'إيجار'}
                        </span>
                        {r.rooms && <span className="text-xs text-muted-foreground">{r.rooms} غرف</span>}
                        {r.notes && <span className="text-xs text-muted-foreground truncate max-w-[120px]">{r.notes}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{r.district ?? '—'}</td>
                    <td className="px-4 py-3 text-xs">
                      {r.min_price || r.max_price ? (
                        <span className="text-foreground">
                          {r.min_price ? r.min_price.toLocaleString('ar-EG') : '—'}
                          {' → '}
                          {r.max_price ? r.max_price.toLocaleString('ar-EG') : '—'}
                          <span className="text-muted-foreground"> ج.م</span>
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={r.status}
                        onChange={e => updateStatus(r.id, e.target.value)}
                        disabled={loading === r.id}
                        className={`text-xs rounded-lg border border-input px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring ${cfg.badge}`}
                      >
                        {Object.entries(statusConfig).map(([val, c]) => (
                          <option key={val} value={val}>{c.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(r.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`https://wa.me/${r.phone.replace(/\D/g, '')}?text=${buildWAMessage(r)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        رد
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">صفحة {page} من {totalPages}</p>
            <div className="flex gap-2">
              {page > 1 && (
                <Button variant="outline" size="sm" onClick={() => router.push(buildUrl({ page: String(page-1) }))}>
                  <ChevronRight className="w-4 h-4" /> السابق
                </Button>
              )}
              {page < totalPages && (
                <Button variant="outline" size="sm" onClick={() => router.push(buildUrl({ page: String(page+1) }))}>
                  التالي <ChevronLeft className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
