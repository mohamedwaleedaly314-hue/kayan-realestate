'use client';

import { useState } from 'react';
import { Phone, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { leadSchema } from '@/lib/validations';
import toast from 'react-hot-toast';

interface LeadFormProps {
  propertyId: string;
  propertyTitle: string;
}

export default function LeadForm({ propertyId, propertyTitle }: LeadFormProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      message: formData.get('message') as string,
      property_id: propertyId,
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

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'حدث خطأ');
      }

      setSubmitted(true);
      toast.success('تم إرسال طلبك بنجاح! سيتواصل معك فريقنا قريباً');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="luxury-card p-6 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="font-bold text-lg mb-2">تم استلام طلبك!</h3>
        <p className="text-muted-foreground text-sm">
          سيتواصل معك فريق كيان للعقارات خلال 24 ساعة
        </p>
      </div>
    );
  }

  return (
    <div className="luxury-card p-6">
      <h3 className="font-bold text-lg mb-1">استفسر عن هذا العقار</h3>
      <p className="text-sm text-muted-foreground mb-5">
        {propertyTitle.slice(0, 50)}...
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">الاسم *</Label>
          <Input
            id="name"
            name="name"
            placeholder="اسمك الكامل"
            required
            minLength={2}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="phone">رقم الهاتف *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="01xxxxxxxxx"
            required
            className="mt-1.5"
            dir="ltr"
          />
        </div>
        <div>
          <Label htmlFor="message">رسالتك (اختياري)</Label>
          <textarea
            id="message"
            name="message"
            rows={3}
            placeholder="أي تفاصيل إضافية..."
            maxLength={500}
            className="mt-1.5 flex w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none"
          />
        </div>
        <Button type="submit" variant="gold" className="w-full gap-2" disabled={loading}>
          <Send className="w-4 h-4" />
          {loading ? 'جاري الإرسال...' : 'أرسل الاستفسار'}
        </Button>
      </form>
    </div>
  );
}
