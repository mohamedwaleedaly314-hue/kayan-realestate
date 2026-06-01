/**
 * Single source of truth for the كيان office contact details.
 * Change the number here once and it updates everywhere on the site.
 */

// Display form (local Egyptian number) — used for tel: links and on-screen text.
export const OFFICE_PHONE = '01044236236';

/**
 * Normalize any Egyptian number to the international form WhatsApp needs
 * (country code 20, no leading 0 / +). This guarantees wa.me links open a
 * real chat even if the env var holds a local-format number like 01044236236.
 */
function toInternational(raw: string): string {
  const d = (raw || '').replace(/\D/g, '');
  if (!d) return '201044236236';
  if (d.startsWith('20')) return d;            // already international
  if (d.startsWith('0')) return `20${d.slice(1)}`; // 01044236236 -> 201044236236
  if (d.length === 10) return `20${d}`;        // 1044236236 -> 201044236236
  return d;
}

// International form — used for wa.me WhatsApp links. Always valid regardless
// of how NEXT_PUBLIC_WHATSAPP_NUMBER happens to be formatted.
export const OFFICE_WHATSAPP = toInternational(
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || OFFICE_PHONE,
);
