import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Shield, Clock, Star, Users } from 'lucide-react';
import PropertySubmissionForm from '@/components/submit/PropertySubmissionForm';

export const metadata: Metadata = {
  title: 'اعرض عقارك | كيان للعقارات',
  description: 'أضف عقارك مجاناً لمدة 30 يوماً وسيصلك المشترون عبر مكتبنا المتخصص في مدينة 15 مايو',
};

const PERKS = [
  { icon: Star,   title: 'نشر مجاني 30 يوم',     desc: 'إعلان مجاني كامل بلا تكلفة مسبقة' },
  { icon: Shield, title: 'رقمك خاص تماماً',      desc: 'التواصل يتم فقط عبر مكتب كيان — بياناتك محمية' },
  { icon: Users,  title: 'فريق مبيعات متخصص',   desc: 'سيلز تيم محترف يتابع بيع أو إيجار عقارك' },
  { icon: Clock,  title: 'مراجعة خلال 24 ساعة', desc: 'نراجع إعلانك ونوافق عليه خلال يوم عمل' },
];

export default function SubmitPropertyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-br from-navy via-navy/90 to-navy/80 text-white py-16 px-4">
        <div className="container-kayan text-center">
          <span className="inline-block bg-gold/20 text-gold text-xs font-bold px-4 py-1.5 rounded-full mb-4 tracking-widest uppercase">
            اعرض عقارك معنا
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            بيع أو اأجّر عقارك بأسرع وقت
          </h1>
          <p className="text-ivory/70 text-lg max-w-xl mx-auto mb-2">
            أضف إعلانك مجاناً — فريقنا يتولى التسويق والتواصل مع المشترين
          </p>
          <p className="text-gold text-sm font-semibold">
            عمولة 1% فقط عند إتمام الصفقة بنجاح
          </p>
        </div>
      </div>

      {/* Perks */}
      <div className="container-kayan py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {PERKS.map((p) => (
            <div key={p.title} className="bg-card border border-border rounded-2xl p-4 text-center hover:border-gold/40 transition-colors">
              <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <p.icon className="w-5 h-5 text-gold" />
              </div>
              <p className="font-bold text-sm text-foreground mb-1">{p.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            📋 تفاصيل عقارك
          </h2>
          <Suspense fallback={<div className="h-96 flex items-center justify-center text-muted-foreground">تحميل...</div>}>
            <PropertySubmissionForm />
          </Suspense>
        </div>

        {/* Policy note */}
        <div className="max-w-2xl mx-auto mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-center">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            📋 بتقديم طلبك توافق على{' '}
            <a href="/policy" className="font-bold hover:underline">شروط وأحكام كيان</a>
            . العمولة 1% تُدفع فقط عند إتمام البيع أو الإيجار.
          </p>
        </div>
      </div>
    </div>
  );
}
