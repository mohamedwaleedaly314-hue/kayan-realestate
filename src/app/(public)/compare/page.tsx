'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BarChart3, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CompareItem } from '@/hooks/useComparison';

const KEY = 'kayan_compare';

type RowDef = {
  label: string;
  getValue: (item: CompareItem) => string;
  numericKey?: keyof CompareItem;
};

const rows: RowDef[] = [
  { label: 'السعر',    getValue: (i) => `${Number(i.price).toLocaleString('ar-EG')} ج.م`,  numericKey: 'price'   },
  { label: 'المساحة',  getValue: (i) => `${i.area_m2} م²`,                                  numericKey: 'area_m2' },
  { label: 'الغرف',    getValue: (i) => i.rooms ? `${i.rooms} غرف` : '—',                  numericKey: 'rooms'   },
  { label: 'المنطقة',  getValue: (i) => i.district                                                                 },
  { label: 'النوع',    getValue: (i) => i.type === 'SALE' ? 'للبيع' : 'للإيجار'                                   },
  { label: 'سعر/م²',  getValue: (i) => i.area_m2 > 0 ? `${Math.round(i.price / i.area_m2).toLocaleString('ar-EG')} ج.م` : '—' },
];

export default function ComparePage() {
  const [items, setItems] = useState<CompareItem[]>([]);

  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
    } catch { setItems([]); }
  }, []);

  if (items.length === 0) {
    return (
      <div className="pt-24 min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <BarChart3 className="w-16 h-16 text-muted-foreground/40" />
        <h1 className="text-2xl font-bold">لا توجد عقارات للمقارنة</h1>
        <p className="text-muted-foreground">اختر حتى 3 عقارات من قائمة العقارات وانقر مقارنة</p>
        <Button variant="gold" asChild className="gap-2 mt-2">
          <Link href="/properties">
            <Home className="w-4 h-4" />
            تصفح العقارات
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-background">
      {/* Header */}
      <div className="bg-navy py-10">
        <div className="container-kayan">
          <Link href="/properties" className="inline-flex items-center gap-2 text-ivory/70 hover:text-ivory text-sm mb-4 transition-colors">
            <ArrowRight className="w-4 h-4" />
            العودة للعقارات
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-gold" />
            مقارنة العقارات
          </h1>
          <p className="text-ivory/60 mt-1">مقارنة {items.length} عقار</p>
        </div>
      </div>

      <div className="container-kayan py-8">
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground w-32">
                  المواصفة
                </th>
                {items.map(item => (
                  <th key={item.id} className="px-4 py-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      {item.image ? (
                        <Image src={item.image} alt={item.title_ar} width={80} height={60}
                          className="w-20 h-14 rounded-xl object-cover" />
                      ) : (
                        <div className="w-20 h-14 rounded-xl bg-gold/10 flex items-center justify-center text-2xl">🏠</div>
                      )}
                      <Link href={`/properties/${item.slug}`}
                        className="text-sm font-semibold text-foreground hover:text-gold transition-colors line-clamp-2 text-center">
                        {item.title_ar}
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => {
                /* highlight best value */
                const numericVals = row.numericKey
                  ? items.map(item => Number(item[row.numericKey!])).filter(n => !isNaN(n) && n > 0)
                  : [];
                const bestVal = numericVals.length > 1
                  ? (row.numericKey === 'price' ? Math.min(...numericVals) : Math.max(...numericVals))
                  : null;

                return (
                  <tr key={ri} className={`border-b border-border/50 ${ri % 2 === 0 ? '' : 'bg-muted/30'}`}>
                    <td className="px-6 py-4 text-sm font-medium text-muted-foreground">{row.label}</td>
                    {items.map(item => {
                      const val      = row.getValue(item);
                      const numericV = row.numericKey ? Number(item[row.numericKey]) : null;
                      const isBest   = bestVal !== null && numericV === bestVal;
                      return (
                        <td key={item.id} className="px-4 py-4 text-center">
                          <span className={`text-sm font-semibold ${isBest ? 'text-gold' : 'text-foreground'}`}>
                            {isBest && <span className="text-xs ml-1">⭐</span>}
                            {val}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Action row */}
              <tr>
                <td className="px-6 py-4" />
                {items.map(item => (
                  <td key={item.id} className="px-4 py-4 text-center">
                    <Button variant="gold" size="sm" asChild className="w-full">
                      <Link href={`/properties/${item.slug}`}>عرض التفاصيل</Link>
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          ⭐ يشير إلى الأفضل في هذه المواصفة
        </p>
      </div>
    </div>
  );
}
