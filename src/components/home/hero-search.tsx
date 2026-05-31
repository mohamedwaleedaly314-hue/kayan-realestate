'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { districtGroups } from '@/lib/districts';

export default function HeroSearch() {
  const router = useRouter();
  const [type, setType] = useState<'SALE' | 'RENT'>('SALE');
  const [district, setDistrict] = useState('');
  const [query, setQuery] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set('type', type);
    if (district) params.set('district', district);
    if (query.trim()) params.set('search', query.trim());
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 max-w-2xl mx-auto mt-10 shadow-2xl">
      {/* Type toggle */}
      <div className="flex gap-1 p-1 bg-white/10 rounded-xl mb-2">
        {(['SALE', 'RENT'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              type === t
                ? 'bg-gold text-white shadow-md'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {t === 'SALE' ? '🏠 للبيع' : '🔑 للإيجار'}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {/* District */}
        <div className="relative flex-1">
          <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full h-11 pr-9 pl-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-gold/50 [&>option]:text-navy [&>option]:bg-white"
          >
            <option value="">جميع المناطق</option>
            {districtGroups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.districts.map((d) => <option key={d} value={d}>{d}</option>)}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Keyword */}
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="كلمة البحث..."
            className="w-full h-11 pr-9 pl-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
          />
        </div>

        <Button type="submit" variant="gold" className="h-11 px-5 shrink-0 rounded-xl font-bold">
          <Search className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
