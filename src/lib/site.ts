/**
 * Single source of truth for the كيان office contact details.
 * Change the number here once and it updates everywhere on the site.
 */

// Display form (local Egyptian number) — used for tel: links and on-screen text.
export const OFFICE_PHONE = '01044236236';

// International form (no +/0) — used for wa.me WhatsApp links.
export const OFFICE_WHATSAPP =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '201044236236';
