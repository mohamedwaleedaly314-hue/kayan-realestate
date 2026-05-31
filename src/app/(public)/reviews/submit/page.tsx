'use client';

import { useState } from 'react';
import { Star, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { allDistricts } from '@/lib/districts';

export default function SubmitReviewPage() {
  const [form, setForm] = useState({
    author_name: '', rating: 5, content: '', deal_type: '', district: '',
  });
  const [submitting, setSub] = useState(false);
  const [done,       setDone] = useState(false);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.author_name.trim()) return toast.error('أدخل اسمك');
    if (!form.content.trim() || form.content.length < 10) return toast.error('اكتب تجربتك (10 أحرف على الأقل)');
    setSub(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, deal_type: form.deal_type || undefined, district: form.district || undefined }),
      });
      if (!res.ok) { const d = await res.json(); toast.error(d.error ?? 'حدث خطأ'); return; }
      setDone(true);
    } catch { toast.error('حدث خطأ، حاول مرة أخرى'); }
    finally { setSub(false); }
  }

  if (done) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold mb-3">شكراً لك! 🎉</h2>
        <p className="text-muted-foreground mb-6">
          تم استلام تقييمك وسيظهر على الموقع بعد مراجعته من فريقنا.
        </p>
        <a href="/" className="inline-flex items-center gap-2 bg-gold text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gold/90 transition-colors">
          🏠 الرئيسية
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container-kayan max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-gold fill-gold" />
          </div>
          <h1 className="text-2xl font-bold">شارك تجربتك معنا</h1>
          <p className="text-muted-foreground mt-2">رأيك يساعد العملاء الآخرين ويطورنا</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-3xl p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">اسمك <span className="text-destructive">*</span></label>
            <input type="text" value={form.author_name} onChange={e => set('author_name', e.target.value)}
              placeholder="مثال: محمد أحمد"
              className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50" maxLength={80} />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-semibold mb-2">تقييمك</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button" onClick={() => set('rating', s)}>
                  <Star className={`w-8 h-8 transition-colors ${s <= form.rating ? 'fill-gold text-gold' : 'text-muted-foreground/30 hover:text-gold/50'}`} />
                </button>
              ))}
              <span className="text-sm text-muted-foreground mr-2 self-center">
                {['', 'سيئ', 'مقبول', 'جيد', 'ممتاز', 'رائع'][form.rating]}
              </span>
            </div>
          </div>

          {/* Deal type & district */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1.5">نوع الصفقة</label>
              <select value={form.deal_type} onChange={e => set('deal_type', e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30">
                <option value="">اختياري</option>
                <option value="بيع">بيع</option>
                <option value="إيجار">إيجار</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">الحي</label>
              <select value={form.district} onChange={e => set('district', e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30">
                <option value="">اختياري</option>
                {allDistricts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">تجربتك <span className="text-destructive">*</span></label>
            <textarea value={form.content} onChange={e => set('content', e.target.value)}
              placeholder="اكتب عن تجربتك مع كيان للعقارات — الخدمة، السرعة، النتيجة..."
              rows={5} maxLength={800}
              className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50" />
            <p className="text-xs text-muted-foreground text-left mt-1">{form.content.length}/800</p>
          </div>

          <Button type="submit" variant="gold" className="w-full gap-2 h-12 text-base" disabled={submitting}>
            <Send className="w-5 h-5" />
            {submitting ? 'جار الإرسال...' : 'إرسال التقييم'}
          </Button>
        </form>
      </div>
    </div>
  );
}
