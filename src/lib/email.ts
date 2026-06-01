/**
 * كيان للعقارات — Email System
 * Provider: Resend (https://resend.com — 3000 emails/month free)
 */

const FROM_EMAIL  = process.env.EMAIL_FROM   ?? 'كيان للعقارات <onboarding@resend.dev>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL  ?? 'mohamedwaleedaly314@gmail.com';
const BASE_URL    = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

/* ── shared send helper ─────────────────────────────────────────── */
async function sendEmail(to: string | string[], subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`\n📧 [EMAIL DEV] To: ${to}\nSubject: ${subject}\n`);
    return;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM_EMAIL, to: Array.isArray(to) ? to : [to], subject, html }),
    });
    if (!res.ok) console.error('[Email] Resend error:', await res.text());
  } catch (err) {
    console.error('[Email] Failed:', err);
  }
}

/* ── shared layout helpers ─────────────────────────────────────── */
const wrap = (content: string) => `
<div dir="rtl" style="font-family:'Segoe UI',Arial,sans-serif;max-width:620px;margin:0 auto;background:#f5f0e8;padding:24px;border-radius:16px;">
  <div style="background:linear-gradient(135deg,#1A2B4A,#0f1d33);padding:22px 28px;border-radius:12px;margin-bottom:20px;">
    <div style="display:flex;align-items:center;gap:14px;">
      <div style="width:44px;height:44px;background:#B8860B;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">🏢</div>
      <div>
        <h1 style="color:#B8860B;margin:0;font-size:20px;font-weight:800;letter-spacing:1px;">كيان للعقارات</h1>
        <p style="color:#c8bfa0;margin:3px 0 0;font-size:12px;">مدينة 15 مايو — القاهرة</p>
      </div>
    </div>
  </div>
  ${content}
  <p style="text-align:center;color:#aaa;font-size:11px;margin-top:20px;">
    كيان للعقارات — مدينة 15 مايو<br>
    <a href="${BASE_URL}" style="color:#B8860B;text-decoration:none;">${BASE_URL.replace('https://','').replace('http://','')}</a>
  </p>
</div>`;

const btn = (label: string, href: string, bg = '#B8860B') =>
  `<div style="text-align:center;margin-top:20px;">
    <a href="${href}" style="background:${bg};color:#fff;padding:13px 28px;border-radius:10px;
    text-decoration:none;font-size:14px;font-weight:700;display:inline-block;">${label}</a>
  </div>`;

const row = (label: string, value: string) =>
  `<tr>
    <td style="padding:9px 0;color:#888;font-size:13px;width:120px;vertical-align:top;white-space:nowrap;">${label}</td>
    <td style="padding:9px 0;color:#1A2B4A;font-weight:600;font-size:13px;">${value}</td>
  </tr>`;

/* ═══════════════════════════════════════════════════════════════════
   1. NEW LEAD — استفسار عقار جديد
   ═══════════════════════════════════════════════════════════════════ */
export interface LeadEmailData {
  leadName:        string;
  leadPhone:       string;
  leadMessage?:    string | null;
  propertyTitle?:  string | null;
  propertySlug?:   string | null;
  source?:         string;
  // Owner info (for free-listing properties submitted by owners)
  ownerName?:      string | null;
  ownerPhone?:     string | null;
  ownerWhatsapp?:  string | null;
}

