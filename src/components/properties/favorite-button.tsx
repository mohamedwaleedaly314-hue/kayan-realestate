'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface FavoriteButtonProps {
  propertyId: string;
  initialSaved?: boolean;
  className?: string;
}

export default function FavoriteButton({ propertyId, initialSaved = false, className = '' }: FavoriteButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_id: propertyId }),
      });

      if (res.status === 401) {
        toast.error('سجّل دخولك أولاً لحفظ العقارات');
        router.push('/auth/signin');
        return;
      }

      const data = await res.json();
      setSaved(data.saved);
      toast.success(data.saved ? 'تم حفظ العقار ❤️' : 'تم إزالة العقار من المحفوظات');
    } catch {
      toast.error('حدث خطأ');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md ${
        saved
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-white/90 text-gray-500 hover:bg-white hover:text-red-500'
      } ${loading ? 'opacity-70 cursor-wait' : ''} ${className}`}
      aria-label={saved ? 'إزالة من المحفوظات' : 'حفظ العقار'}
    >
      <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
    </button>
  );
}
