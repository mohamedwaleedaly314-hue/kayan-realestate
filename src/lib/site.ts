/**
 * Single source of truth for the كيان office contact details.
 * Change the number here once and it updates everywhere on the site.
 *
 * NOTE: the number is hardcoded on purpose. The NEXT_PUBLIC_WHATSAPP_NUMBER
 * env var on Vercel still holds an old placeholder (201234567890), so we do
 * NOT read it — it would override the real office number.
 */

// Display form (local Egyptian number) — used for tel: links and on-screen text.
export const OFFICE_PHONE = '01044236236';

// International form — used for wa.me WhatsApp links so they open a real chat.
export const OFFICE_WHATSAPP = '201044236236';
