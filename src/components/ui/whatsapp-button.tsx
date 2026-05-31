'use client';

import { MessageCircle } from 'lucide-react';
import { getWhatsAppLink } from '@/lib/utils';

export default function WhatsAppButton() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '201234567890';
  const message = 'السلام عليكم، أريد الاستفسار عن عقار من موقع كيان للعقارات';

  return (
    <a
      href={getWhatsAppLink(phone, message)}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 animate-float"
      aria-label="تواصل معنا على واتساب"
    >
      <MessageCircle className="w-7 h-7 fill-white" />
    </a>
  );
}
