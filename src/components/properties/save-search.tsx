'use client';

import { useState } from 'react';
import { Bell, BellRing, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

interface SaveSearchProps {
  filters: Record<string, string | undefined>;
  userEmail?: string;
}

export default function SaveSearch({ filters, userEmail }: SaveSearchProps) {
  const [open,    setOpen]   = useState(false);
  const [email,   setEmail]  = useState(userEmail ?? '');
  const [loading, setLoading] = useState(false);
  const [saved,   setSaved]  = useState(false);

  /* count active filters (exclude page, sort) */
  const activeCount = Object.entries(filters)
    .filter(([k, v]) => v && v !== 'all' && k !== 'page' && k !== 'sort').length;

  if (activeCount === 0) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const body: Record<string, unknown> = { email };
      if (filters.type && filters.type !== 'all')     body.type      = filters.type;
      if (filters.district && filters.district !== 'all') body.district  = filters.district;
      if (filters.min_price) body.min_price = Number(filters.min_price);
      if (filters.max_price) body.max_price = Number(filters.max_price);
      if (filters.rooms)     body.rooms     = Number(filters.rooms);

      const res = await fetch('/api/search-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();

      if (data.duplicate) {
        toast('🔔 هذا البحث محفوظ بالفعل', { icon: 'ℹ️' });
      } else {
        toast.success('✅ سيتم إشعارك عند توفر عقارات مطابقة');
        setSaved(true);
      }
      setOpen(false);
    } catch {
      toast.error('حدث خطأ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <Button
        variant={saved ? 'gold' : 'outline'}
        size="sm"
        onClick={() => setOpen(v => !v)}
        className="gap-2 h-9 text-xs"
      >
        {saved ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
        {saved ? 'بحث محفوظ' : `حفظ البحث (${activeCount})`}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl z-50 p-4 animate-scale-in">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-sm">🔔 تنبيه البحث</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  نبّهني فوراً لما يُضاف عقار يطابق بحثي
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  إيميلك
                </label>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  dir="ltr"
                  className="h-9 text-sm"
                />
              </div>

              {/* summary chips */}
              <div className="flex flex-wrap gap-1">
                {filters.type && filters.type !== 'all' && (
                  <span className="text-xs bg-gold/10 text-gold px-2 py-0.5 rounded-full">
                    {filters.type === 'SALE' ? 'للبيع' : 'للإيجار'}
                  </span>
                )}
                {filters.district && filters.district !== 'all' && (
                  <span className="text-xs bg-navy/10 text-navy dark:bg-ivory/10 dark:text-ivory px-2 py-0.5 rounded-full">
                    {filters.district}
                  </span>
                )}
                {filters.min_price && (
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                    من {Number(filters.min_price).toLocaleString('ar-EG')} ج.م
                  </span>
                )}
                {filters.max_price && (
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                    حتى {Number(filters.max_price).toLocaleString('ar-EG')} ج.م
                  </span>
                )}
              </div>

              <Button type="submit" variant="gold" size="sm" className="w-full gap-2" disabled={loading}>
                <Check className="w-3.5 h-3.5" />
                {loading ? 'جاري الحفظ...' : 'احفظ وأرسل لي إشعاراً'}
              </Button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