export async function sendLeadNotification(data: LeadEmailData) {
  const waMsg      = encodeURIComponent(`مرحباً ${data.leadName}،\nمن فريق كيان للعقارات بخصوص استفسارك${data.propertyTitle ? ` عن "${data.propertyTitle}"` : ''}.\nهل أنت متاح الآن؟`);
  const waLink     = `https://wa.me/${data.leadPhone.replace(/\D/g,'')}?text=${waMsg}`;
  const srcMap: Record<string,string> = { WEBSITE:'الموقع', WHATSAPP:'واتساب', PHONE:'هاتف', REFERRAL:'إحالة' };

  // Owner WhatsApp link (to notify property owner about the new lead)
  const ownerContact = data.ownerWhatsapp || data.ownerPhone;
  const ownerWaMsg   = ownerContact
    ? encodeURIComponent(`مرحباً ${data.ownerName ?? 'أخي'}،\nمن مكتب كيان للعقارات 🏢\n\nوصلنا استفسار على عقارك "${data.propertyTitle ?? ''}" من عميل جديد.\n\nاسم العميل: ${data.leadName}\nهاتف العميل: ${data.leadPhone}\n\nسنتواصل معه من المكتب — فقط للإحاطة. 🙏`)
    : null;
  const ownerWaLink  = ownerContact && ownerWaMsg
    ? `https://wa.me/${ownerContact.replace(/\D/g,'')}?text=${ownerWaMsg}`
    : null;

  const html = wrap(`
    <div style="background:#fff5e6;border-right:4px solid #ff6b00;padding:14px 18px;border-radius:10px;margin-bottom:18px;">
      <p style="margin:0;color:#cc4400;font-size:13px;font-weight:700;">🔥 استفسار جديد — يحتاج رد سريع</p>
    </div>

    <div style="background:#fff;border-radius:10px;padding:22px;margin-bottom:16px;">
      <p style="color:#888;font-size:11px;font-weight:700;margin:0 0 10px;text-transform:uppercase;letter-spacing:1px;">بيانات العميل</p>
      <table style="width:100%;border-collapse:collapse;">
        ${row('الاسم', data.leadName)}
        ${row('الهاتف', `<a href="${waLink}" style="color:#25D366;text-decoration:none;">📱 ${data.leadPhone}</a>`)}
        ${data.propertyTitle ? row('العقار', `<a href="${BASE_URL}/properties/${data.propertySlug ?? ''}" style="color:#B8860B;text-decoration:none;">${data.propertyTitle}</a>`) : ''}
        ${data.source ? row('المصدر', srcMap[data.source] ?? data.source) : ''}
        ${data.leadMessage ? row('الرسالة', data.leadMessage) : ''}
      </table>
    </div>

    ${ownerWaLink ? `
    <div style="background:#e8f5e9;border:1px solid #a5d6a7;border-radius:10px;padding:16px 20px;margin-bottom:16px;">
      <p style="color:#1b5e20;font-size:12px;font-weight:700;margin:0 0 8px;">🏠 بيانات مالك العقار — للإحاطة فقط</p>
      <table style="width:100%;border-collapse:collapse;">
        ${data.ownerName ? row('المالك', data.ownerName) : ''}
        ${ownerContact ? row('هاتفه', `<span dir="ltr">${ownerContact}</span>`) : ''}
      </table>
      <div style="margin-top:12px;">
        <a href="${ownerWaLink}" style="background:#25D366;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:700;">📲 أبلغ المالك بالاستفسار</a>
      </div>
    </div>` : ''}

    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
      <a href="${waLink}" style="background:#25D366;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-size:13px;font-weight:700;">💬 رد على العميل</a>
      <a href="${BASE_URL}/admin/leads" style="background:#1A2B4A;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-size:13px;font-weight:700;">📋 لوحة التحكم</a>
    </div>
  `);

  await sendEmail(ADMIN_EMAIL, `🔔 استفسار جديد — ${data.leadName}${data.propertyTitle ? ` | ${data.propertyTitle}` : ''}`, html);
}

/* ═══════════════════════════════════════════════════════════════════
   2. NEW PROPERTY REQUEST — طلب عقار جديد
   ═══════════════════════════════════════════════════════════════════ */
export interface PropertyRequestEmailData {
  name:       string;
  phone:      string;
  type:       string;
  district?:  string | null;
  min_price?: number | null;
  max_price?: number | null;
  rooms?:     number | null;
  notes?:     string | null;
}

