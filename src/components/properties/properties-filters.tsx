'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useRef, useEffect } from 'react';
import {
  Search, X, ChevronDown, SlidersHorizontal, Sparkles,
  BedDouble, DollarSign, Maximize2, Building2, Star,
  ArrowUpDown, MapPin, Layers,
} from 'lucide-react';
import { districtGroups } from '@/lib/districts';
import { cn } from '@/lib/utils';

/* ── constants ──────────────────────────────────────────────────── */
const PRICE_PRESETS_SALE = [
  { label: 'أقل من 500K', max: 500_000 },
  { label: '500K - 1M', min: 500_000, max: 1_000_000 },
  { label: '1M - 2M', min: 1_000_000, max: 2_000_000 },
  { label: '2M - 5M', min: 2_000_000, max: 5_000_000 },
  { label: 'أكثر من 5M', min: 5_000_000 },
];
const PRICE_PRESETS_RENT = [
  { label: 'أقل من 3K', max: 3_000 },
  { label: '3K - 7K', min: 3_000, max: 7_000 },
  { label: '7K - 15K', min: 7_000, max: 15_000 },
  { label: 'أكثر من 15K', min: 15_000 },
];
const AREA_PRESETS = [
  { label: 'أقل من 80م²', max: 80 },
  { label: '80 - 120م²', min: 80, max: 120 },
  { label: '120 - 200م²', min: 120, max: 200 },
  { label: 'أكثر من 200م²', min: 200 },
];
const ROOM_OPTIONS = [
  { value: '1', label: '١', sublabel: 'غرفة' },
  { value: '2', label: '٢', sublabel: 'غرفتان' },
  { value: '3', label: '٣', sublabel: 'غرف' },
  { value: '4', label: '٤', sublabel: 'غرف' },
  { value: '5', label: '٥+', sublabel: 'غرف' },
];
const SORT_OPTIONS = [
  { value: 'featured', label: 'الأبرز', icon: '⭐' },
  { value: 'newest',   label: 'الأحدث', icon: '🆕' },
  { value: 'price_asc',  label: 'السعر ↑', icon: '💰' },
  { value: 'price_desc', label: 'السعر ↓', icon: '💎' },
  { value: 'area_desc',  label: 'المساحة ↓', icon: '📐' },
  { value: 'views',      label: 'الأكثر مشاهدة', icon: '👁️' },
];

const filterLabels: Record<string, (v: string) => string> = {
  type:      v => v === 'SALE' ? '🏠 للبيع' : '🔑 للإيجار',
  status:    v => ({ AVAILABLE: '✅ متاح', RESERVED: '⏳ محجوز', SOLD: '🔴 مباع' }[v] ?? v),
  district:  v => `📍 ${v}`,
  rooms:     v => `🛏️ ${ROOM_OPTIONS.find(r => r.value === v)?.label ?? v} غرف`,
  min_price: v => `من ${Number(v).toLocaleString('ar-EG')} ج.م`,
  max_price: v => `حتى ${Number(v).toLocaleString('ar-EG')} ج.م`,
  min_area:  v => `من ${v}م²`,
  max_area:  v => `حتى ${v}م²`,
  floor:     v => `طابق ${v}`,
  elevator:  () => '🛗 مصعد',
  featured:  () => '⭐ مميزة فقط',
  search:    v => `🔍 "${v}"`,
};

interface Props { initialFilters: Record<string, string | undefined> }

