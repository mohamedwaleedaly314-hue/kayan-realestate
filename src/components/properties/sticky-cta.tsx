'use client';

import { useState, useEffect } from 'react';
import { Phone, MessageCircle, Heart } from 'lucide-react';

interface StickyCTAProps {
  propertyId: string;
  propertyTitle: string;
  whatsappNumber: string;
  initialSaved: boolean;
}

export default function StickyCTA({ propertyId, propertyTitle, whatsappNumber, initialSaved }: StickyCTAProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  async function toggleSave() {
    setLoading(true);
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_id: propertyId }),
      });
      if (res.status === 401) {
        window.location.href = `/auth/signin?from=/properties`;
        return;
      }
      if (res.ok) setSaved((s) => !s);
    } finally {
      setLoading(false);
    }
  }

  const waMsg = encodeURIComponent(`مرحباً، أريد الاستفسار عن: ${propertyTitle}`);
  const waUrl = `https://wa.me/${whatsappNumber}?text=${waMsg}`;

  return (
    <div className={`
      fixed bottom-0 right-0 left-0 z-50 md:hidden
      bg-background/95 backdrop-blur-md border-t border-border shadow-2xl
      transition-transform duration-300 safe-pb
      ${visible ? 'translate-y-0' : 'translate-y-full'}
    `}>
      <div className="flex items-center gap-2 px-4 py-3">
        {/* WhatsApp */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-xl py-3 text-sm font-bold hover:bg-[#1fba58] transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          واتساب
        </a>

        {/* Lead form scroll */}
        <button
          onClick={() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })}
          className="flex-1 flex items-center justify-center gap-2 bg-gold text-white rounded-xl py-3 text-sm font-bold hover:bg-gold/90 transition-colors"
        >
          <Phone className="w-5 h-5" />
          استفسار
        </button>

        {/* Save */}
        <button
          onClick={toggleSave}
          disabled={loading}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all border-2 shrink-0 ${
            saved
              ? 'bg-red-50 border-red-200 text-red-500 dark:bg-red-900/20'
              : 'bg-muted border-border text-muted-foreground hover:text-red-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
}
