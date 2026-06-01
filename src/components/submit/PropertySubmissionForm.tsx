'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home, DollarSign, Maximize2, BedDouble, Layers,
  ChevronLeft, ChevronRight, CheckCircle2, Upload,
  X, Clock, Calendar, Phone, User, Loader2, Info, Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { allDistricts } from '@/lib/districts';
import toast from 'react-hot-toast';
import Image from 'next/image';

const DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

const STEPS = [
  { label: 'النوع والموقع', icon: Home },
  { label: 'تفاصيل العقار', icon: Maximize2 },
  { label: 'مواعيد المعاينة', icon: Calendar },
  { label: 'الصور والتواصل', icon: Phone },
];

interface FormData {
  // Step 1
  type: 'SALE' | 'RENT';
  district: string;
  price: string;
  area_m2: string;
  rooms: string;
  // Step 2
  title_ar: string;
  description_ar: string;
  floor: string;
  has_elevator: boolean;
  // Step 3
  viewing_days: string[];
  viewing_time_from: string;
  viewing_time_to: string;
  // Step 4
  image_urls: string[];
  owner_name: string;
  owner_phone: string;
  owner_whatsapp: string;
  owner_email: string;
  accept_terms: boolean;
}

const initial: FormData = {
  type: 'SALE', district: '', price: '', area_m2: '', rooms: '',
  title_ar: '', description_ar: '', floor: '', has_elevator: false,
  viewing_days: [], viewing_time_from: '09:00', viewing_time_to: '18:00',
  image_urls: [], owner_name: '', owner_phone: '', owner_whatsapp: '', owner_email: '', accept_terms: false,
};