export default function PropertiesFilters({ initialFilters }: Props) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [advanced, setAdvanced] = useState(false);
  const [searchVal, setSearchVal] = useState(initialFilters.search ?? '');
  const [minPrice,  setMinPrice]  = useState(initialFilters.min_price ?? '');
  const [maxPrice,  setMaxPrice]  = useState(initialFilters.max_price ?? '');
  const [minArea,   setMinArea]   = useState(initialFilters.min_area ?? '');
  const [maxArea,   setMaxArea]   = useState(initialFilters.max_area ?? '');
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local input state when URL changes (e.g., browser back/forward)
  useEffect(() => {
    setSearchVal(initialFilters.search ?? '');
    setMinPrice(initialFilters.min_price ?? '');
    setMaxPrice(initialFilters.max_price ?? '');
    setMinArea(initialFilters.min_area ?? '');
    setMaxArea(initialFilters.max_area ?? '');
  }, [initialFilters]);

  const update = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v && v !== 'all') params.set(k, v); else params.delete(k);
    });
    params.delete('page');
    router.push(`/properties?${params.toString()}`);
  }, [router, searchParams]);

  const get = (key: string) => initialFilters[key];

  const activeFilters = Object.entries(initialFilters)
    .filter(([k, v]) => v && v !== 'all' && k !== 'page' && k !== 'sort')
    .map(([k, v]) => ({ key: k, label: filterLabels[k]?.(v!) ?? v! }));

  const hasFilters = activeFilters.length > 0;
  const isRent = get('type') === 'RENT';
  const pricePresets = isRent ? PRICE_PRESETS_RENT : PRICE_PRESETS_SALE;

  function handleSearch(val: string) {
    setSearchVal(val);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      update({ search: val || undefined });
    }, 400);
  }

  function applyPricePreset(p: { min?: number; max?: number }) {
    const newMin = p.min ? String(p.min) : undefined;
    const newMax = p.max ? String(p.max) : undefined;
    setMinPrice(newMin ?? '');
    setMaxPrice(newMax ?? '');
    update({ min_price: newMin, max_price: newMax });
  }

  function applyAreaPreset(p: { min?: number; max?: number }) {
    const newMin = p.min ? String(p.min) : undefined;
    const newMax = p.max ? String(p.max) : undefined;
    setMinArea(newMin ?? '');
    setMaxArea(newMax ?? '');
    update({ min_area: newMin, max_area: newMax });
  }

  function commitPrice() {
    update({ min_price: minPrice || undefined, max_price: maxPrice || undefined });
  }
  function commitArea() {
    update({ min_area: minArea || undefined, max_area: maxArea || undefined });
  }

  return (
    <div className="mb-8 space-y-3">

      {/* ── Main filter card ─────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">

        {/* Search bar */}
        <div className="p-4 border-b border-border/60">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              value={searchVal}
              onChange={e => handleSearch(e.target.value)}
              placeholder="ابحث بالاسم أو المنطقة أو أي كلمة..."
              className="w-full pr-12 pl-4 py-3 text-sm bg-muted/40 rounded-xl border border-transparent focus:border-gold/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all placeholder:text-muted-foreground/60"
            />
            {searchVal && (
              <button onClick={() => { setSearchVal(''); update({ search: undefined }); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* ── Type toggle ───────────────────────────────────────── */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">نوع العملية</p>
            <div className="flex gap-2">
              {[
                { val: undefined, label: 'الكل',     icon: '🏘️' },
                { val: 'SALE',    label: 'للبيع',    icon: '🏠' },
                { val: 'RENT',    label: 'للإيجار',  icon: '🔑' },
              ].map(opt => (
                <button key={opt.label}
                  onClick={() => update({ type: opt.val })}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                    get('type') === opt.val || (!get('type') && !opt.val)
                      ? 'bg-gold text-white shadow-md shadow-gold/25'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}>
                  <span>{opt.icon}</span> {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Rooms ─────────────────────────────────────────────── */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BedDouble className="w-3.5 h-3.5" /> عدد الغرف
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={() => update({ rooms: undefined })}
                className={cn(
                  'flex-1 py-2 rounded-xl text-xs font-semibold transition-all',
                  !get('rooms') ? 'bg-navy text-white dark:bg-ivory dark:text-navy' : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                )}>الكل</button>
              {ROOM_OPTIONS.map(r => (
                <button key={r.value}
                  onClick={() => update({ rooms: r.value })}
                  className={cn(
                    'flex-1 flex flex-col items-center py-1.5 rounded-xl text-xs font-bold transition-all',
                    get('rooms') === r.value
                      ? 'bg-gold text-white shadow-md shadow-gold/25'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}>
                  <span className="text-sm leading-none">{r.label}</span>
                  <span className="text-[10px] opacity-70 mt-0.5">{r.sublabel}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── District ──────────────────────────────────────────── */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> المنطقة / المجاورة
            </p>
            <div className="relative">
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold pointer-events-none" />
              <select
                value={get('district') ?? ''}
                onChange={e => update({ district: e.target.value || undefined })}
                className="w-full pr-9 pl-3 py-2.5 text-sm rounded-xl border border-input bg-background appearance-none focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all"
              >
                <option value="">جميع المناطق</option>
                {districtGroups.map(g => (
                  <optgroup key={g.label} label={g.label}>
                    {g.districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </optgroup>
                ))}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* ── Price range ───────────────────────────────────────── */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> نطاق السعر
            </p>
            {/* Quick presets */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {pricePresets.map(p => {
                const active = String(p.min ?? '') === minPrice && String(p.max ?? '') === maxPrice;
                return (
                  <button key={p.label} onClick={() => applyPricePreset(p)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                      active ? 'bg-gold text-white shadow-sm' : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}>
                    {p.label}
                  </button>
                );
              })}
            </div>
            {/* Custom range inputs */}
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                  onBlur={commitPrice} placeholder="من"
                  className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all" />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">ج.م</span>
              </div>
              <div className="w-4 h-px bg-border shrink-0" />
              <div className="relative flex-1">
                <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                  onBlur={commitPrice} placeholder="حتى"
                  className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all" />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">ج.م</span>
              </div>
            </div>
          </div>

          {/* ── Advanced toggle ───────────────────────────────────── */}
          <button onClick={() => setAdvanced(v => !v)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all border border-dashed border-border">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {advanced ? 'إخفاء الفلاتر المتقدمة' : 'فلاتر متقدمة أكثر'}
            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', advanced && 'rotate-180')} />
          </button>

          {/* ── Advanced panel ────────────────────────────────────── */}
          {advanced && (
            <div className="space-y-4 pt-2 border-t border-border/60">

              {/* Area range */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5" /> المساحة (م²)
                </p>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {AREA_PRESETS.map(p => {
                    const active = String(p.min ?? '') === minArea && String(p.max ?? '') === maxArea;
                    return (
                      <button key={p.label} onClick={() => applyAreaPreset(p)}
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                          active ? 'bg-gold text-white shadow-sm' : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}>
                        {p.label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <input type="number" value={minArea} onChange={e => setMinArea(e.target.value)}
                      onBlur={commitArea} placeholder="من"
                      className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all" />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">م²</span>
                  </div>
                  <div className="w-4 h-px bg-border shrink-0" />
                  <div className="relative flex-1">
                    <input type="number" value={maxArea} onChange={e => setMaxArea(e.target.value)}
                      onBlur={commitArea} placeholder="حتى"
                      className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all" />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">م²</span>
                  </div>
                </div>
              </div>

              {/* Floor */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> الطابق
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { val: undefined, label: 'الكل' },
                    { val: '0', label: 'أرضي' },
                    { val: '1', label: 'أول' },
                    { val: '2', label: 'ثاني' },
                    { val: '3', label: 'ثالث' },
                    { val: '4', label: 'رابع' },
                    { val: '5', label: 'خامس+' },
                  ].map(opt => (
                    <button key={opt.label}
                      onClick={() => update({ floor: opt.val })}
                      className={cn(
                        'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
                        get('floor') === opt.val || (!get('floor') && !opt.val)
                          ? 'bg-gold text-white shadow-sm'
                          : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> حالة العقار
                </p>
                <div className="flex gap-2">
                  {[
                    { val: undefined,     label: 'الكل',    color: '' },
                    { val: 'AVAILABLE',   label: '✅ متاح',  color: 'bg-emerald-500' },
                    { val: 'RESERVED',    label: '⏳ محجوز', color: 'bg-amber-500' },
                  ].map(opt => (
                    <button key={opt.label}
                      onClick={() => update({ status: opt.val })}
                      className={cn(
                        'flex-1 py-2 rounded-xl text-xs font-semibold transition-all',
                        get('status') === opt.val || (!get('status') && !opt.val)
                          ? 'bg-gold text-white shadow-md shadow-gold/25'
                          : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle filters */}
              <div className="flex gap-2">
                {/* Elevator */}
                <button
                  onClick={() => update({ elevator: get('elevator') ? undefined : '1' })}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all border',
                    get('elevator')
                      ? 'bg-gold/15 text-gold border-gold/40 shadow-sm'
                      : 'bg-muted/40 text-muted-foreground border-border hover:border-gold/30 hover:text-foreground'
                  )}>
                  🛗 مصعد
                </button>

                {/* Featured only */}
                <button
                  onClick={() => update({ featured: get('featured') ? undefined : '1' })}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all border',
                    get('featured')
                      ? 'bg-gold/15 text-gold border-gold/40 shadow-sm'
                      : 'bg-muted/40 text-muted-foreground border-border hover:border-gold/30 hover:text-foreground'
                  )}>
                  <Star className="w-3.5 h-3.5" /> مميزة فقط
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Sort + active count footer ─────────────────────────── */}
        <div className="px-4 py-3 bg-muted/30 border-t border-border/60 flex items-center gap-3">
          <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <div className="flex gap-1.5 flex-wrap flex-1">
            {SORT_OPTIONS.map(s => (
              <button key={s.value}
                onClick={() => update({ sort: s.value })}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                  (get('sort') ?? 'featured') === s.value
                    ? 'bg-navy text-white dark:bg-ivory dark:text-navy'
                    : 'bg-background text-muted-foreground hover:text-foreground border border-border hover:border-foreground/20'
                )}>
                {s.icon} {s.label}
              </button>
            ))}
          </div>
          {hasFilters && (
            <button onClick={() => { router.push('/properties'); setMinPrice(''); setMaxPrice(''); setMinArea(''); setMaxArea(''); setSearchVal(''); }}
              className="flex items-center gap-1.5 text-xs text-destructive hover:text-destructive/80 font-semibold whitespace-nowrap transition-colors shrink-0">
              <X className="w-3.5 h-3.5" /> مسح الكل
            </button>
          )}
        </div>
      </div>

      {/* ── Active filter chips ───────────────────────────────────── */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-gold" /> الفلاتر المفعّلة:
          </span>
          {activeFilters.map(({ key, label }) => (
            <button key={key}
              onClick={() => {
                if (key === 'min_price') setMinPrice('');
                if (key === 'max_price') setMaxPrice('');
                if (key === 'min_area')  setMinArea('');
                if (key === 'max_area')  setMaxArea('');
                if (key === 'search')    setSearchVal('');
                update({ [key]: undefined });
              }}
              className="group inline-flex items-center gap-1.5 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/25 hover:border-gold/50 text-xs px-3 py-1.5 rounded-full font-semibold transition-all">
              {label}
              <X className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
