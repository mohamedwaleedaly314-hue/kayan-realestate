import { z } from 'zod';

export const propertySchema = z.object({
  title_ar: z.string().min(3, 'العنوان يجب أن يكون 3 أحرف على الأقل').max(200),
  slug: z
    .string()
    .min(3, 'الـ slug قصير جداً — سيتم توليده تلقائياً')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'الـ slug يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطة فقط'),
  description_ar: z.string().max(5000).optional().nullable(),
  price: z.number().positive('السعر يجب أن يكون رقم موجب').max(99_999_999_999, 'السعر غير صحيح'),
  area_m2: z.number().positive('المساحة يجب أن تكون رقم موجب'),
  rooms: z.number().int().min(0).max(20).optional().nullable(),
  floor: z.number().int().min(0).max(100).optional().nullable(),
  has_elevator: z.boolean().default(false),
  type: z.enum(['SALE', 'RENT']),
  status: z.enum(['AVAILABLE', 'SOLD', 'RESERVED']).default('AVAILABLE'),
  district: z.string().min(2).max(100),
  lat: z.number().min(-90).max(90).optional().nullable(),
  lng: z.number().min(-180).max(180).optional().nullable(),
  featured: z.boolean().default(false),
});

const urlOrEmpty = z.string().url().optional().or(z.literal('')).or(z.null());

export const ownerSchema = z.object({
  name:          z.string().max(100).optional().nullable(),
  whatsapp:      z.string().regex(/^[0-9+]{7,15}$/, 'رقم واتساب غير صحيح').optional().or(z.literal('')).or(z.null()),
  facebook_url:  urlOrEmpty,
  instagram_url: urlOrEmpty,
  tiktok_url:    urlOrEmpty,
  youtube_url:   urlOrEmpty,
  twitter_url:   urlOrEmpty,
  notes:         z.string().max(2000).optional().nullable(),
  show_contact:  z.boolean().default(false),
});

export const leadSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').max(100),
  phone: z
    .string()
    .regex(/^[0-9+]{10,15}$/, 'رقم الهاتف غير صحيح'),
  message: z.string().max(1000).optional(),
  property_id: z.string().min(1).optional().nullable(),
  source: z.enum(['WEBSITE', 'WHATSAPP', 'PHONE', 'REFERRAL']).default('WEBSITE'),
});

export const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
});

export const propertyFilterSchema = z.object({
  type: z.enum(['SALE', 'RENT']).optional(),
  status: z.enum(['AVAILABLE', 'SOLD', 'RESERVED']).optional(),
  district: z.string().optional(),
  min_price: z.number().positive().optional(),
  max_price: z.number().positive().optional(),
  search: z.string().max(100).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(12),
});

export type PropertyInput = z.infer<typeof propertySchema>;
export type OwnerInput = z.infer<typeof ownerSchema>;
export type LeadInput = z.infer<typeof leadSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PropertyFilter = z.infer<typeof propertyFilterSchema>;
