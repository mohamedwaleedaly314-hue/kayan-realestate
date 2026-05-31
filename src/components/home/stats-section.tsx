'use client';

import { useEffect, useRef, useState } from 'react';
import { Building2, Users, Star, TrendingUp } from 'lucide-react';

const stats = [
  { icon: Building2, label: 'عقار مدرج', value: 200, suffix: '+' },
  { icon: Users, label: 'عميل سعيد', value: 500, suffix: '+' },
  { icon: Star, label: 'سنوات خبرة', value: 10, suffix: '+' },
  { icon: TrendingUp, label: 'صفقة ناجحة', value: 300, suffix: '+' },
];

function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function StatItem({ icon: Icon, label, value, suffix }: typeof stats[0]) {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const count = useCountUp(value, 1600, started);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.5 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="text-center text-white group">
      <div className="w-14 h-14 rounded-2xl bg-white/10 group-hover:bg-white/20 flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110">
        <Icon className="w-7 h-7 opacity-90" />
      </div>
      <p className="text-3xl md:text-4xl font-bold mb-1 tabular-nums">
        {count.toLocaleString('ar-EG')}{suffix}
      </p>
      <p className="text-sm opacity-80">{label}</p>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="bg-gold py-16 relative overflow-hidden">
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "30px 30px" }} />
      <div className="container-kayan relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat) => <StatItem key={stat.label} {...stat} />)}
        </div>
      </div>
    </section>
  );
}
