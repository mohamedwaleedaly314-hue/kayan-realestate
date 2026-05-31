import Link from 'next/link';
import { MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getWhatsAppLink } from '@/lib/utils';

export default function ContactCTA() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '201234567890';

  return (
    <section className="section-padding bg-ivory dark:bg-navy-900">
      <div className="container-kayan">
        <div className="bg-gradient-to-br from-navy to-navy-700 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_50%_50%,_#B8860B_0%,_transparent_60%)]" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              هل تبحث عن عقار بمواصفات معينة؟
            </h2>
            <p className="text-ivory/70 text-lg mb-8 max-w-xl mx-auto">
              أخبرنا بما تريد وسيتواصل معك فريقنا خلال ساعات بأفضل الخيارات المتاحة
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gold" size="lg" asChild>
                <a
                  href={getWhatsAppLink(phone, 'السلام عليكم، أريد استشارة عقارية')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  تواصل على واتساب
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/40 text-white hover:bg-white/10 hover:text-white hover:border-white"
                asChild
              >
                <Link href="/contact" className="gap-2">
                  <Phone className="w-5 h-5" />
                  نموذج التواصل
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
