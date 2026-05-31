'use client';

import Link from 'next/link';
import Image from 'next/image';
import { X, BarChart3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComparison } from '@/hooks/useComparison';

export default function CompareBar() {
  const { items, remove, clear } = useComparison();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-navy dark:bg-card border-t-2 border-gold shadow-2xl animate-fade-up">
      <div className="container-kayan py-3">
        <div className="flex items-center gap-3">
          {/* count badge */}
          <div className="shrink-0 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-gold text-white text-xs font-bold flex items-center justify-center">
              {items.length}
            </span>
            <p className="text-white dark:text-foreground text-sm font-semibold hidden sm:block">مقارنة</p>
          </div>

          {/* items */}
          <div className="flex-1 flex items-center gap-2 overflow-x-auto">
            {items.map(item => (
              <div key={item.id}
                className="flex items-center gap-2 bg-white/10 dark:bg-muted rounded-xl px-3 py-2 shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.title_ar} width={32} height={32}
                    className="w-8 h-8 rounded-lg object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center text-sm">🏠</div>
                )}
                <p className="text-white dark:text-foreground text-xs font-medium max-w-[120px] truncate">
                  {item.title_ar}
                </p>
                <button onClick={() => remove(item.id)}
                  className="text-white/60 hover:text-white dark:text-muted-foreground dark:hover:text-foreground ml-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* empty slots */}
            {Array.from({ length: 3 - items.length }).map((_, i) => (
              <div key={i}
                className="w-28 h-[52px] rounded-xl border-2 border-dashed border-white/20 dark:border-border flex items-center justify-center text-white/30 dark:text-muted-foreground text-xs shrink-0">
                + إضافة
              </div>
            ))}
          </div>

          {/* actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={clear}
              className="p-2 rounded-xl text-white/60 hover:text-white dark:text-muted-foreground dark:hover:text-foreground hover:bg-white/10 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
            <Button variant="gold" size="sm" asChild className="gap-2 font-semibold shadow-lg">
              <Link href="/compare">
                <BarChart3 className="w-4 h-4" />
                قارن الآن
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
