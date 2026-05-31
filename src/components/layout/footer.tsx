import Link from 'next/link';
import { Building2, Phone, MapPin, Mail } from 'lucide-react';

export default function Footer() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '201234567890';

  return (
    <footer className="bg-navy text-ivory/80 pt-16 pb-8">
      <div className="container-kayan">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">كيان</span>
                <p className="text-xs text-ivory/60 -mt-0.5">للعقارات</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-ivory/70">
              شركة كيان للعقارات — وجهتك الأولى في مدينة 15 مايو لأفضل العروض العقارية بيعاً وإيجاراً.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-base">روابط سريعة</h3>
            <ul className="space-y-3 text-sm">
              {[
                { href: '/properties?type=SALE', label: 'عقارات للبيع' },
                { href: '/properties?type=RENT', label: 'عقارات للإيجار' },
                { href: '/about', label: 'من نحن' },
                { href: '/contact', label: 'تواصل معنا' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-base">تواصل معنا</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gold shrink-0" />
                <span>مدينة 15 مايو، القاهرة، مصر</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <a
                  href={`https://wa.me/${whatsapp}`}
                  className="hover:text-gold transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  واتساب
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <a href="mailto:info@kayan-realestate.com" className="hover:text-gold transition-colors">
                  info@kayan-realestate.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-ivory/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-ivory/50">
          <p>© {new Date().getFullYear()} كيان للعقارات. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-gold transition-colors">سياسة الخصوصية</Link>
            <span>•</span>
            <p>مدينة 15 مايو — مصر</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