export async function sendPropertyRequestNotification(data: PropertyRequestEmailData) {
  const typeLabel   = data.type === 'SALE' ? 'شراء' : 'إيجار';
  const waMsg       = encodeURIComponent(`مرحباً ${data.name}،\nتواصلنا معك من كيان للعقارات بخصوص طلبك لعقار ${typeLabel === 'شراء' ? 'للشراء' : 'للإيجار'}${data.district ? ` في ${data.district}` : ''}.\nهل أنت متاح الآن؟`);
  const waLink      = `https://wa.me/${data.phone.replace(/\D/g,'')}?text=${waMsg}`;
  const priceRange  = [
    data.min_price ? `من ${data.min_price.toLocaleString('ar-EG')} ج.م` : '',
    data.max_price ? `حتى ${data.max_price.toLocaleString('ar-EG')} ج.م` : '',
  ].filter(Boolean).join(' — ') || 'غير محددة';

  const html = wrap(`
    <div style="background:#e8f0ff;border-right:4px solid #3b5bdb;padding:14px 18px;border-radius:10px;margin-bottom:18px;">
      <p style="margin:0;color:#2c3e9e;font-size:13px;font-weight:700;">📋 طلب عقار جديد</p>
    </div>
    <div style="background:#fff;border-radius:10px;padding:22px;margin-bottom:16px;">
      <table style="width:100%;border-collapse:collapse;">
        ${row('الاسم', data.name)}
        ${row('الهاتف', `<a href="${waLink}" style="color:#25D366;text-decoration:none;">${data.phone}</a>`)}
        ${row('النوع', typeLabel)}
        ${data.district ? row('المنطقة', data.district) : ''}
        ${row('الميزانية', priceRange)}
        ${data.rooms ? row('الغرف', `${data.rooms} غرف`) : ''}
        ${data.notes ? row('ملاحظات', data.notes) : ''}
      </table>
    </div>
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
      <a href="${waLink}" style="background:#25D366;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-size:13px;font-weight:700;">💬 رد عبر واتساب</a>
      <a href="${BASE_URL}/admin/requests" style="background:#1A2B4A;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-size:13px;font-weight:700;">📋 عرض الطلبات</a>
    </div>
  `);

  await sendEmail(ADMIN_EMAIL, `📋 طلب عقار — ${data.name} | ${typeLabel}${data.district ? ` في ${data.district}` : ''}`, html);
}

/* ═══════════════════════════════════════════════════════════════════
   3. NEW USER — تسجيل مستخدم جديد
   ═══════════════════════════════════════════════════════════════════ */
export interface NewUserData {
  id:        string;
  name:      string;
  email:     string;
  phone?:    string | null;
  district?: string | null;
}

export async function sendNewUserNotification(user: NewUserData) {
  const waLink = user.phone
    ? `https://wa.me/${user.phone.replace(/\D/g,'')}?text=${encodeURIComponent(`مرحباً ${user.name}،\nأهلاً بك في كيان للعقارات! هل يمكنني مساعدتك في إيجاد عقار مناسب؟`)}`
    : null;

  const html = wrap(`
    <div style="background:#e8fff0;border-right:4px solid #00b050;padding:14px 18px;border-radius:10px;margin-bottom:18px;">
      <p style="margin:0;color:#007a38;font-size:13px;font-weight:700;">👤 عميل جديد سجّل في الموقع</p>
    </div>
    <div style="background:#fff;border-radius:10px;padding:22px;margin-bottom:16px;">
      <table style="width:100%;border-collapse:collapse;">
        ${row('الاسم', user.name)}
        ${row('البريد', user.email)}
        ${row('الهاتف', user.phone
          ? `<a href="${waLink ?? '#'}" style="color:#25D366;text-decoration:none;">${user.phone}</a>`
          : '<span style="color:#cc4400;">⚠️ لم يسجّل رقم</span>')}
        ${row('المجاورة', user.district ? `📍 ${user.district}` : '—')}
      </table>
    </div>
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
      ${waLink ? `<a href="${waLink}" style="background:#25D366;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-size:13px;font-weight:700;">💬 رسّل عبر واتساب</a>` : ''}
      <a href="${BASE_URL}/admin/users" style="background:#1A2B4A;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-size:13px;font-weight:700;">👥 إدارة المستخدمين</a>
    </div>
  `);

  await sendEmail(ADMIN_EMAIL, `👤 عميل جديد — ${user.name}${user.district ? ` من ${user.district}` : ''}`, html);
}

/* ═══════════════════════════════════════════════════════════════════
   4. WELCOME EMAIL — ترحيب بالمستخدم
   ═══════════════════════════════════════════════════════════════════ */
