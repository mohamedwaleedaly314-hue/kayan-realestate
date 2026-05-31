import { Shield, Clock, Handshake, MapPin, Phone, Star } from 'lucide-react';

const reasons = [
  {
    icon: Shield,
    title: 'موثوقية عالية',
    desc: 'نضمن سلامة جميع المعاملات العقارية مع توثيق كامل وشفافية تامة',
  },
  {
    icon: Clock,
    title: 'سرعة الإنجاز',
    desc: 'نوفر لك أسرع وأسهل تجربة لإتمام صفقتك العقارية في أقل وقت ممكن',
  },
  {
    icon: Handshake,
    title: 'أسعار تنافسية',
    desc: 'أفضل الأسعار في السوق مع ضمان القيمة الحقيقية لاستثمارك',
  },
  {
    icon: MapPin,
    title: 'خبرة محلية',
    desc: 'نعرف كل حي وكل شارع في مدينة 15 مايو — خبرتنا المحلية لخدمتك',
  },
  {
    icon: Phone,
    title: 'دعم مستمر',
    desc: 'فريقنا متاح دائماً للإجابة على استفساراتك وتقديم المساعدة في أي وقت',
  },
  {
    icon: Star,
    title: 'خدمة VIP',
    desc: 'معاملة مميزة لكل عميل مع متابعة شخصية من بداية البحث حتى استلام المفتاح',
  },
];

export default function WhyKayan() {
  return (
    <section className="section-padding bg-navy dark:bg-navy-800">
      <div className="container-kayan">
        <div className="text-center mb-12">
          <span className="text-gold font-semibold text-sm uppercase tracking-widest">مميزاتنا</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">لماذا كيان؟</h2>
          <p className="text-ivory/70 mt-3 max-w-xl mx-auto">
            نقدم أكثر من مجرد عقارات — نقدم تجربة استثنائية تبدأ من أول لقاء
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold/30 rounded-2xl p-6 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center mb-4 group-hover:bg-gold/30 transition-colors">
                <reason.icon className="w-6 h-6 text-gold" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{reason.title}</h3>
              <p className="text-ivory/60 text-sm leading-relaxed">{reason.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
