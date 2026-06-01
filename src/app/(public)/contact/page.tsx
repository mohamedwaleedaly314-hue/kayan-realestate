import type { Metadata } from 'next';
import ContactForm from '@/components/contact/contact-form';
import { MapPin, Phone, Clock, MessageCircle } from 'lucide-react';
import { getWhatsAppLink } from '@/lib/utils';
import { OFFICE_PHONE, OFFICE_WHATSAPP } from '@/lib/site';

export const metadata: Metadata = {
  title: 'تواصل معنا',
  description: 'تواصل مع فريق كيان للعقارات للحصول على استشارة مجانية',
};

export default function ContactPage() {
  const phone = OFFICE_WHATSAPP;

  return (
    <div className="pt-20 min-h-screen bg-background">
      <div className="navy-gradient py-16">
        <div className="container-kayan text-center text-white">
          <h1 className="text-4xl font-bold mb-3">تواصل معنا</h1>
          <p className="text-ivory/70 text-lg">فريقنا جاهز للمساعدة في إيجاد عقارك المثالي</p>
        </div>
      </div>

      <div className="container-kayan py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-navy dark:text-ivory mb-6">معلومات التواصل</h2>
              <div className="space-y-5">
                {[
                  {
                    icon: MapPin,
                    title: 'موقعنا',
                    desc: 'مدينة 15 مايو، القاهرة، مصر',
                  },
                  {
                    icon: Phone,
                    title: 'اتصل بنا',
                    desc: OFFICE_PHONE,
                    link: `tel:${OFFICE_PHONE}`,
                    linkLabel: 'اتصل الآن',
                  },
                  {
                    icon: MessageCircle,
                    title: 'واتساب',
                    desc: 'متاح للتواصل والاستفسارات',
                    link: getWhatsAppLink(phone, 'السلام عليكم، أريد استشارة عقارية'),
                    linkLabel: 'تواصل الآن',
                  },
                  {
                    icon: Clock,
                    title: 'أوقات العمل',
                    desc: 'السبت – الخميس: ٩ صباحاً – ٩ مساءً',
                  },
                ].map((info) => (
                  <div key={info.title} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                      <info.icon className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{info.title}</p>
                      <p className="text-muted-foreground text-sm mt-0.5">{info.desc}</p>
                      {info.link && (
                        <a
                          href={info.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gold text-sm font-medium hover:underline mt-1 inline-block"
                        >
                          {info.linkLabel}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
