'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { leadSchema } from '@/lib/validations';
import toast from 'react-hot-toast';

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  // Login is required to send a message, so prefill from the user's account.
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setName(d.user.name ?? '');
          setPhone(d.user.phone ?? '');
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      message: formData.get('message') as string,
      source: 'WEBSITE' as const,
    };

    const result = leadSchema.safeParse(data);
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? 'بيانات غير صحيحة');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });

      if (res.status === 401) {
        toast.error('سجّل دخولك أولاً لإرسال رسالة');
        router.push(`/auth/signin?from=${encodeURIComponent(pathname)}`);
        return;
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'حدث خطأ');
      }

      setSubmitted(true);
      toast.success('تم إرسال رسالتك بنجاح!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="luxury-card p-10 text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
          <Send className="w-9 h-9 text-green-600" />
        </div>
        <h3 className="text-xl font-bold mb-3">شكراً لتواصلك معنا!</h3>
        <p className="text-muted-foreground">
          سيتواصل معك فريق كيان للعقارات في أقرب وقت ممكن.
        </p>
      </div>
    );
  }

  return (
    <div className="luxury-card p-8">
      <h2 className="text-xl font-bold mb-6 text-navy dark:text-ivory">أرسل لنا رسالة</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="c-name">الاسم الكامل *</Label>
          <Input id="c-name" name="name" placeholder="اسمك" required minLength={2} className="mt-1.5"
            value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="c-phone">رقم الهاتف *</Label>
          <Input id="c-phone" name="phone" type="tel" placeholder="01xxxxxxxxx" required className="mt-1.5" dir="ltr"
            value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="c-message">رسالتك</Label>
          <textarea
            id="c-message"
            name="message"
            rows={5}
            placeholder="كيف يمكننا مساعدتك؟"
            maxLength={1000}
            className="mt-1.5 flex w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none"
          />
        </div>
        <Button type="submit" variant="gold" size="lg" className="w-full gap-2" disabled={loading}>
          <Send className="w-4 h-4" />
          {loading ? 'جاري الإرسال...' : 'إرسال الرسالة'}
        </Button>
      </form>
    </div>
  );
}
