'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, Phone, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[0-9+]{10,15}$/.test(phone.trim())) {
      setError('رقم الهاتف غير صحيح (01xxxxxxxxx)');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
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
            أدخل رقم هاتفك وهنبعتلك رابط إعادة التعيين على واتساب
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
                لو رقمك مسجّل عندنا، هتلاقي رابط إعادة تعيين كلمة المرور وصلك على واتساب.
                الرابط صالح لمدة 30 دقيقة.
              </p>
              <Button variant="outline" size="lg" className="w-full mt-6" asChild>
                <Link href="/auth/signin">العودة لتسجيل الدخول</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="phone">رقم الهاتف</Label>
                <div className="relative mt-1.5">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="phone" type="tel" value={phone}
                    onChange={(e) => { setPhone(e.target.value); setError(''); }}
                    placeholder="01xxxxxxxxx" dir="ltr"
                    className={`pr-10 ${error ? 'border-destructive' : ''}`}
                    autoComplete="tel" />
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