export async function sendWelcomeEmail(userName: string, userEmail: string) {
  const html = wrap(`
    <div style="background:#fff;border-radius:12px;padding:32px;text-align:center;margin-bottom:16px;">
      <div style="font-size:52px;margin-bottom:16px;">🏠</div>
      <h2 style="color:#1A2B4A;font-size:22px;margin:0 0 10px;">أهلاً وسهلاً ${userName}!</h2>
      <p style="color:#555;font-size:14px;line-height:1.9;margin-bottom:24px;">
        تم إنشاء حسابك في <strong style="color:#B8860B;">كيان للعقارات</strong> بنجاح.<br>
        تصفّح العقارات، احفظ المفضلة، وتابع استفساراتك بسهولة.
      </p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <a href="${BASE_URL}/properties" style="background:#B8860B;color:#fff;padding:13px 24px;border-radius:10px;text-decoration:none;font-size:13px;font-weight:700;">🏠 تصفّح العقارات</a>
        <a href="${BASE_URL}/request"     style="background:#1A2B4A;color:#fff;padding:13px 24px;border-radius:10px;text-decoration:none;font-size:13px;font-weight:700;">📝 اطلب عقار</a>
      </div>
    </div>
    <div style="background:#fff;border-radius:12px;padding:18px;">
      <p style="color:#1A2B4A;font-weight:700;font-size:13px;margin:0 0 10px;">لماذا كيان؟</p>
      ${['🏆 أكبر قاعدة عقارات في مدينة 15 مايو','⚡ رد سريع من فريق المبيعات','🔒 بيانات موثوقة ومحدّثة','📱 تواصل مباشر عبر واتساب'].map(t =>
        `<p style="font-size:13px;color:#555;margin:6px 0;">${t}</p>`).join('')}
    </div>
  `);

  await sendEmail(userEmail, `أهلاً ${userName} في كيان للعقارات 🏠`, html);
}

/* ═══════════════════════════════════════════════════════════════════
   5. SEARCH ALERT — تنبيه بحث للمستخدم
   ═══════════════════════════════════════════════════════════════════ */
export async function sendSearchAlertEmail(
  toEmail: string,
  property: { title_ar: string; slug: string; price: number; area_m2: number; type: string; district: string }
) {
  const typeLabel = property.type === 'SALE' ? 'للبيع' : 'للإيجار';
  const html = wrap(`
    <div style="background:#fff3cd;border-right:4px solid #ffc107;padding:14px 18px;border-radius:10px;margin-bottom:18px;">
      <p style="margin:0;color:#856404;font-size:13px;font-weight:700;">🔔 عقار جديد يطابق بحثك!</p>
    </div>
    <div style="background:#fff;border-radius:10px;padding:22px;margin-bottom:16px;">
      <h3 style="color:#1A2B4A;margin:0 0 10px;font-size:16px;">${property.title_ar}</h3>
      <p style="color:#666;font-size:13px;margin:0 0 8px;">📍 ${property.district} &nbsp;|&nbsp; ${typeLabel}</p>
      <p style="color:#B8860B;font-size:18px;font-weight:700;margin:0;">
        ${property.price.toLocaleString('ar-EG')} ج.م
        <span style="color:#888;font-size:13px;font-weight:400;"> — ${property.area_m2} م²</span>
      </p>
    </div>
    ${btn('عرض تفاصيل العقار', `${BASE_URL}/properties/${property.slug}`)}
    <p style="text-align:center;color:#aaa;font-size:11px;margin-top:12px;">
      لإيقاف التنبيهات: الملف الشخصي ← التنبيهات
    </p>
  `);
  await sendEmail(toEmail, `🔔 عقار يطابق بحثك — ${property.title_ar}`, html);
}

/* ═══════════════════════════════════════════════════════════════════
   6. DAILY DIGEST — ملخص يومي للأدمن
   ═══════════════════════════════════════════════════════════════════ */
export interface DigestData {
  newLeads:     number;
  newRequests:  number;
  newUsers:     number;
  totalViews:   number;
  pendingLeads: number;
  topProperty?: { title_ar: string; slug: string; views_count: number } | null;
}

