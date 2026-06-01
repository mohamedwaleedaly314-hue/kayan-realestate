import Link from 'next/link';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeroSearch from './hero-search';
import { OFFICE_WHATSAPP } from '@/lib/site';

export default function HeroSection() {
  const whatsapp = OFFICE_WHATSAPP;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 navy-gradient" />

      {/* Animated pattern */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23B8860B' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating circles decoration */}
      <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-gold/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

      <div className="relative container-kayan text-center text-white pt-24 pb-16 w-full">
        {/* Badge */}
        <div className="animate-fade-in">
          <span className="inline-flex items-center gap-2 bg-gold/20 border border-gold/40 text-gold px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            مدينة 15 مايو — القاهرة
          </span>
        </div>

        {/* Heading */}
        <h1 className="animate-fade-in text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-5">
          اعثر على
          <span className="text-gold relative">
            {' '}منزل أحلامك{' '}
            <svg className="absolute -bottom-2 left-0 right-0 w-full" viewBox="0 0 300 12" fill="none">
              <path d="M2 10 Q150 2 298 10" stroke="#B8860B" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
            </svg>
          </span>
          <br className="hidden md:block" />
          مع كيان
        </h1>

        <p className="animate-fade-in text-ivory/75 text-lg md:text-xl max-w-2xl mx-auto mb-4 leading-relaxed">
          أفضل العروض العقارية في مدينة 15 مايو — شقق وفيلات ومحلات
          <br className="hidden md:block" />
          للبيع والإيجار بأسعار تنافسية وخدمة متميزة
        </p>

        {/* Quick Search */}
        <HeroSearch />

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-6">
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('مرحباً، أريد الاستفسار عن عقار في مدينة 15 مايو')}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1fba58] transition-colors shadow-lg"
          >
            <Phone className="w-5 h-5" />
            تواصل واتساب
          </a>
          <Button
            variant="outline"
            size="lg"
            className="border-white/40 text-white hover:bg-white/10 hover:text-white hover:border-white"
            asChild
          >
            <Link href="/about">تعرف علينا</Link>
          </Button>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 mt-12 text-ivory/50 text-sm">
          {['٢٠٠+ عقار مدرج', '٥٠٠+ عميل سعيد', '١٠+ سنوات خبرة'].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-2.5 bg-white/60 rounded-full" />
        </div>
      </div>
    </section>
  );
}
