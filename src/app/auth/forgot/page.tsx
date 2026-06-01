'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('أدخل بريداً إلكترونياً صحيحاً');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'حدث خطأ');
      setSent(true);
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
          <h1 className="text-2xl font-bold text-foreground">نسيت كلمة المرور؟</h1>
          <p className="text-muted-foreground text-sm mt-1">
            أدخل بريدك الإلكتروني المسجّل وهنبعتلك رابط إعادة التعيين
          </p>
        </div>

        <div className="bg-card rounded-3xl shadow-sm border border-border p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="font-bold text-lg mb-2">تم الإرسال!</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                لو إيميلك مسجّل عندنا، هتلاقي رابط إعادة تعيين كلمة المرور وصلك على بريدك.
                الرابط صالح لمدة 30 دقيقة. (راجع صندوق الـ Spam لو ما لقيتهوش)
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed mt-3">
                سجّلت برقم موبايل من غير إيميل؟{' '}
                <Link href="/contact" className="text-gold hover:underline">تواصل مع المكتب</Link>
                {' '}وهنساعدك تستعيد حسابك.
              </p>
              <Button variant="outline" size="lg" className="w-full mt-6" asChild>
                <Link href="/auth/signin">العودة لتسجيل الدخول</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="example@email.com" dir="ltr"
                    className={`pr-10 ${error ? 'border-destructive' : ''}`}
                    autoComplete="email" />
                </div>
                {error && <p className="text-destructive text-xs mt-1">{error}</p>}
              </div>

              <Button type="submit" variant="gold" size="lg" className="w-full mt-2" disabled={loading}>
                {loading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            تذكرت كلمة المرور؟{' '}
            <Link href="/auth/signin" className="text-gold font-medium hover:underline">تسجيل الدخول</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
