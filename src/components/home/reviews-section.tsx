'use client';

import { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

interface Review {
  id: string;
  author_name: string;
  rating: number;
  content: string;
  deal_type?: string | null;
  district?: string | null;
  created_at: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} className={`w-4 h-4 ${s <= rating ? 'fill-gold text-gold' : 'text-muted-foreground/30'}`} />
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [idx,     setIdx]     = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reviews')
      .then(r => r.json())
      .then(d => setReviews(d.reviews ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <section className="py-16 bg-background">
      <div className="container-kayan">
        <div className="h-48 bg-muted/40 rounded-3xl animate-pulse" />
      </div>
    </section>
  );
  if (reviews.length === 0) return null;

  const cur  = reviews[idx];
  const prev = () => setIdx(i => (i - 1 + reviews.length) % reviews.length);
  const next = () => setIdx(i => (i + 1) % reviews.length);

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container-kayan max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Star className="w-4 h-4 fill-gold" />
            آراء عملائنا
          </div>
          <h2 className="text-3xl font-extrabold text-foreground">ماذا يقول عملاؤنا</h2>
          <p className="text-muted-foreground mt-2">تجارب حقيقية من عملاء كيان للعقارات</p>
        </div>

        {/* Review Card */}
        <div className="relative">
          <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-xl transition-all duration-300">
            {/* Quote icon */}
            <Quote className="w-12 h-12 text-gold/20 mb-6" />

            <p className="text-lg md:text-xl text-foreground leading-relaxed mb-8 font-medium">
              {cur.content}
            </p>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center text-gold font-extrabold text-lg">
                  {cur.author_name[0]}
                </div>
                <div>
                  <p className="font-bold text-foreground">{cur.author_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StarRating rating={cur.rating} />
                    {cur.deal_type && (
                      <span className="text-xs text-muted-foreground">• {cur.deal_type}</span>
                    )}
                    {cur.district && (
                      <span className="text-xs text-muted-foreground">• {cur.district}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Nav buttons */}
              {reviews.length > 1 && (
                <div className="flex items-center gap-2">
                  <button onClick={prev}
                    className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:border-gold hover:text-gold transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-muted-foreground px-2">{idx + 1} / {reviews.length}</span>
                  <button onClick={next}
                    className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:border-gold hover:text-gold transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Dots */}
          {reviews.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-4">
              {reviews.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={`rounded-full transition-all ${i === idx ? 'w-6 h-2 bg-gold' : 'w-2 h-2 bg-muted-foreground/30'}`} />
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <a href="/reviews/submit"
            className="inline-flex items-center gap-2 text-sm text-gold hover:underline font-semibold">
            <Star className="w-4 h-4 fill-gold" />
            شارك تجربتك معنا
          </a>
        </div>
      </div>
    </section>
  );
}
