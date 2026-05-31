export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import HeroSection from '@/components/home/hero-section';
import FeaturedProperties from '@/components/home/featured-properties';
import WhyKayan from '@/components/home/why-kayan';
import StatsSection from '@/components/home/stats-section';
import ContactCTA from '@/components/home/contact-cta';
import ReviewsSection from '@/components/home/reviews-section';
import PropertyCardSkeleton from '@/components/properties/property-card-skeleton';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <section className="section-padding bg-background">
        <div className="container-kayan">
          <div className="text-center mb-12">
            <span className="text-gold font-semibold text-sm uppercase tracking-widest">اختياراتنا المميزة</span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy dark:text-ivory mt-2">أبرز العقارات</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              اكتشف أفضل العروض العقارية المختارة بعناية في مدينة 15 مايو
            </p>
          </div>
          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <PropertyCardSkeleton key={i} />
                ))}
              </div>
            }
          >
            <FeaturedProperties />
          </Suspense>
        </div>
      </section>
      <WhyKayan />
      <ReviewsSection />
      <ContactCTA />
    </>
  );
}
