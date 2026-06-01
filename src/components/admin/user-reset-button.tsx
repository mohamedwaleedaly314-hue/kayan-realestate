'use client';

import { useState } from 'react';
import { KeyRound, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  userId: string;
  name: string;
  phone?: string | null;
}

/** International (WhatsApp) form of a local Egyptian number. */
function toWa(phone: string): string {
  const d = phone.replace(/\D/g, '');
  if (d.startsWith('20')) return d;
  if (d.startsWith('0')) return `20${d.slice(1)}`;
  return d;
}

export default function UserResetButton({ userId, name, phone }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-link`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'تعذّر إنشاء الرابط');

      // Copy the link as a safety net regardless of channel.
      try { await navigator.clipboard.writeText(data.url); } catch { /* ignore */ }

      if (phone) {
        const msg = encodeURIComponent(
          `مرحباً ${name}،\nده رابط إعادة تعيين كلمة المرور لحسابك في كيان للعقارات (صالح 30 دقيقة):\n${data.url}`
        );
        window.open(`https://wa.me/${toWa(phone)}?text=${msg}`, '_blank');
        toast.success('تم نسخ الرابط وفتح واتساب لإرساله للعميل');
      } else {
        toast.success('تم نسخ رابط الاستعادة — أرسله للعميل');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title="إنشاء رابط استعادة كلمة المرور وإرساله للعميل"
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-gold hover:border-gold/40 transition-colors disabled:opacity-60"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
      استعادة كلمة المرور
    </button>
  );
}
