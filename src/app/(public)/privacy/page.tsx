import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية — كيان للعقارات',
  description: 'سياسة الخصوصية وشروط استخدام موقع كيان للعقارات',
};

const sections = [
  {
    title: 'المعلومات التي نجمعها',
    content: `نجمع المعلومات التي تقدمها مباشرةً عند:
• إنشاء حساب (الاسم، البريد الإلكتروني، رقم الهاتف)
• التواصل معنا عبر نموذج الاستفسار (الاسم، الهاتف، الرسالة)
• حفظ العقارات المفضلة وتصفّح الموقع

نجمع أيضاً بيانات تقنية تلقائياً مثل عنوان IP لأغراض الأمان ومنع الإساءة.`,
  },
  {
    title: 'كيف نستخدم معلوماتك',
    content: `نستخدم المعلومات المجمّعة لأغراض محددة فقط:
• التواصل معك بخصوص استفساراتك العقارية
• تحسين تجربة استخدام الموقع
• إرسال تحديثات العقارات (إن اخترت ذلك)
• ضمان أمان الموقع ومنع الاستخدام المسيء

لن نبيع أو نؤجر معلوماتك لأي طرف ثالث تحت أي ظرف.`,
  },
  {
    title: 'ملفات تعريف الارتباط (Cookies)',
    content: `نستخدم ملفات تعريف الارتباط الضرورية فقط:
• جلسة تسجيل الدخول (httpOnly, Secure)
• تفضيل الوضع الليلي/النهاري

لا نستخدم ملفات تتبع إعلانية أو تحليل سلوك المستخدم من أطراف خارجية.`,
  },
  {
    title: 'حفظ وحماية البيانات',
    content: `نحمي بياناتك بعدة طبقات أمان:
• تشفير كلمات المرور باستخدام bcrypt
• اتصالات HTTPS مشفّرة
• جلسات JWT محدودة المدة
• تقييد معدل الطلبات لمنع الهجمات

نحتفظ ببيانات حسابك طالما حسابك نشط. يمكنك طلب حذف بياناتك في أي وقت.`,
  },
  {
    title: 'حقوقك',
    content: `لديك الحق الكامل في:
• الاطلاع على جميع بياناتك المحفوظة لدينا
• تصحيح أي معلومات غير دقيقة
• طلب حذف حسابك وجميع بياناتك
• الاعتراض على معالجة بياناتك

للممارسة أي من هذه الحقوق، تواصل معنا عبر صفحة الاتصال.`,
  },
  {
    title: 'مشاركة البيانات',
    content: `لا نشارك بياناتك مع أطراف ثالثة إلا في الحالات التالية:
• إذا كنت قد وافقت صراحةً على ذلك
• إذا كان ذلك ضرورياً للاستجابة لطلبك (مثل ربطك بصاحب العقار)
• إذا كان القانون المصري يلزمنا بذلك

جميع بيانات العملاء تبقى في مصر ولا تُنقل خارجها.`,
  },
  {
    title: 'التغييرات على هذه السياسة',
    content: `قد نُحدّث هذه السياسة من وقت لآخر. في حال وجود تغييرات جوهرية، سنُخطرك عبر البريد الإلكتروني أو إشعار واضح على الموقع.

آخر تحديث: مايو 2025`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-ivory dark:bg-navy-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">الرئيسية</Link>
          <ChevronLeft className="w-4 h-4" />
          <span className="text-foreground">سياسة الخصوصية</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-3">سياسة الخصوصية</h1>
          <p className="text-muted-foreground leading-relaxed">
            نلتزم في كيان للعقارات بحماية خصوصيتك وبياناتك الشخصية. توضّح هذه السياسة كيفية جمع المعلومات
            واستخدامها وحمايتها عند استخدامك لموقعنا.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-gold/10 text-gold text-sm flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                {section.title}
              </h2>
              <p className="text-muted-foreground text-sm leading-8 whitespace-pre-line">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-8 bg-navy dark:bg-navy-800 rounded-2xl p-6 text-center">
          <p className="text-ivory/80 text-sm mb-3">
            لأي استفسار حول سياسة الخصوصية أو بياناتك الشخصية
          </p>
          <Link
            href="/contact"
            className="inline-block bg-gold text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gold/90 transition-colors"
          >
            تواصل معنا
          </Link>
        </div>
      </div>
    </div>
  );
}
