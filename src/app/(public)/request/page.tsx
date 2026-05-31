'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ClipboardList, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { districtGroups } from '@/lib/districts';
import toast from 'react-hot-toast';

export default function RequestPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', type: 'SALE',
    district: '', min_price: '', max_price: '', rooms: '', notes: '',
  });

  function set(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        name: form.name, phone: form.phone, type: form.type,
      };
      if (form.email)     body.email     = form.email;
      if (form.district)  body.district  = form.district;
      if (form.min_price) body.min_price = Number(form.min_price);
      if (form.max_price) body.max_price = Number(form.max_price);
      if (form.rooms)     body.rooms     = Number(form.rooms);
      if (form.notes)     body.notes     = form.notes;

      const res = await fetch('/api/property-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      toast.error('حدث خطأ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-gold/15 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-gold" />
          </div>
          <h1 className="text-2xl font-bold mb-3">تم إرسال طلبك بنجاح! 🎉</h1>
          <p className="text-muted-foreground leading-relaxed mb-8">
            سيتواصل معك فريق كيان في أقرب وقت ممكن بأفضل العقارات المطابقة لطلبك.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="gold" asChild>
              <Link href="/properties">تصفح العقارات</Link>
            </Button>
            <Button variant="outline" onClick={() => setSubmitted(false)}>
              إرسال طلب آخر
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-background">
      {/* Header */}
      <div className="bg-navy py-12">
        <div className="container-kayan">
          <Link href="/properties" className="inline-flex items-center gap-2 text-ivory/70 hover:text-ivory text-sm mb-4 transition-colors">
            <ArrowRight className="w-4 h-4" />
            العودة للعقارات
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-gold" />
            طلب عقار
          </h1>
          <p className="text-ivory/60 mt-2 max-w-xl">
            أخبرنا بالتفاصيل وسيجد فريقنا لك أفضل العقارات المطابقة لميزانيتك وتفضيلاتك
          </p>
        </div>
      </div>

      <div className="container-kayan py-10">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Contact info */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
              <h2 className="font-bold text-lg border-b border-border pb-3">بيانات التواصل</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>الاسم الكريم *</Label>
                  <Input value={form.name} onChange={e => set('name', e.target.value)}
                    placeholder="محمد أحمد" required className="mt-1.5" />
                </div>
                <div>
                  <Label>رقم الهاتف / واتساب *</Label>
                  <Input value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="01xxxxxxxxx" dir="ltr" required className="mt-1.5" />
                </div>
                <div className="sm:col-span-2">
                  <Label>البريد الإلكتروني (اختياري)</Label>
                  <Input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="example@email.com" dir="ltr" className="mt-1.5" />
                </div>
              </div>
            </div>

            {/* Property preferences */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
              <h2 className="font-bold text-lg border-b border-border pb-3">تفضيلات العقار</h2>

              {/* Type */}
              <div>
                <Label className="mb-2 block">نوع العملية *</Label>
                <div className="flex gap-3">
                  {[{ v: 'SALE', l: '🏠 للشراء' }, { v: 'RENT', l: '🔑 للإيجار' }].map(opt => (
                    <button key={opt.v} type="button" onClick={() => set('type', opt.v)}
                      className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                        form.type === opt.v
                          ? 'border-gold bg-gold/10 text-gold'
                          : 'border-border hover:border-gold/50'
                      }`}>
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* District */}
              <div>
                <Label>المنطقة المفضلة</Label>
                <select value={form.district} onChange={e => set('district', e.target.value)}
                  className="mt-1.5 flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">أي منطقة</option>
                  {districtGroups.map(g => (
                    <optgroup key={g.label} label={g.label}>
                      {g.districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Price range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>الحد الأدنى للسعر</Label>
                  <div className="relative mt-1.5">
                    <Input type="number" value={form.min_price} onChange={e => set('min_price', e.target.value)}
                      placeholder="200,000" dir="ltr" className="pl-14" />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">ج.م</span>
                  </div>
                </div>
                <div>
                  <Label>الحد الأقصى للسعر</Label>
                  <div className="relative mt-1.5">
                    <Input type="number" value={form.max_price} onChange={e => set('max_price', e.target.value)}
                      placeholder="1,000,000" dir="ltr" className="pl-14" />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">ج.م</span>
                  </div>
                </div>
              </div>

              {/* Rooms */}
              <div>
                <Label className="mb-2 block">عدد الغرف المطلوبة</Label>
                <div className="flex gap-2 flex-wrap">
                  {[{ v: '', l: 'أي عدد' }, { v: '1', l: '1' }, { v: '2', l: '2' }, { v: '3', l: '3' }, { v: '4', l: '4+' }].map(opt => (
                    <button key={opt.v} type="button" onClick={() => set('rooms', opt.v)}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                        form.rooms === opt.v
                          ? 'border-gold bg-gold/10 text-gold font-semibold'
                          : 'border-border hover:border-gold/50'
                      }`}>
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label>ملاحظات إضافية</Label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                  rows={3} maxLength={1000}
                  placeholder="أي تفاصيل إضافية... (طابق معين، مصعد، فيو، تشطيب...)"
                  className="mt-1.5 flex w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none transition-colors" />
              </div>
            </div>

            <Button type="submit" variant="gold" size="lg" className="w-full gap-2 h-13 text-base" disabled={loading}>
              {loading ? 'جاري الإرسال...' : '📩 إرسال الطلب'}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              سيتواصل معك فريق كيان خلال 24 ساعة عبر الهاتف أو الواتساب
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
