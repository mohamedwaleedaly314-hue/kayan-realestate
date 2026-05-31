'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle2, XCircle, Clock, MapPin, DollarSign,
  Maximize2, Phone, ExternalLink, RefreshCw, User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice, formatArea } from '@/lib/utils';
import toast from 'react-hot-toast';

type Tab = 'PENDING' | 'APPROVED' | 'REJECTED';

interface Submission {
  id: string;
  title_ar: string;
  slug: string;
  price: number;
  area_m2: number;
  rooms?: number | null;
  type: string;
  district: string;
  is_free_listing: boolean;
  free_listing_until?: string | null;
  created_at: string;
  listing_status: string;
  rejection_reason?: string | null;
  owner?: {
    name?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
  } | null;
  images: Array<{ url: string }>;
}

interface Props {
  initialCounts: { pending: number; approved: number; rejected: number };
}

export default function AdminSubmissionsClient({ initialCounts }: Props) {
  const [tab,          setTab]     = useState<Tab>('PENDING');
  const [submissions,  setSubs]    = useState<Submission[]>([]);
  const [counts,       setCounts]  = useState(initialCounts);
  const [loading,      setLoading] = useState(true);
  const [rejModal,     setRejModal] = useState<{ id: string; title: string } | null>(null);
  const [rejReason,    setRejReason] = useState('');
  const [acting,       setActing]  = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/submissions?status=${tab}`);
      const data = await res.json();
      setSubs(data.submissions ?? []);
    } catch { toast.error('فشل التحميل'); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  async function act(id: string, action: 'approve' | 'reject', reason?: string) {
    setActing(id);
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, rejection_reason: reason ?? null }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? 'فشل'); return; }

      toast.success(action === 'approve' ? '✅ تمت الموافقة — العقار منشور الآن' : '❌ تم الرفض');
      setSubs(prev => prev.filter(s => s.id !== id));

      // Update counts
      if (action === 'approve') {
        setCounts(c => ({ ...c, pending: c.pending - 1, approved: c.approved + 1 }));
      } else {
        setCounts(c => ({ ...c, pending: c.pending - 1, rejected: c.rejected + 1 }));
      }
    } catch { toast.error('حدث خطأ'); }
    finally { setActing(null); setRejModal(null); setRejReason(''); }
  }

  const TABS: { key: Tab; label: string; color: string; count: number }[] = [
    { key: 'PENDING',  label: '⏳ قيد المراجعة', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', count: counts.pending },
    { key: 'APPROVED', label: '✅ موافق عليها',  color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', count: counts.approved },
    { key: 'REJECTED', label: '❌ مرفوضة',       color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', count: counts.rejected },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">عروض المالكين</h1>
          <p className="text-sm text-muted-foreground mt-0.5">مراجعة وإدارة العقارات المقدمة من المالكين</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-2">
          <RefreshCw className="w-4 h-4" /> تحديث
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all
              ${tab === t.key ? 'bg-navy text-white dark:bg-ivory dark:text-navy shadow-md' : 'bg-card border border-border text-muted-foreground hover:border-gold/40'}`}>
            {t.label}
            <span className={`text-xs px-2 py-0.5 rounded-full ${t.color}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-40 bg-muted/40 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-5xl mb-4">🏠</p>
          <p className="font-semibold">لا توجد عقارات في هذه القسم</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map(sub => {
            const img = sub.images[0]?.url;
            const ownerPhone = sub.owner?.phone;
            const ownerWA    = sub.owner?.whatsapp;
            const waLink = (ownerWA || ownerPhone)
              ? `https://wa.me/${(ownerWA || ownerPhone)!.replace(/\D/g,'')}`
              : null;
            const expiry = sub.free_listing_until
              ? new Date(sub.free_listing_until).toLocaleDateString('ar-EG')
              : null;

            return (
              <div key={sub.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-gold/30 transition-colors">
                <div className="flex gap-4 p-4">
                  {/* Thumbnail */}
                  <div className="w-32 h-28 rounded-xl overflow-hidden shrink-0 bg-muted relative">
                    {img ? (
                      <Image src={img} alt={sub.title_ar} fill className="object-cover" sizes="128px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-foreground truncate">{sub.title_ar}</h3>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {sub.is_free_listing && (
                          <span className="text-[10px] bg-gold/15 text-gold px-2 py-0.5 rounded-full font-bold border border-gold/30">مجاني</span>
                        )}
                        {expiry && (
                          <span className="text-[10px] text-muted-foreground">{expiry}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gold" />{sub.district}</span>
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3 text-gold" />{formatPrice(sub.price)}</span>
                      <span className="flex items-center gap-1"><Maximize2 className="w-3 h-3 text-gold" />{formatArea(sub.area_m2)}</span>
                      {sub.rooms && <span className="flex items-center gap-1">🛏️ {sub.rooms} غرف</span>}
                    </div>

                    {/* Owner */}
                    {(sub.owner?.name || ownerPhone) && (
                      <div className="flex items-center gap-3 pt-1">
                        <span className="flex items-center gap-1 text-xs text-foreground">
                          <User className="w-3 h-3 text-gold" />
                          {sub.owner?.name ?? '—'}
                        </span>
                        {ownerPhone && (
                          <span className="flex items-center gap-1 text-xs font-mono text-foreground" dir="ltr">
                            <Phone className="w-3 h-3 text-gold" />
                            {ownerPhone}
                          </span>
                        )}
                      </div>
                    )}

                    {sub.rejection_reason && (
                      <p className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded-lg">
                        سبب الرفض: {sub.rejection_reason}
                      </p>
                    )}

                    <p className="text-[11px] text-muted-foreground">
                      <Clock className="w-3 h-3 inline ml-1" />
                      {new Date(sub.created_at).toLocaleDateString('ar-EG', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {tab === 'PENDING' && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-muted/30 border-t border-border/60">
                    <Button size="sm" variant="gold" className="gap-1.5" disabled={!!acting}
                      onClick={() => act(sub.id, 'approve')}>
                      <CheckCircle2 className="w-4 h-4" />
                      {acting === sub.id ? 'جار...' : 'موافقة'}
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:bg-destructive/10 border-destructive/30"
                      disabled={!!acting}
                      onClick={() => setRejModal({ id: sub.id, title: sub.title_ar })}>
                      <XCircle className="w-4 h-4" />
                      رفض
                    </Button>
                    {waLink && (
                      <a href={waLink} target="_blank" rel="noopener noreferrer"
                        className="mr-auto flex items-center gap-1.5 text-xs text-[#25D366] hover:underline font-semibold">
                        <span>📱</span> تواصل مع المالك
                      </a>
                    )}
                    <Link href={`/admin/properties/${sub.id}/edit`}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-gold ml-2">
                      <ExternalLink className="w-3.5 h-3.5" /> تعديل
                    </Link>
                  </div>
                )}

                {tab === 'APPROVED' && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50/50 dark:bg-emerald-900/10 border-t border-emerald-200/60 dark:border-emerald-800/40">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">منشور ومتاح للعملاء</span>
                    <Link href={`/properties/${sub.slug}`} target="_blank"
                      className="mr-auto text-xs text-gold hover:underline flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> عرض الإعلان
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reject modal */}
      {rejModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-foreground mb-1">رفض الطلب</h3>
            <p className="text-sm text-muted-foreground mb-4 truncate">"{rejModal.title}"</p>
            <label className="block text-sm font-medium mb-2">سبب الرفض (اختياري)</label>
            <textarea
              value={rejReason}
              onChange={e => setRejReason(e.target.value)}
              placeholder="مثال: الصور غير واضحة — السعر غير واقعي — منطقة خارج نطاق الخدمة"
              className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-destructive/30"
              rows={3}
            />
            <div className="flex gap-3 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => { setRejModal(null); setRejReason(''); }}>
                إلغاء
              </Button>
              <Button className="flex-1 bg-destructive text-white hover:bg-destructive/90"
                disabled={!!acting}
                onClick={() => act(rejModal.id, 'reject', rejReason)}>
                {acting ? 'جار...' : 'تأكيد الرفض'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
