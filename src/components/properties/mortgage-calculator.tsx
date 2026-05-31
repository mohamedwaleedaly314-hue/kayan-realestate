'use client';

import { useState, useMemo } from 'react';
import { Calculator, TrendingDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MortgageCalculatorProps {
  propertyPrice: number;
}

function formatEGP(n: number) {
  return n.toLocaleString('ar-EG', { maximumFractionDigits: 0 }) + ' ج.م';
}

export default function MortgageCalculator({ propertyPrice }: MortgageCalculatorProps) {
  const [open, setOpen] = useState(false);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(14);
  const [years, setYears] = useState(10);

  const result = useMemo(() => {
    const down = (propertyPrice * downPct) / 100;
    const principal = propertyPrice - down;
    const monthlyRate = rate / 100 / 12;
    const n = years * 12;
    if (monthlyRate === 0) return { monthly: principal / n, down, principal, total: principal };
    const monthly = (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    const total = monthly * n;
    return { monthly, down, principal, total };
  }, [propertyPrice, downPct, rate, years]);

  return (
    <div className="luxury-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-gold" />
          </div>
          <div className="text-right">
            <p className="font-bold text-sm">حاسبة التمويل العقاري</p>
            <p className="text-xs text-muted-foreground">احسب قسطك الشهري</p>
          </div>
        </div>
        <div className={`w-6 h-6 rounded-full border-2 border-gold/40 flex items-center justify-center transition-transform ${open ? 'rotate-180' : ''}`}>
          <svg className="w-3 h-3 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-border/50 pt-4 space-y-4">
          {/* Controls */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">مقدم %</Label>
              <div className="flex items-center gap-1 mt-1">
                <Input
                  type="number" min={0} max={80} value={downPct}
                  onChange={(e) => setDownPct(Number(e.target.value))}
                  className="h-9 text-sm text-center"
                />
              </div>
              <p className="text-xs text-gold mt-0.5 text-center">{formatEGP(result.down)}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">فائدة % سنوي</Label>
              <Input
                type="number" min={0} max={30} step={0.5} value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="h-9 text-sm text-center mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">المدة (سنة)</Label>
              <Input
                type="number" min={1} max={30} value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="h-9 text-sm text-center mt-1"
              />
            </div>
          </div>

          {/* Results */}
          <div className="bg-navy dark:bg-navy-800 rounded-xl p-4 text-white text-center">
            <p className="text-xs text-ivory/60 mb-1">القسط الشهري التقريبي</p>
            <p className="text-2xl font-bold text-gold">{formatEGP(result.monthly)}</p>
            <p className="text-xs text-ivory/50 mt-1">لمدة {years * 12} قسط</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-muted/50 rounded-lg p-2.5 text-center">
              <p className="text-muted-foreground">المبلغ الممول</p>
              <p className="font-bold mt-0.5">{formatEGP(result.principal)}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2.5 text-center">
              <p className="text-muted-foreground">إجمالي السداد</p>
              <p className="font-bold mt-0.5 text-amber-600">{formatEGP(result.total)}</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
            <TrendingDown className="w-3 h-3" />
            الأرقام تقريبية للاستدلال فقط
          </p>
        </div>
      )}
    </div>
  );
}
