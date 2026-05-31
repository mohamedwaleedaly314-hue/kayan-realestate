'use client';

import { useState } from 'react';
import { Share2, Copy, Check, Facebook, MessageCircle, Download, Printer, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface SocialShareProps {
  title:      string;
  url?:       string;
  propertyId?: string;
  slug?:      string;
}

export default function SocialShare({ title, propertyId, slug }: SocialShareProps) {
  const [copied,   setCopied]   = useState(false);
  const [open,     setOpen]     = useState(false);
  const [dlCard,   setDlCard]   = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const text       = `🏠 ${title}\n\n📍 مدينة 15 مايو\n🔗 ${currentUrl}\n\nكيان للعقارات | اختيارك الصح`;

  function copyLink() {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true); toast.success('تم نسخ الرابط');
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function downloadCard() {
    if (!propertyId) return;
    setDlCard(true); setOpen(false);
    try {
      const res  = await fetch(`/api/og/property/${propertyId}`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `kayan-property-${slug ?? propertyId}.png`;
      a.click(); URL.revokeObjectURL(url);
      toast.success('✅ تم تحميل البطاقة!');
    } catch { toast.error('فشل التحميل'); }
    finally { setDlCard(false); }
  }

  const shares = [
    {
      label: 'واتساب',
      icon:  MessageCircle,
      color: 'bg-[#25D366] hover:bg-[#128C7E]',
      href:  `https://wa.me/?text=${encodeURIComponent(text)}`,
    },
    {
      label: 'فيسبوك',
      icon:  Facebook,
      color: 'bg-[#1877F2] hover:bg-[#0e5fc0]',
      href:  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(text)}`,
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <Share2 className="w-4 h-4" />
        مشاركة
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-2 w-56 bg-card border border-border rounded-2xl shadow-xl p-3 z-20 space-y-1.5">

            {/* Social share */}
            {shares.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-white text-sm font-medium ${s.color} transition-colors`}>
                <s.icon className="w-4 h-4" />
                شارك على {s.label}
              </a>
            ))}

            <div className="border-t border-border/60 pt-1.5 space-y-1.5">
              {/* Download social card */}
              {propertyId && (
                <button onClick={downloadCard} disabled={dlCard}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gold/10 hover:bg-gold/20 text-gold text-sm font-semibold w-full transition-colors border border-gold/25">
                  <ImageIcon className="w-4 h-4" />
                  {dlCard ? 'جار التحميل...' : '📸 بطاقة السوشيال ميديا'}
                </button>
              )}

              {/* Print / PDF */}
              {slug && (
                <a href={`/properties/${slug}/print`} target="_blank"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-navy/5 hover:bg-navy/10 dark:bg-ivory/5 dark:hover:bg-ivory/10 text-foreground text-sm font-semibold w-full transition-colors border border-border">
                  <Printer className="w-4 h-4 text-navy dark:text-ivory" />
                  طباعة / تحميل PDF
                </a>
              )}

              {/* Copy link */}
              <button onClick={() => { copyLink(); setOpen(false); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-sm font-medium w-full transition-colors">
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                نسخ الرابط
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
