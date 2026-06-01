'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Building2, Eye, EyeOff, Mail, Lock, User, Phone, MapPin, CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { allDistricts } from '@/lib/districts';
import toast from 'react-hot-toast';

/* ── password strength ──────────────────────────────────────────── */
function getStrength(pw: string) {
  let s = 0;
  if (pw.length >= 8)          s++;
  if (pw.length >= 12)         s++;
  if (/[A-Z]/.test(pw))       s++;
  if (/[0-9]/.test(pw))       s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const map = [
    { label: 'ضعيفة جداً', color: 'bg-red-500'    },
    { label: 'ضعيفة',      color: 'bg-orange-500'  },
    { label: 'متوسطة',     color: 'bg-yellow-500'  },
    { label: 'قوية',       color: 'bg-blue-500'    },
    { label: 'قوية جداً',  color: 'bg-green-500'   },
  ];
  return { score: s, ...map[Math.max(0, s - 1)] };
}

/* ── step indicator ─────────────────────────────────────────────── */
function StepDot({ n, current, done }: { n: number; current: number; done: boolean }) {
  const active = n === current;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
        done   ? 'bg-green-500 text-white' :
        active ? 'bg-gold text-white ring-2 ring-gold/30' :
                 'bg-muted text-muted-foreground'
      }`}>
        {done ? <CheckCircle2 className="w-4 h-4" /> : n}
      </div>
    </div>
  );
}

export default function SignUpForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const from         = searchParams.get('from') ?? '/profile';

  const [step,    setStep]    = useState(1); // 1 = personal info, 2 = location+pass
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [errors,  setErrors]  = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: '', email: '', phone: '', district: '', password: '',
  });

  const strength = form.password ? getStrength(form.password) : null;

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  }

  /* ── step 1 validation ──────────────────────────────────────── */
  function nextStep() {
    const errs: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      errs.name = 'الاسم يجب أن يكون حرفين على الأقل';
    if (!form.phone.trim() || !/^[0-9+]{10,15}$/.test(form.phone.trim()))
      errs.phone = 'رقم الهاتف مطلوب (01xxxxxxxxx)';
    // Email is optional — only validate format if the user typed something.
    if (form.email.trim() && !form.email.includes('@'))
      errs.email = 'بريد إلكتروني غير صحيح';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep(2);
  }

  /* ── final submit ───────────────────────────────────────────── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (form.password.length < 8)
      errs.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res  = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'خطأ في إنشاء الحساب');
      toast.success(`مرحباً ${data.user.name}! تم إنشاء حسابك بنجاح 🎉`);
      router.push(from);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory dark:bg-navy-900 px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gold flex items-center justify-center shadow-md">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-navy dark:text-ivory">كيان للعقارات</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">إنشاء حساب جديد</h1>
          <p className="text-muted-foreground text-sm mt-1">
            سجّل الآن لحفظ العقارات ومتابعة استفساراتك
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <StepDot n={1} current={step} done={step > 1} />
          <div className={`flex-1 h-0.5 rounded transition-colors ${step > 1 ? 'bg-green-500' : 'bg-muted'}`} />
          <StepDot n={2} current={step} done={false} />
        </div>

        <div className="bg-card rounded-3xl shadow-sm border border-border p-8">

          {/* ─── STEP 1: personal info ──────────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-5">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">الخطوة ١ من ٢</p>
                <p className="font-semibold text-foreground mt-1">البيانات الشخصية</p>
              </div>

              {/* Name */}
              <div>
                <Label htmlFor="name">الاسم الكامل <span className="text-destructive">*</span></Label>
                <div className="relative mt-1.5">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="name" value={form.name} onChange={e => set('name', e.target.value)}
                    placeholder="محمد أحمد علي" className={`pr-10 ${errors.name ? 'border-destructive' : ''}`}
                    autoComplete="name" />
                </div>
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Phone — REQUIRED (primary identifier) */}
              <div>
                <Label htmlFor="phone">
                  رقم الهاتف <span className="text-destructive">*</span>
                  <span className="text-xs text-muted-foreground mr-1">(تسجّل وتدخل به)</span>
                </Label>
                <div className="relative mt-1.5">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="phone" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="01xxxxxxxxx" dir="ltr"
                    className={`pr-10 ${errors.phone ? 'border-destructive' : ''}`}
                    autoComplete="tel" />
                </div>
                {errors.phone
                  ? <p className="text-destructive text-xs mt-1">{errors.phone}</p>
                  : <p className="text-muted-foreground text-xs mt-1">رقمك هو وسيلة الدخول والتواصل معك</p>}
              </div>

              {/* Email — OPTIONAL */}
              <div>
                <Label htmlFor="email">
                  البريد الإلكتروني
                  <span className="text-muted-foreground font-normal text-xs mr-1">(اختياري)</span>
                </Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="example@email.com" dir="ltr"
                    className={`pr-10 ${errors.email ? 'border-destructive' : ''}`}
                    autoComplete="email" />
                </div>
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
              </div>

              <Button type="button" variant="gold" size="lg" className="w-full mt-2" onClick={nextStep}>
                التالي ←
              </Button>
            </div>
          )}

          {/* ─── STEP 2: district + password ─────────────────────── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center mb-5">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">الخطوة ٢ من ٢</p>
                <p className="font-semibold text-foreground mt-1">موقعك وكلمة المرور</p>
              </div>

              {/* District */}
              <div>
                <Label htmlFor="district">
                  مجاورتك في مايو
                  <span className="text-muted-foreground font-normal text-xs mr-1">(اختياري — يساعدنا نقترح عقارات قريبة)</span>
                </Label>
                <div className="relative mt-1.5">
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <select
                    id="district"
                    value={form.district}
                    onChange={e => set('district', e.target.value)}
                    className="w-full pr-10 pl-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 appearance-none"
                  >
                    <option value="">— اختر مجاورتك —</option>
                    {allDistricts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                {form.district && (
                  <p className="text-green-600 dark:text-green-400 text-xs mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> ممتاز! سنقترح عليك عقارات في {form.district}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">كلمة المرور <span className="text-destructive">*</span></Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type={showPass ? 'text' : 'password'} value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="••••••••" dir="ltr"
                    className={`pr-10 pl-10 ${errors.password ? 'border-destructive' : ''}`}
                    autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
                {strength && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= strength.score ? strength.color : 'bg-muted'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">قوة كلمة المرور: <span className="font-medium">{strength.label}</span></p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-2">
                <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => setStep(1)}>
                  ← رجوع
                </Button>
                <Button type="submit" variant="gold" size="lg" className="flex-1" disabled={loading}>
                  {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب 🎉'}
                </Button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            لديك حساب بالفعل؟{' '}
            <Link href="/auth/signin" className="text-gold font-medium hover:underline">تسجيل الدخول</Link>
          </p>
        </div>

        {/* trust badges */}
        <div className="flex items-center justify-center gap-6 mt-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">🔒 بياناتك آمنة</span>
          <span className="flex items-center gap-1">📍 خاص بمايو</span>
          <span className="flex items-center gap-1">⚡ تسجيل سريع</span>
        </div>
      </div>
    </div>
  );
}
