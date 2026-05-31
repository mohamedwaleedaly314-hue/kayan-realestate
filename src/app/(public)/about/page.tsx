import type { Metadata } from 'next';
import { Building2, Shield, Star, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'من نحن',
  description: 'تعرف على شركة كيان للعقارات — رؤيتنا ومهمتنا وفريقنا في مدينة 15 مايو',
};

export default function AboutPage() {
  return (
    <div className="pt-20 min-h-screen">
      {/* Hero */}
      <div className="navy-gradient py-20">
        <div className="container-kayan text-center text-white">
          <div className="w-16 h-16 rounded-2xl bg-gold flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">من نحن</h1>
          <p className="text-ivory/70 text-lg max-w-xl mx-auto">
            شركة كيان للعقارات — شريكك الموثوق في رحلة البحث عن عقارك المثالي
          </p>
        </div>
      </div>

      <div className="container-kayan py-16">
        {/* Story */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-gold font-semibold text-sm uppercase tracking-widest">قصتنا</span>
          <h2 className="text-3xl font-bold text-navy dark:text-ivory mt-2 mb-6">
            عقد من الثقة والإنجاز
          </h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            تأسست شركة كيان للعقارات منذ أكثر من عشر سنوات في قلب مدينة 15 مايو، لتكون
            الوجهة الأولى لمن يبحث عن عقاره المثالي في هذه المدينة الرائدة.
            بنينا ثقتنا على الشفافية الكاملة، والأسعار العادلة، والخدمة الشخصية التي تضع
            مصلحة العميل فوق كل اعتبار.
          </p>
          <p className="text-muted-foreground leading-relaxed text-lg mt-4">
            من شقق العائلات الصغيرة إلى الفيلات الفاخرة والمحلات التجارية، نمتلك قاعدة
            واسعة من العروض المتنوعة التي تناسب جميع الاحتياجات والميزانيات.
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: Shield,
              title: 'الأمانة أولاً',
              desc: 'نلتزم بالشفافية الكاملة في جميع تعاملاتنا. ما تراه هو ما ستحصل عليه.',
            },
            {
              icon: Star,
              title: 'التميز دائماً',
              desc: 'نسعى دائماً لتقديم أفضل تجربة ممكنة لعملائنا، من أول مكالمة حتى استلام المفتاح.',
            },
            {
              icon: Users,
              title: 'العميل محورنا',
              desc: 'نؤمن بأن نجاحنا مرتبط بنجاح عملائنا في إيجاد العقار المثالي.',
            },
          ].map((value) => (
            <div key={value.title} className="luxury-card p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-5">
                <value.icon className="w-7 h-7 text-gold" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-navy dark:text-ivory">{value.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{value.desc}</p>
            </div>
          ))}
        </div>

        {/* Location */}
        <div className="bg-ivory dark:bg-navy/20 rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-2xl font-bold text-navy dark:text-ivory mb-4">موقعنا</h2>
          <p className="text-muted-foreground mb-2">مدينة 15 مايو — القاهرة، مصر</p>
          <p className="text-sm text-muted-foreground">
            نخدم جميع أحياء مدينة 15 مايو ومحيطها
          </p>
        </div>
      </div>
    </div>
  );
}