export default function PropertySubmissionForm() {
  const router = useRouter();
  const [step, setStep]     = useState(0);
  const [form, setForm]     = useState<FormData>(initial);
  const [submitting, setSub] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof FormData, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  // ── Validation per step ───────────────────────────────────────────
  function validate(s: number): string | null {
    if (s === 0) {
      if (!form.district)       return 'اختر المنطقة';
      if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
                                 return 'أدخل السعر';
      if (!form.area_m2 || isNaN(Number(form.area_m2)) || Number(form.area_m2) <= 0)
                                 return 'أدخل المساحة';
    }
    if (s === 1) {
      if (!form.title_ar || form.title_ar.trim().length < 3)
        return 'أدخل عنواناً لا يقل عن 3 أحرف';
    }
    if (s === 3) {
      if (!form.owner_name)  return 'أدخل اسمك';
      if (!form.owner_phone) return 'أدخل رقم هاتفك';
      if (!/^[0-9+]{7,15}$/.test(form.owner_phone)) return 'رقم الهاتف غير صحيح';
      if (!form.accept_terms) return 'يجب الموافقة على الشروط والأحكام';
    }
    return null;
  }

  function next() {
    const err = validate(step);
    if (err) { toast.error(err); return; }
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  }
  function prev() { setStep(s => Math.max(s - 1, 0)); }

  // ── Image Upload ──────────────────────────────────────────────────
  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (form.image_urls.length + files.length > 8) {
      toast.error('الحد الأقصى 8 صور'); return;
    }
    setUploading(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append('file', file);
      try {
        const res = await fetch('/api/submit-property/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) { toast.error(data.error ?? 'فشل رفع صورة'); continue; }
        newUrls.push(data.url);
      } catch { toast.error('خطأ في رفع الصورة'); }
    }
    set('image_urls', [...form.image_urls, ...newUrls]);
    setUploading(false);
  }

  function removeImage(idx: number) {
    set('image_urls', form.image_urls.filter((_, i) => i !== idx));
  }

  // ── Submit ────────────────────────────────────────────────────────
  async function handleSubmit() {
    const err = validate(3);
    if (err) { toast.error(err); return; }
    setSub(true);
    try {
      const res = await fetch('/api/submit-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: form.type,
          district: form.district,
          title_ar: form.title_ar,
          description_ar: form.description_ar || null,
          price: Number(form.price),
          area_m2: Number(form.area_m2),
          rooms: form.rooms ? parseInt(form.rooms) : null,
          floor: form.floor ? parseInt(form.floor) : null,
          has_elevator: form.has_elevator,
          viewing_days: form.viewing_days,
          viewing_time_from: form.viewing_time_from || null,
          viewing_time_to: form.viewing_time_to || null,
          owner_name: form.owner_name,
          owner_phone: form.owner_phone,
          owner_whatsapp: form.owner_whatsapp || null,
          owner_email: form.owner_email || null,
          image_urls: form.image_urls,
        }),
      });
      if (res.status === 401) {
        toast.error('سجّل دخولك أولاً لعرض عقارك');
        router.push('/auth/signin?from=/submit-property');
        return;
      }
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? 'حدث خطأ'); return; }
      router.push('/submit-property/success');
    } catch { toast.error('حدث خطأ في الإرسال'); }
    finally { setSub(false); }
  }

  // ── Step UI helpers ───────────────────────────────────────────────
  const inputCls = 'w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all';
  const labelCls = 'block text-sm font-semibold text-foreground mb-1.5';

  return (
    <div className="max-w-2xl mx-auto">
      {/* ── Progress bar ───────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => (
            <div key={i} className="flex flex-col items-center flex-1">
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold mb-1.5 transition-all',
                i < step  ? 'bg-emerald-500 text-white'
                : i === step ? 'bg-gold text-white shadow-md shadow-gold/30'
                : 'bg-muted text-muted-foreground'
              )}>
                {i < step ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
              </div>
              <span className={cn('text-[10px] font-medium text-center leading-tight hidden sm:block',
                i === step ? 'text-gold' : 'text-muted-foreground')}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div className="h-full bg-gradient-to-l from-gold to-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
      </div>

      {/* ── Step 0: النوع والموقع ──────────────────────────────────── */}
      {step === 0 && (
        <div className="space-y-5">
          <div>
            <p className={labelCls}>نوع العملية</p>
            <div className="grid grid-cols-2 gap-3">
              {([['SALE','🏠 للبيع'], ['RENT','🔑 للإيجار']] as const).map(([v,l]) => (
                <button key={v} type="button" onClick={() => set('type', v)}
                  className={cn('py-4 rounded-xl border-2 font-bold text-sm transition-all',
                    form.type === v
                      ? 'border-gold bg-gold/10 text-gold shadow-md'
                      : 'border-border text-muted-foreground hover:border-gold/40')}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>المنطقة <span className="text-destructive">*</span></label>
            <select value={form.district} onChange={e => set('district', e.target.value)} className={inputCls}>
              <option value="">اختر المنطقة</option>
              {allDistricts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>السعر (ج.م) <span className="text-destructive">*</span></label>
              <div className="relative">
                <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="number" placeholder="مثال: 750000" value={form.price}
                  onChange={e => set('price', e.target.value)}
                  className={cn(inputCls, 'pr-9')} min="0" />
              </div>
            </div>
            <div>
              <label className={labelCls}>المساحة (م²) <span className="text-destructive">*</span></label>
              <div className="relative">
                <Maximize2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="number" placeholder="مثال: 120" value={form.area_m2}
                  onChange={e => set('area_m2', e.target.value)}
                  className={cn(inputCls, 'pr-9')} min="0" />
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>عدد الغرف (اختياري)</label>
            <div className="flex gap-2">
              {['', '1', '2', '3', '4', '5+'].map(v => (
                <button key={v} type="button"
                  onClick={() => set('rooms', v === '5+' ? '5' : v)}
                  className={cn('flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all',
                    form.rooms === (v === '5+' ? '5' : v) && v !== ''
                      ? 'border-gold bg-gold/10 text-gold'
                      : !form.rooms && v === ''
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-border text-muted-foreground hover:border-gold/30')}>
                  {v || 'الكل'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 1: تفاصيل العقار ─────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label className={labelCls}>عنوان العقار <span className="text-destructive">*</span></label>
            <input type="text" placeholder="مثال: شقة 3 غرف للبيع بالحي الأول"
              value={form.title_ar} onChange={e => set('title_ar', e.target.value)}
              className={inputCls} maxLength={200} />
            <p className="text-xs text-muted-foreground mt-1">سيظهر هذا العنوان في الإعلان</p>
          </div>

          <div>
            <label className={labelCls}>وصف تفصيلي (اختياري)</label>
            <textarea placeholder="اكتب تفاصيل إضافية عن العقار — الموقع بالضبط، المميزات، الحالة..."
              value={form.description_ar} onChange={e => set('description_ar', e.target.value)}
              className={cn(inputCls, 'resize-none')} rows={4} maxLength={3000} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>رقم الطابق (اختياري)</label>
              <div className="relative">
                <Layers className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="number" placeholder="0 = أرضي" value={form.floor}
                  onChange={e => set('floor', e.target.value)}
                  className={cn(inputCls, 'pr-9')} min="0" max="200" />
              </div>
            </div>
            <div>
              <label className={labelCls}>عدد الغرف (اختياري)</label>
              <div className="relative">
                <BedDouble className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="number" placeholder="عدد الغرف" value={form.rooms}
                  onChange={e => set('rooms', e.target.value)}
                  className={cn(inputCls, 'pr-9')} min="0" max="50" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/30">
            <button type="button"
              onClick={() => set('has_elevator', !form.has_elevator)}
              className={cn('w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0',
                form.has_elevator ? 'bg-gold border-gold' : 'border-border')}>
              {form.has_elevator && <CheckCircle2 className="w-4 h-4 text-white" />}
            </button>
            <div>
              <p className="text-sm font-semibold">يوجد مصعد</p>
              <p className="text-xs text-muted-foreground">اختر هذا إذا كان المبنى يحتوي على مصعد</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: مواعيد المعاينة ──────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="p-4 bg-gold/5 border border-gold/20 rounded-xl flex gap-3">
            <Info className="w-5 h-5 text-gold shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              حدد الأيام والأوقات المناسبة لك لمعاينة العقار. سيتواصل معك المشترون المهتمون <strong>عبر مكتب كيان</strong> فقط.
            </p>
          </div>

          <div>
            <label className={labelCls}>الأيام المفضلة للمعاينة</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(d => (
                <button key={d} type="button"
                  onClick={() => set('viewing_days',
                    form.viewing_days.includes(d)
                      ? form.viewing_days.filter(x => x !== d)
                      : [...form.viewing_days, d]
                  )}
                  className={cn('px-4 py-2 rounded-full text-sm font-semibold border transition-all',
                    form.viewing_days.includes(d)
                      ? 'bg-gold text-white border-gold shadow-sm'
                      : 'border-border text-muted-foreground hover:border-gold/40')}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>من الساعة</label>
              <div className="relative">
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="time" value={form.viewing_time_from}
                  onChange={e => set('viewing_time_from', e.target.value)}
                  className={cn(inputCls, 'pr-9')} />
              </div>
            </div>
            <div>
              <label className={labelCls}>إلى الساعة</label>
              <div className="relative">
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="time" value={form.viewing_time_to}
                  onChange={e => set('viewing_time_to', e.target.value)}
                  className={cn(inputCls, 'pr-9')} />
              </div>
            </div>
          </div>

          {form.viewing_days.length > 0 && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
              <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                ✅ مواعيد المعاينة: {form.viewing_days.join(' — ')}
                {form.viewing_time_from && ` من ${form.viewing_time_from}`}
                {form.viewing_time_to   && ` حتى ${form.viewing_time_to}`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Step 3: الصور والتواصل ───────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Image upload */}
          <div>
            <label className={labelCls}>صور العقار (حتى 8 صور)</label>
            <div
              onClick={() => !uploading && fileRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
                uploading ? 'opacity-50 cursor-wait' : 'hover:border-gold/50 hover:bg-gold/5',
                'border-border'
              )}
            >
              {uploading ? (
                <Loader2 className="w-8 h-8 text-gold mx-auto mb-2 animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              )}
              <p className="text-sm font-medium">{uploading ? 'جار الرفع...' : 'انقر لإضافة صور'}</p>
              <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP — حتى 5MB لكل صورة</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
              onChange={e => handleFiles(e.target.files)} />

            {form.image_urls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {form.image_urls.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                    <Image src={url} alt="" fill className="object-cover" sizes="120px" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={() => removeImage(i)}
                        className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    {i === 0 && (
                      <span className="absolute top-1 right-1 bg-gold text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">رئيسية</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Owner info */}
          <div className="p-4 bg-navy/5 dark:bg-ivory/5 rounded-xl border border-border space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-gold" /> بياناتك كمالك
            </h3>

            <div>
              <label className={labelCls}>الاسم الكامل <span className="text-destructive">*</span></label>
              <input type="text" placeholder="اسمك" value={form.owner_name}
                onChange={e => set('owner_name', e.target.value)}
                className={inputCls} maxLength={100} />
            </div>

            <div>
              <label className={labelCls}>رقم الهاتف <span className="text-destructive">*</span></label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="tel" placeholder="01XXXXXXXXX" value={form.owner_phone} dir="ltr"
                  onChange={e => set('owner_phone', e.target.value)}
                  className={cn(inputCls, 'pr-9')} />
              </div>
              <div className="flex items-center gap-2 mt-2 p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  رقمك لن يُعرض للعملاء — التواصل يتم فقط عبر مكتب كيان للعقارات
                </p>
              </div>
            </div>

            <div>
              <label className={labelCls}>واتساب (اختياري)</label>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">📱</span>
                <input type="tel" placeholder="رقم واتساب" value={form.owner_whatsapp} dir="ltr"
                  onChange={e => set('owner_whatsapp', e.target.value)}
                  className={cn(inputCls, 'pr-9')} />
              </div>
            </div>

            <div>
              <label className={labelCls}>البريد الإلكتروني (اختياري)</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="email" placeholder="example@email.com" value={form.owner_email} dir="ltr"
                  onChange={e => set('owner_email', e.target.value)}
                  className={cn(inputCls, 'pr-9')} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                سيتم إرسال إشعار لك على بريدك عند الموافقة على إعلانك
              </p>
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-muted/30">
            <button type="button"
              onClick={() => set('accept_terms', !form.accept_terms)}
              className={cn('w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5',
                form.accept_terms ? 'bg-gold border-gold' : 'border-border')}>
              {form.accept_terms && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
            </button>
            <p className="text-sm text-muted-foreground leading-relaxed">
              أوافق على{' '}
              <a href="/policy" target="_blank" className="text-gold hover:underline font-semibold">
                شروط وأحكام كيان للعقارات
              </a>
              {' '}بما فيها سياسة العمولة (1% من قيمة البيع/الإيجار) والتي تُدفع فقط عند إتمام الصفقة.
            </p>
          </div>
        </div>
      )}

      {/* ── Navigation ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/60">
        <Button type="button" variant="outline" onClick={prev} disabled={step === 0} className="gap-2">
          <ChevronRight className="w-4 h-4" /> السابق
        </Button>

        <span className="text-xs text-muted-foreground">{step + 1} / {STEPS.length}</span>

        {step < STEPS.length - 1 ? (
          <Button type="button" variant="gold" onClick={next} className="gap-2">
            التالي <ChevronLeft className="w-4 h-4" />
          </Button>
        ) : (
          <Button type="button" variant="gold" onClick={handleSubmit} disabled={submitting} className="gap-2 min-w-[120px]">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> جار الإرسال...</> : '🚀 إرسال الطلب'}
          </Button>
        )}
      </div>
    </div>
  );
}
