'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, Eye, EyeOff, Phone, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? '/profile';

  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ phone: '', password: '' });

  function setField(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!/^[0-9+]{10,15}$/.test(form.phone.trim())) errs.phone = 'رقم الهاتف غير صحيح (01xxxxxxxxx)';
    if (!form.password) errs.password = 'أدخل كلمة المرور';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/user-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'خطأ في تسجيل الدخول');
      toast.success(`مرحباً ${data.user.name}!`);
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
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gold flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-navy dark:text-ivory">كيان للعقارات</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">تسجيل الدخول</h1>
          <p className="text-muted-foreground text-sm mt-1">ادخل برقم هاتفك لمتابعة عقاراتك المحفوظة</p>
        </div>

        <div className="bg-card rounded-3xl shadow-sm border border-border p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="phone">رقم الهاتف</Label>
              <div className="relative mt-1.5">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="phone" type="tel" value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  placeholder="01xxxxxxxxx" dir="ltr"
                  className={`pr-10 ${errors.phone ? 'border-destructive' : ''}`}
                  autoComplete="tel" />
              </div>
              {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={(e) => setField('password', e.target.value)}
                  placeholder="••••••••" dir="ltr"
                  className={`pr-10 pl-10 ${errors.password ? 'border-destructive' : ''}`}
                  autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
            </div>

            <Button type="submit" variant="gold" size="lg" className="w-full mt-2" disabled={loading}>
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            ليس لديك حساب؟{' '}
            <Link href="/auth/signup" className="text-gold font-medium hover:underline">إنشاء حساب جديد</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