export async function sendDailyDigest(data: DigestData) {
  const today = new Date().toLocaleDateString('ar-EG', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  const card = (emoji: string, label: string, value: number, color: string) =>
    `<td style="padding:8px;text-align:center;">
      <div style="background:#fff;border-radius:10px;padding:14px;border-top:3px solid ${color};">
        <div style="font-size:22px;">${emoji}</div>
        <div style="font-size:22px;font-weight:800;color:${color};">${value}</div>
        <div style="font-size:11px;color:#888;">${label}</div>
      </div>
    </td>`;

  const html = wrap(`
    <div style="background:#1A2B4A;border-radius:10px;padding:16px 20px;margin-bottom:20px;text-align:center;">
      <p style="color:#B8860B;font-weight:700;font-size:14px;margin:0;">📊 الملخص اليومي — ${today}</p>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      <tr>
        ${card('💬','استفسار جديد',data.newLeads,'#ff6b35')}
        ${card('📋','طلب عقار',data.newRequests,'#3b5bdb')}
        ${card('👤','مستخدم جديد',data.newUsers,'#00b050')}
        ${card('👁️','مشاهدة',data.totalViews,'#B8860B')}
      </tr>
    </table>
    ${data.pendingLeads > 0
      ? `<div style="background:#fff3cd;border:1px solid #ffc107;border-radius:10px;padding:14px 18px;margin-bottom:16px;">
          <p style="margin:0;color:#856404;font-weight:700;">⚠️ ${data.pendingLeads} استفسار لم يُرَد عليه — يحتاج متابعة فورية!</p>
        </div>`
      : `<div style="background:#e8fff0;border:1px solid #00b050;border-radius:10px;padding:14px 18px;margin-bottom:16px;">
          <p style="margin:0;color:#007a38;font-weight:700;">✅ تم الرد على جميع الاستفسارات 🎉</p>
        </div>`}
    ${data.topProperty ? `
    <div style="background:#fff;border-radius:10px;padding:16px;margin-bottom:16px;">
      <p style="color:#888;font-size:11px;margin:0 0 6px;">⭐ الأكثر مشاهدة اليوم</p>
      <p style="color:#1A2B4A;font-weight:700;font-size:14px;margin:0 0 4px;">${data.topProperty.title_ar}</p>
      <p style="color:#B8860B;font-size:13px;margin:0;">${data.topProperty.views_count.toLocaleString('ar-EG')} مشاهدة</p>
    </div>` : ''}
    ${btn('📊 فتح لوحة التحكم', `${BASE_URL}/admin`)}
  `);

  await sendEmail(ADMIN_EMAIL, `📊 الملخص اليومي — كيان للعقارات — ${new Date().toLocaleDateString('ar-EG')}`, html);
}

/* ═══════════════════════════════════════════════════════════════════
   7. STALE LEADS ALERT — استفسارات قديمة بدون رد
   ═══════════════════════════════════════════════════════════════════ */
export interface StaleLead {
  name: string; phone: string; propertyTitle?: string | null; hoursAgo: number;
}

export async function sendStaleLeadsAlert(leads: StaleLead[]) {
  if (!leads.length) return;

  const rows = leads.map(l => {
    const waLink = `https://wa.me/${l.phone.replace(/\D/g,'')}`;
    return `<tr style="border-bottom:1px solid #f0ebe0;">
      <td style="padding:10px 8px;font-size:13px;font-weight:600;">${l.name}</td>
      <td style="padding:10px 8px;font-size:13px;"><a href="${waLink}" style="color:#25D366;text-decoration:none;">${l.phone}</a></td>
      <td style="padding:10px 8px;font-size:12px;color:#666;">${l.propertyTitle ?? '—'}</td>
      <td style="padding:10px 8px;font-size:12px;color:#cc4400;font-weight:700;">${l.hoursAgo}h</td>
    </tr>`;
  }).join('');

  const html = wrap(`
    <div style="background:#ffe8e8;border-right:4px solid #cc0000;padding:14px 18px;border-radius:10px;margin-bottom:18px;">
      <p style="margin:0;color:#990000;font-size:14px;font-weight:700;">⚠️ ${leads.length} استفسار بدون رد منذ +24 ساعة</p>
    </div>
    <div style="background:#fff;border-radius:10px;overflow:hidden;margin-bottom:16px;">
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="background:#f5f0e8;">
          <th style="padding:10px 8px;font-size:12px;color:#666;text-align:right;font-weight:600;">الاسم</th>
          <th style="padding:10px 8px;font-size:12px;color:#666;text-align:right;font-weight:600;">الهاتف</th>
          <th style="padding:10px 8px;font-size:12px;color:#666;text-align:right;font-weight:600;">العقار</th>
          <th style="padding:10px 8px;font-size:12px;color:#666;text-align:right;font-weight:600;">منذ</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    ${btn('📋 فتح الاستفسارات الجديدة', `${BASE_URL}/admin/leads?status=NEW`, '#cc0000')}
  `);

  await sendEmail(ADMIN_EMAIL, `⚠️ ${leads.length} استفسار بدون رد — كيان للعقارات`, html);
}

/* ═══════════════════════════════════════════════════════════════════
   8. PROPERTY SUBMISSION — طلب نشر عقار جديد من مالك
   ═══════════════════════════════════════════════════════════════════ */

export async function sendPropertySubmissionNotification(data: {
  property: { title_ar: string; district: string; price: number; type: string };
  ownerName?: string | null;
  ownerPhone?: string | null;
}) {
  const { property, ownerName, ownerPhone } = data;
  const typeLabel = property.type === 'SALE' ? 'بيع' : 'إيجار';
  const waLink = ownerPhone
    ? `https://wa.me/${ownerPhone.replace(/\D/g,'')}?text=${encodeURIComponent(`مرحباً ${ownerName ?? 'أخي'}،\nمن فريق كيان للعقارات — تلقينا طلب نشر عقارك وسنراجعه قريباً.`)}`
    : null;

  const html = wrap(`
    <h2 style="color:#1A2B4A;font-size:18px;font-weight:800;margin:0 0 16px;">🏠 طلب نشر عقار جديد</h2>
    <p style="color:#555;font-size:14px;margin:0 0 16px;">وصل طلب من مالك لإضافة عقار — راجعه وقرر الموافقة أو الرفض.</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      ${row('العقار',    property.title_ar)}
      ${row('المنطقة',  property.district)}
      ${row('النوع',    `للـ${typeLabel}`)}
      ${row('السعر',    `${Number(property.price).toLocaleString('ar-EG')} ج.م`)}
      ${row('المالك',   ownerName ?? '—')}
      ${row('الهاتف',   ownerPhone ? `<span dir="ltr">${ownerPhone}</span>` : '—')}
    </table>
    ${waLink ? btn(`📞 تواصل مع المالك على واتساب`, waLink, '#25D366') : ''}
    ${btn('🔍 مراجعة الطلب في لوحة التحكم', `${BASE_URL}/admin/submissions`, '#1A2B4A')}
  `);

  await sendEmail(ADMIN_EMAIL, `🏠 طلب نشر عقار جديد — ${property.title_ar}`, html);
}

/* ═══════════════════════════════════════════════════════════════════
   9. LISTING APPROVED — إشعار قبول الإعلان لصاحب العقار
   ═══════════════════════════════════════════════════════════════════ */
export async function sendListingApprovedEmail(data: {
  toEmail:       string;
  ownerName?:    string | null;
  propertyTitle: string;
  propertySlug:  string;
}) {
  const { toEmail, ownerName, propertyTitle, propertySlug } = data;
  const propertyUrl = `${BASE_URL}/properties/${propertySlug}`;

  const html = wrap(`
    <div style="background:#e8fff0;border-right:4px solid #00b050;padding:14px 18px;border-radius:10px;margin-bottom:18px;">
      <p style="margin:0;color:#007a38;font-size:14px;font-weight:700;">✅ تمت الموافقة على إعلانك!</p>
    </div>

    <div style="background:#fff;border-radius:12px;padding:28px;text-align:center;margin-bottom:16px;">
      <div style="font-size:48px;margin-bottom:12px;">🎉</div>
      <h2 style="color:#1A2B4A;font-size:20px;margin:0 0 10px;">
        مبروك ${ownerName ? ownerName : ''}!
      </h2>
      <p style="color:#555;font-size:14px;line-height:1.8;margin-bottom:20px;">
        تمت مراجعة إعلانك وقبوله من قِبَل فريق <strong style="color:#B8860B;">كيان للعقارات</strong>.<br>
        إعلانك أصبح الآن ظاهراً للعملاء وسيبقى منشوراً لمدة <strong>30 يوماً</strong>.
      </p>
      <div style="background:#f5f0e8;border-radius:10px;padding:14px 20px;margin-bottom:20px;text-align:right;">
        <p style="margin:0;color:#1A2B4A;font-weight:700;font-size:14px;">🏠 ${propertyTitle}</p>
      </div>
      <a href="${propertyUrl}"
        style="background:#B8860B;color:#fff;padding:14px 32px;border-radius:12px;
        text-decoration:none;font-size:15px;font-weight:700;display:inline-block;">
        عرض إعلانك الآن ←
      </a>
    </div>

    <div style="background:#fff;border-radius:12px;padding:18px;margin-bottom:12px;">
      <p style="color:#1A2B4A;font-weight:700;font-size:13px;margin:0 0 10px;">📋 ماذا يحدث بعد ذلك؟</p>
      ${['🔎 سيتصفح العملاء إعلانك على الموقع',
         '📞 سيتواصل معك مكتب كيان عند وجود عميل مهتم',
         '🤝 نحن نتولى التفاوض والإجراءات نيابةً عنك',
         '✅ العمولة 1% تُدفع فقط عند إتمام الصفقة'
        ].map(t => `<p style="font-size:13px;color:#555;margin:6px 0;">${t}</p>`).join('')}
    </div>

    <div style="text-align:center;">
      <a href="https://wa.me/201000000000"
        style="background:#25D366;color:#fff;padding:12px 24px;border-radius:10px;
        text-decoration:none;font-size:13px;font-weight:700;display:inline-block;">
        📲 تواصل مع المكتب على واتساب
      </a>
    </div>
  `);

  await sendEmail(toEmail, `✅ تمت الموافقة على إعلانك — ${propertyTitle}`, html);
}

/* ═══════════════════════════════════════════════════════════════════
   10. LISTING REJECTED — إشعار رفض الإعلان لصاحب العقار
   ═══════════════════════════════════════════════════════════════════ */
export async function sendListingRejectedEmail(data: {
  toEmail:          string;
  ownerName?:       string | null;
  propertyTitle:    string;
  rejectionReason?: string | null;
}) {
  const { toEmail, ownerName, propertyTitle, rejectionReason } = data;

  const html = wrap(`
    <div style="background:#fff3cd;border-right:4px solid #ffc107;padding:14px 18px;border-radius:10px;margin-bottom:18px;">
      <p style="margin:0;color:#856404;font-size:14px;font-weight:700;">⚠️ بخصوص إعلانك على كيان للعقارات</p>
    </div>

    <div style="background:#fff;border-radius:12px;padding:28px;margin-bottom:16px;">
      <h2 style="color:#1A2B4A;font-size:18px;margin:0 0 14px;">
        مرحباً ${ownerName ? ownerName : ''}،
      </h2>
      <p style="color:#555;font-size:14px;line-height:1.8;margin-bottom:16px;">
        شكراً على تقديم إعلانك في <strong style="color:#B8860B;">كيان للعقارات</strong>.<br>
        بعد مراجعة الإعلان، نأسف لإبلاغك بأنه لم يتم قبوله في الوقت الحالي.
      </p>
      <div style="background:#f5f0e8;border-radius:10px;padding:14px 20px;margin-bottom:16px;">
        <p style="margin:0;color:#1A2B4A;font-weight:700;font-size:13px;">🏠 ${propertyTitle}</p>
      </div>
      ${rejectionReason ? `
      <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:10px;padding:14px 18px;margin-bottom:16px;">
        <p style="margin:0 0 6px;color:#856404;font-weight:700;font-size:12px;">سبب عدم القبول:</p>
        <p style="margin:0;color:#555;font-size:13px;">${rejectionReason}</p>
      </div>` : ''}
      <p style="color:#555;font-size:13px;line-height:1.8;margin:0;">
        يمكنك التواصل معنا مباشرة لمناقشة الأمر أو إعادة تقديم الإعلان بعد التعديل.
      </p>
    </div>

    <div style="text-align:center;">
      <a href="https://wa.me/201000000000"
        style="background:#25D366;color:#fff;padding:13px 28px;border-radius:12px;
        text-decoration:none;font-size:14px;font-weight:700;display:inline-block;">
        📲 تواصل مع فريق كيان
      </a>
    </div>
  `);

  await sendEmail(toEmail, `📋 بخصوص إعلانك — ${propertyTitle}`, html);
}
