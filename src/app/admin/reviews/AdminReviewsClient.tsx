'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, CheckCircle2, Trash2, Pin, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface Review {
  id: string; author_name: string; rating: number; content: string;
  deal_type?: string | null; district?: string | null;
  is_approved: boolean; is_featured: boolean; created_at: string;
}

export default function AdminReviewsClient({ initialCounts }: { initialCounts: { pending: number; approved: number } }) {
  const [tab,     setTab]     = useState<'pending' | 'approved'>('pending');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [counts,  setCounts]  = useState(initialCounts);
  const [loading, setLoading] = useState(true);
  const [acting,  setActing]  = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews?status=${tab}`);
      const d   = await res.json();
      setReviews(d.reviews ?? []);
    } catch { toast.error('فشل التحميل'); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  async function approve(id: string) {
    setActing(id);
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_approved: true }),
    });
    if (res.ok) {
      toast.success('✅ تم النشر');
      setReviews(r => r.filter(x => x.id !== id));
      setCounts(c => ({ ...c, pending: c.pending - 1, approved: c.approved + 1 }));
    }
    setActing(null);
  }

  async function toggleFeatured(review: Review) {
    setActing(review.id);
    await fetch(`/api/admin/reviews/${review.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_featured: !review.is_featured }),
    });
    toast.success(review.is_featured ? 'أُزيل من المميز' : '⭐ تم التمييز');
    setReviews(r => r.map(x => x.id === review.id ? { ...x, is_featured: !x.is_featured } : x));
    setActing(null);
  }

  async function deleteReview(id: string) {
    if (!confirm('حذف هذا التقييم؟')) return;
    setActing(id);
    await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
    toast.success('تم الحذف');
    setReviews(r => r.filter(x => x.id !== id));
    setCounts(c => ({ ...c, [tab]: Math.max(0, c[tab] - 1) }));
    setActing(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">تقييمات العملاء</h1>
          <p className="text-sm text-muted-foreground mt-0.5">راجع تقييمات العملاء وانشرها</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-2">
          <RefreshCw className="w-4 h-4" /> تحديث
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {([['pending', `⏳ قيد المراجعة`, counts.pending], ['approved', `✅ منشورة`, counts.approved]] as const).map(([key, label, count]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === key ? 'bg-navy text-white dark:bg-ivory dark:text-navy shadow-md' : 'bg-card border border-border text-muted-foreground hover:border-gold/40'
            }`}>
            {label}
            <span className="text-xs bg-gold/15 text-gold px-2 py-0.5 rounded-full border border-gold/30">{count}</span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-32 bg-muted/40 rounded-2xl animate-pulse" />)}</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-5xl mb-4">⭐</p>
          <p className="font-semibold">لا توجد تقييمات في هذا القسم</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className={`bg-card border rounded-2xl p-5 transition-colors ${r.is_featured ? 'border-gold/50 bg-gold/5' : 'border-border hover:border-gold/30'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center text-gold font-bold text-lg shrink-0">
                    {r.author_name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-foreground text-sm">{r.author_name}</p>
                      {r.is_featured && <span className="text-[10px] bg-gold/20 text-gold px-2 py-0.5 rounded-full font-bold border border-gold/30">⭐ مميز</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= r.rating ? 'fill-gold text-gold' : 'text-muted-foreground/30'}`} />)}
                      </div>
                      {r.deal_type && <span className="text-xs text-muted-foreground">• {r.deal_type}</span>}
                      {r.district  && <span className="text-xs text-muted-foreground">• {r.district}</span>}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground shrink-0">
                  {new Date(r.created_at).toLocaleDateString('ar-EG')}
                </p>
              </div>

              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{r.content}</p>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/60">
                {tab === 'pending' && (
                  <Button size="sm" variant="gold" className="gap-1.5" disabled={!!acting}
                    onClick={() => approve(r.id)}>
                    <CheckCircle2 className="w-4 h-4" />
                    {acting === r.id ? 'جار...' : 'نشر'}
                  </Button>
                )}
                {tab === 'approved' && (
                  <Button size="sm" variant="outline" className={`gap-1.5 ${r.is_featured ? 'border-gold text-gold' : ''}`}
                    disabled={!!acting} onClick={() => toggleFeatured(r)}>
                    <Pin className="w-4 h-4" />
                    {r.is_featured ? 'إزالة التمييز' : 'تمييز ⭐'}
                  </Button>
                )}
                <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:bg-destructive/10 border-destructive/30 mr-auto"
                  disabled={!!acting} onClick={() => deleteReview(r.id)}>
                  <Trash2 className="w-4 h-4" /> حذف
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
