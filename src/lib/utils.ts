import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)} مليون جنيه`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(0)} ألف جنيه`;
  }
  return `${num.toLocaleString('ar-EG')} جنيه`;
}

export function formatArea(area: number): string {
  return `${area} م²`;
}

export function getPropertyTypeLabel(type: string): string {
  return type === 'SALE' ? 'للبيع' : 'للإيجار';
}

export function getPropertyStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    AVAILABLE: 'متاح',
    SOLD: 'مباع',
    RESERVED: 'محجوز',
  };
  return labels[status] ?? status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    AVAILABLE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    SOLD: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    RESERVED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  };
  return colors[status] ?? 'bg-gray-100 text-gray-800';
}

export function generateSlug(text: string): string {
  // Simple Arabic → Latin map for common words
  const arMap: Record<string, string> = {
    'شقة': 'apartment', 'شقه': 'apartment', 'فيلا': 'villa', 'دوبلكس': 'duplex',
    'محل': 'shop', 'مكتب': 'office', 'أرض': 'land', 'ارض': 'land',
    'للبيع': 'sale', 'للإيجار': 'rent', 'للايجار': 'rent',
    'غرف': 'rooms', 'غرفة': 'room',
    'مايو': 'mayo', 'الأول': '1', 'الثاني': '2', 'الثالث': '3',
    'الرابع': '4', 'الخامس': '5', 'السادس': '6', 'السابع': '7',
    'الثامن': '8', 'التاسع': '9', 'العاشر': '10',
    'مجاورة': 'zone', 'حي': 'district', 'منطقة': 'area',
    'فاخر': 'luxury', 'فاخرة': 'luxury', 'كبير': 'large', 'صغير': 'small',
  };

  let result = text.toLowerCase();

  // Replace known Arabic words
  Object.entries(arMap).forEach(([ar, en]) => {
    result = result.replace(new RegExp(ar, 'g'), en);
  });

  result = result
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  // If slug is too short (Arabic text not matched), append timestamp
  if (result.length < 3) {
    result = `property-${Date.now()}`;
  }

  return result;
}

export function getWhatsAppLink(phone: string, message?: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedMessage = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${cleanPhone}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
