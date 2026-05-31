import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, DollarSign, Clock, Phone, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'الشروط والأحكام — كيان للعقارات',
  description: 'شروط وأحكام التعامل مع كيان للعقارات، سياسة العمولة، شروط النشر المجاني، وضمان خصوصية البيانات',
};

export default function PolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-br from-navy to-navy/80 text-white py-14 px-4">
        <div className="container-kayan max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gold/20 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-gold" />
            </div>
            <p className="text-gold font-semibold text-sm uppercase tracking-widest">الشروط والأحكام</p>
          </div>
          <h1 className="text-3xl font-bold mb-3">سياسة كيان للعقارات</h1>
          <p className="text-ivory/70 leading-relaxed">
            نحن نؤمن بالشفافية الكاملة — اقرأ هذه الشروط لفهم كيفية عملنا وحقوقك معنا.
          </p>
        </div>
      </div>

      <div className="container-kayan max-w-3xl py-12 space-y-10">

        {/* Quick cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: DollarSign, title: '1% عمولة فقط', desc: 'تُدفع عند إتمام الصفقة', color: 'text-gold' },
            { icon: Clock,      title: '30 يوم مجاناً', desc: 'نشر مجاني بلا تكلفة', color: 'text-emerald-500' },
            { icon: Phone,      title: 'رقمك خاص',      desc: 'التواصل عبر المكتب فقط', color: 'text-blue-500' },
            { icon: Star,       title: 'فريق متخصص',    desc: 'سيلز تيم محترف', color: 'text-purple-500' },
          ].map(c => (
            <div key={c.title} className="bg-card border border-border rounded-2xl p-4 text-center">
              <c.icon className={`w-6 h-6 mx-auto mb-2 ${c.color}`} />
              <p className="font-bold text-sm text-foreground">{c.title}</p>
              <p className="text-xs text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>

        <Section title="أولاً: سياسة العمولة">
          <ul className="space-y-3 text-muted-foreground text-sm leading-relaxed list-none">
            <li className="flex gap-3"><span className="text-gold font-bold">•</span><span>عمولة كيان للعقارات هي <strong className="text-foreground">1% (واحد بالمئة)</strong> من إجمالي قيمة الصفقة (بيع أو إيجار).</span></li>
            <li className="flex gap-3"><span className="text-gold font-bold">•</span><span>العمولة <strong className="text-foreground">تُدفع فقط عند إتمام البيع أو توقيع عقد الإيجار</strong> بنجاح — لا رسوم مسبقة على الإطلاق.</span></li>
            <li className="flex gap-3"><span className="text-gold font-bold">•</span><span>في حال بيع العقار ذاتياً (بدون تدخل المكتب) لا تُستحق أي عمولة.</span></li>
            <li className="flex gap-3"><span className="text-gold font-bold">•</span><span>العمولة تشمل خدمات التسويق، التصوير، التفاوض، وإتمام إجراءات العقد.</span></li>
            <li className="flex gap-3"><span className="text-gold font-bold">•</span><span>للعقارات المؤجرة، تُحتسب العمولة على قيمة الإيجار السنوي.</span></li>
          </ul>
        </Section>

        <Section title="ثانياً: النشر المجاني لمدة 30 يوماً">
          <ul className="space-y-3 text-muted-foreground text-sm leading-relaxed list-none">
            <li className="flex gap-3"><span className="text-gold font-bold">•</span><span>يحق لكل مالك <strong className="text-foreground">نشر إعلان عقاره مجاناً لمدة 30 يوماً</strong> بعد موافقة الإدارة.</span></li>
            <li className="flex gap-3"><span className="text-gold font-bold">•</span><span>بعد انتهاء مدة النشر المجاني، يُتواصل مع المالك لتجديد الإعلان أو إزالته.</span></li>
            <li className="flex gap-3"><span className="text-gold font-bold">•</span><span>الإعلان يظهر في موقع كيان الرسمي وعلى صفحاتنا على وسائل التواصل الاجتماعي.</span></li>
            <li className="flex gap-3"><span className="text-gold font-bold">•</span><span>لتمييز الإعلان (نشر مميز في الأعلى) يتوفر ذلك بالتواصل مع الإدارة مباشرة.</span></li>
          </ul>
        </Section>

        <Section title="ثالثاً: خصوصية بيانات المالك">
          <ul className="space-y-3 text-muted-foreground text-sm leading-relaxed list-none">
            <li className="flex gap-3"><span className="text-gold font-bold">•</span><span><strong className="text-foreground">رقم هاتف المالك لا يُعرض للعملاء أبداً</strong> — جميع الاستفسارات تمر عبر مكتب كيان.</span></li>
            <li className="flex gap-3"><span className="text-gold font-bold">•</span><span>مكتب كيان هو الوسيط الوحيد بين المالك والمشترين، مما يحمي بيانات المالك وخصوصيته.</span></li>
            <li className="flex gap-3"><span className="text-gold font-bold">•</span><span>لن يتم مشاركة بياناتك مع أي طرف ثالث خارج مكتب كيان.</span></li>
            <li className="flex gap-3"><span className="text-gold font-bold">•</span><span>يحق للمالك طلب حذف إعلانه وبياناته في أي وقت بالتواصل مع الإدارة.</span></li>
          </ul>
        </Section>

        <Section title="رابعاً: فريق المبيعات (السيلز تيم)">
          <ul className="space-y-3 text-muted-foreground text-sm leading-relaxed list-none">
            <li className="flex gap-3"><span className="text-gold font-bold">•</span><span>يملك مكتب كيان فريق مبيعات متخصص يعمل على تسويق العقارات المدرجة لدينا.</span></li>
            <li className="flex gap-3"><span className="text-gold font-bold">•</span><span>فريق المبيعات يتلقى نسبة من عمولة المكتب عند إتمام كل صفقة بنجاح.</span></li>
            <li className="flex gap-3"><span className="text-gold font-bold">•</span><span>المالك يتواصل مع مكتب كيان فقط — لا يتعامل مباشرة مع أفراد السيلز تيم.</span></li>
            <li className="flex gap-3"><span className="text-gold font-bold">•</span><span>جميع المعاملات تتم بإشراف الإدارة وتوثق بالكامل.</span></li>
          </ul>
        </Section>

        <Section title="خامساً: مواعيد المعاينة">
          <ul className="space-y-3 text-muted-foreground text-sm leading-relaxed list-none">
            <li className="flex gap-3"><span className="text-gold font-bold">•</span><span>عند تقديم طلب النشر، يحدد المالك الأيام والأوقات المفضلة لمعاينة العقار.</span></li>
            <li className="flex gap-3"><span className="text-gold font-bold">•</span><span>مكتب كيان يتولى ترتيب مواعيد المعاينة مع المشترين في الأوقات المحددة.</span></li>
            <li className="flex gap-3"><span className="text-gold font-bold">•</span><span>المالك لا يتواصل مباشرة مع المشترين إلا بعد الاتفاق النهائي وبعلم المكتب.</span></li>
          </ul>
        </Section>

        <Section title="سادساً: قواعد عامة">
          <ul className="space-y-3 text-muted-foreground text-sm leading-relaxed list-none">
            <li className="flex gap-3"><span className="text-gold font-bold">•</span><span>يحق لمكتب كيان رفض أي إعلان لا يستوفي معايير الجودة أو يحتوي على معلومات مضللة.</span></li>
            <li className="flex gap-3"><span className="text-gold font-bold">•</span><span>المالك مسؤول عن دقة المعلومات المقدمة (السعر، المساحة، الموقع).</span></li>
            <li className="flex gap-3"><span className="text-gold font-bold">•</span><span>يُمنع نشر عقارات وهمية أو مكررة — وقد تُتخذ إجراءات قانونية عند الاكتشاف.</span></li>
            <li className="flex gap-3"><span className="text-gold font-bold">•</span><span>تحتفظ إدارة كيان بحق تعديل هذه الشروط في أي وقت مع إشعار المستخدمين.</span></li>
          </ul>
        </Section>

        <div className="p-6 bg-gold/5 border border-gold/20 rounded-2xl text-center">
          <p className="text-foreground font-bold mb-2">للاستفسار عن أي بند من هذه الشروط</p>
          <p className="text-muted-foreground text-sm mb-4">نحن هنا للإجابة على جميع أسئلتك</p>
          <Link href="/contact"
            className="inline-flex items-center gap-2 bg-gold text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gold/90 transition-colors">
            📞 تواصل معنا
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h2 className="font-bold text-foreground text-lg mb-4 pb-3 border-b border-border/60">{title}</h2>
      {children}
    </div>
  );
}
