'use client';

import { useMemo, useState } from 'react';
import { Calculator, Banknote, Percent, CalendarClock, Wallet } from 'lucide-react';

function egp(n: number): string {
  if (!isFinite(n) || n <= 0) return '0 ج.م';
  return `${Math.round(n).toLocaleString('en-US')} ج.م`;
}

export default function CalculatorPage() {
  const [price, setPrice] = useState('1000000');
  const [downPct, setDownPct] = useState('20');
  const [years, setYears] = useState('5');
  const [rate, setRate] = useState('0');

  const result = useMemo(() => {
    const P = Number(price) || 0;
    const down = (P * (Number(downPct) || 0)) / 100;
    const principal = Math.max(P - down, 0);
    const n = (Number(years) || 0) * 12;
    const annual = Number(rate) || 0;
    const r = annual / 100 / 12;

    if (principal <= 0 || n <= 0) {
      return { down, principal, monthly: 0, total: principal, interest: 0 };
    }
    const monthly = r === 0
      ? principal / n
      : (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = monthly * n;
    return { down, principal, monthly, total, interest: total - principal };
  }, [price, downPct, years, rate]);

  const inputCls =
    'w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all';
  const labelCls = 'flex items-center gap-2 text-sm font-semibold text-foreground mb-1.5';

  return (
    <div className="pt-20 min-h-screen bg-background">
      <div className="navy-gradient py-14">
        <div className="container-kayan text-center text-white">
          <div className="w-14 h-14 rounded-2xl bg-gold/20 flex items-center justify-center mx-auto mb-4">
            <Calculator className="w-7 h-7 text-gold" />
          </div>
          <h1 className="text-3xl font-bold mb-2">حاسبة التقسيط العقاري</h1>
          <p className="text-ivory/70">احسب قسطك الشهري التقريبي قبل ما تقرر</p>
        </div>
      </div>

      <div className="container-kayan py-12">
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="luxury-card p-6 space-y-5">
            <div>
              <label className={labelCls}><Banknote className="w-4 h-4 text-gold" /> سعر العقار (ج.م)</label>
              <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className={inputCls} dir="ltr" />
            </div>
            <div>
              <label className={labelCls}><Wallet className="w-4 h-4 text-gold" /> المقدم (%)</label>
              <input type="number" min="0" max="100" value={downPct} onChange={(e) => setDownPct(e.target.value)} className={inputCls} dir="ltr" />
              <p className="text-xs text-muted-foreground mt-1">= {egp(result.down)}</p>
            </div>
            <div>
              <label className={labelCls}><CalendarClock className="w-4 h-4 text-gold" /> مدة التقسيط (سنوات)</label>
              <input type="number" min="1" max="30" value={years} onChange={(e) => setYears(e.target.value)} className={inputCls} dir="ltr" />
            </div>
            <div>
              <label className={labelCls}><Percent className="w-4 h-4 text-gold" /> نسبة الفائدة السنوية (%)</label>
              <input type="number" min="0" max="40" step="0.5" value={rate} onChange={(e) => setRate(e.target.value)} className={inputCls} dir="ltr" />
              <p className="text-xs text-muted-foreground mt-1">حُط 0 لو التقسيط بدون فوائد</p>
            </div>
          </div>

          {/* Result */}
          <div className="luxury-card p-6 flex flex-col justify-center">
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground mb-1">القسط الشهري التقريبي</p>
              <p className="text-4xl font-extrabold text-gold">{egp(result.monthly)}</p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">المقدم</span>
                <span className="font-semibold">{egp(result.down)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">المبلغ المموّل</span>
                <span className="font-semibold">{egp(result.principal)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">إجمالي الفوائد</span>
                <span className="font-semibold">{egp(result.interest)}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">الإجمالي المدفوع (بعد المقدم)</span>
                <span className="font-semibold">{egp(result.total)}</span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-5 leading-relaxed">
              * أرقام تقريبية للاسترشاد فقط وقد تختلف حسب جهة التمويل. للحصول على عرض دقيق تواصل مع مكتب كيان للعقارات.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
