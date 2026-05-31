/**
 * كيان للعقارات — WhatsApp Business Cloud API
 *
 * Setup (مجاني لأول 1000 رسالة/شهر):
 * 1. اتفضل على https://developers.facebook.com
 * 2. أنشئ تطبيق → WhatsApp → Business
 * 3. احصل على WHATSAPP_TOKEN و WHATSAPP_PHONE_ID
 * 4. أضفهم في .env.local:
 *    WHATSAPP_TOKEN=your_token
 *    WHATSAPP_PHONE_ID=your_phone_number_id
 *    WHATSAPP_ADMIN_NUMBER=201xxxxxxxxx  (رقم الأدمن بالكود الدولي)
 */

const WA_TOKEN    = process.env.WHATSAPP_TOKEN;
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const WA_ADMIN    = process.env.WHATSAPP_ADMIN_NUMBER;
const BASE_URL    = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

// Check if WhatsApp API is configured
export const waEnabled = Boolean(WA_TOKEN && WA_PHONE_ID);

interface TextMessage { to: string; text: string }

/** Generic helper — usable by other modules */
export async function sendWhatsApp(to: string, text: string) {
  return sendText({ to, text });
}

async function sendText({ to, text }: TextMessage) {
  if (!waEnabled) {
    console.log(`[WA DEV] To: ${to}\nMsg: ${text}`);
    return;
  }
  const res = await fetch(`https://graph.facebook.com/v19.0/${WA_PHONE_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WA_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { preview_url: false, body: text },
    }),
  });
  if (!res.ok) console.error('[WhatsApp API]', await res.text());
}

/* ══════════════════════════════════════════════════════════
   1. إشعار الأدمن بليد جديد
   ══════════════════════════════════════════════════════════ */
export async function notifyAdminNewLead(data: {
  leadName:      string;
  leadPhone:     string;
  propertyTitle?: string | null;
  leadMessage?:   string | null;
}) {
  if (!WA_ADMIN) return;
  const msg = [
    `🔔 *استفسار جديد — كيان للعقارات*`,
    ``,
    `👤 الاسم: ${data.leadName}`,
    `📱 الهاتف: ${data.leadPhone}`,
    data.propertyTitle ? `🏠 العقار: ${data.propertyTitle}` : '',
    data.leadMessage   ? `💬 الرسالة: ${data.leadMessage}` : '',
    ``,
    `⚡ رد سريعاً — ${BASE_URL}/admin/leads`,
  ].filter(Boolean).join('\n');

  await sendText({ to: WA_ADMIN, text: msg });
}

/* ══════════════════════════════════════════════════════════
   2. إشعار الأدمن بعرض مالك جديد
   ══════════════════════════════════════════════════════════ */
export async function notifyAdminNewSubmission(data: {
  propertyTitle: string;
  ownerName?:    string | null;
  ownerPhone?:   string | null;
}) {
  if (!WA_ADMIN) return;
  const msg = [
    `🏠 *عرض مالك جديد — يحتاج موافقة*`,
    ``,
    `📌 العقار: ${data.propertyTitle}`,
    data.ownerName  ? `👤 المالك: ${data.ownerName}` : '',
    data.ownerPhone ? `📱 هاتفه: ${data.ownerPhone}` : '',
    ``,
    `🔍 راجع الطلب: ${BASE_URL}/admin/submissions`,
  ].filter(Boolean).join('\n');

  await sendText({ to: WA_ADMIN, text: msg });
}

/* ══════════════════════════════════════════════════════════
   3. إشعار المالك بقبول عقاره
   ══════════════════════════════════════════════════════════ */
export async function notifyOwnerApproved(data: {
  ownerPhone:    string;
  ownerName?:    string | null;
  propertyTitle: string;
  propertySlug:  string;
}) {
  const msg = [
    `✅ *تم قبول إعلانك في كيان للعقارات!*`,
    ``,
    `مرحباً ${data.ownerName ?? 'أخي'}،`,
    `تم مراجعة إعلان "${data.propertyTitle}" والموافقة عليه.`,
    ``,
    `🌐 رابط الإعلان:`,
    `${BASE_URL}/properties/${data.propertySlug}`,
    ``,
    `📌 تذكير: التواصل مع العملاء يتم عبر مكتب كيان فقط.`,
    `العمولة 1% فقط عند إتمام الصفقة 🤝`,
  ].join('\n');

  await sendText({ to: data.ownerPhone.replace(/\D/g, ''), text: msg });
}

/* ══════════════════════════════════════════════════════════
   4. تذكير المالك بتجديد الإعلان
   ══════════════════════════════════════════════════════════ */
export async function remindOwnerRenewal(data: {
  ownerPhone:    string;
  ownerName?:    string | null;
  propertyTitle: string;
  daysLeft:      number;
}) {
  const msg = [
    `⏰ *تذكير — إعلانك ينتهي قريباً*`,
    ``,
    `مرحباً ${data.ownerName ?? 'أخي'}،`,
    `إعلان "${data.propertyTitle}" سينتهي خلال *${data.daysLeft} أيام*.`,
    ``,
    `للتجديد المجاني تواصل معنا:`,
    `📱 مكتب كيان للعقارات`,
  ].join('\n');

  await sendText({ to: data.ownerPhone.replace(/\D/g, ''), text: msg });
}
