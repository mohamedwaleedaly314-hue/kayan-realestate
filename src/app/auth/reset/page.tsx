'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';

function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError('كلمة المرور 8 أحرف على الأقل'); return; }
    if (password !== confirm) { setError('كلمتا المرور غير متطابقتين'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'حدث خطأ');
      toast.success('تم تغيير كلمة المرور بنجاح 🎉');
      router.push('/profile');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="bg-card rounded-3xl shadow-sm border border-border p-8 text-center">
        <p className="text-muted-foreground text-sm">
          الرابط غير صالح. اطلب رابط إعادة تعيين جديد.
        </p>
        <Button variant="gold" size="lg" className="w-full mt-5" asChild>
          <Link href="/auth/forgot">طلب رابط جديد</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-3xl shadow-sm border border-border p-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="password">كلمة المرور الجديدة</Label>
          <div className="relative mt-1.5">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input id="password" type={showPass ? 'text' : 'password'} value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="••••••••" dir="ltr" className="pr-10 pl-10" autoComplete="new-password" />
            <button type="button" onClick={() => setShowPass(v => !v)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="confirm">تأكيد كلمة المرور</Label>
          <div className="relative mt-1.5">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input id="confirm" type={showPass ? 'text' : 'password'} value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setError(''); }}
              placeholder="••••••••" dir="ltr" className="pr-10" autoComplete="new-password" />
          </div>
          {error && <p className="text-destructive text-xs mt-1">{error}</p>}
        </div>

        <Button type="submit" variant="gold" size="lg" className="w-full mt-2" disabled={loading}>
          {loading ? 'جاري الحفظ...' : 'تعيين كلمة المرور'}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
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
          <h1 className="text-2xl font-bold text-foreground">تعيين كلمة مرور جديدة</h1>
          <p className="text-muted-foreground text-sm mt-1">اختر كلمة مرور قوية لحسابك</p>
        </div>
        <Suspense fallback={<div className="bg-card rounded-3xl border border-border p-8 h-48" />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
