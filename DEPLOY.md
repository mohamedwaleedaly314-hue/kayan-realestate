# دليل النشر على Production — كيان للعقارات

## المتطلبات
- حساب Supabase (مجاني) — قاعدة البيانات + تخزين الصور
- حساب Vercel (مجاني) — استضافة الموقع
- حساب Resend (مجاني) — إشعارات الإيميل
- حساب Upstash (مجاني) — Rate Limiting

---

## الخطوة 1 — Supabase (قاعدة البيانات + الصور)

### 1.1 إنشاء المشروع
1. اذهب إلى https://supabase.com وأنشئ حساباً
2. اضغط **New Project** — اختر اسم واكتب كلمة مرور قوية
3. انتظر دقيقة حتى يتهيأ المشروع

### 1.2 الحصول على Connection Strings
1. اذهب إلى **Project Settings → Database → Connection string**
2. اختر **Transaction** → انسخ الـ URL (ده هيبقى DATABASE_URL)
3. اختر **Session** → انسخ الـ URL (ده هيبقى DIRECT_URL)

### 1.3 الحصول على API Keys
1. اذهب إلى **Project Settings → API**
2. انسخ **Project URL** → ده `NEXT_PUBLIC_SUPABASE_URL`
3. انسخ **anon public** → ده `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. انسخ **service_role** → ده `SUPABASE_SERVICE_ROLE_KEY`

### 1.4 إنشاء Storage Bucket
1. اذهب إلى **Storage → New Bucket**
2. الاسم: `properties`
3. اجعله **Public bucket** ✓
4. اضغط **Create bucket**
5. اذهب إلى **Policies** واضغط **New Policy → For full customization**:
   - اسمح لـ `anon` بـ `SELECT` (عشان الصور تظهر للزوار)
   - اسمح لـ `service_role` بـ `INSERT, UPDATE, DELETE`

---

## الخطوة 2 — تحديث قاعدة البيانات

```bash
# على جهازك — تحويل Schema لـ PostgreSQL
npm run deploy:use-postgres

# تحديث .env.local بالـ Connection Strings من Supabase
# ثم:
npx prisma migrate dev --name init

# إنشاء Admin User في الـ DB الجديدة
npm run db:seed-admin
```

---

## الخطوة 3 — Resend (الإيميلات)

1. اذهب إلى https://resend.com وأنشئ حساباً مجاناً
2. اذهب إلى **API Keys → Create API Key**
3. انسخ المفتاح → ده `RESEND_API_KEY`
4. أضف Domain (اختياري للبداية — بدونه ترسل من `onboarding@resend.dev`)

---

## الخطوة 4 — Upstash Redis (Rate Limiting)

1. اذهب إلى https://upstash.com وأنشئ حساباً
2. اضغط **Create Database** → اختر **Global** وأقرب Region
3. من **Details**، انسخ:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

---

## الخطوة 5 — Vercel (الاستضافة)

### 5.1 رفع الكود
```bash
# تأكد إن الكود على GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/kayan-realestate.git
git push -u origin main
```

### 5.2 ربط Vercel
1. اذهب إلى https://vercel.com
2. اضغط **New Project** → اختر الـ Repository
3. Framework: **Next.js** (auto-detected)
4. اضغط **Deploy** (هيفشل في البداية بدون env vars)

### 5.3 إضافة Environment Variables
في Vercel: **Project → Settings → Environment Variables** — أضف كل المتغيرات:

| Variable | القيمة |
|---|---|
| `DATABASE_URL` | Transaction connection string من Supabase |
| `DIRECT_URL` | Session connection string من Supabase |
| `NEXTAUTH_SECRET` | نفس قيمة `.env.local` |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` |
| `ADMIN_EMAIL` | `admin@kayan.com` |
| `ADMIN_PASSWORD_HASH` | نفس الـ hash من `.env.local` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | رقم الواتساب |
| `NEXT_PUBLIC_SUPABASE_URL` | من Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | من Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | من Supabase |
| `RESEND_API_KEY` | من Resend |
| `EMAIL_FROM` | `كيان للعقارات <noreply@yourdomain.com>` |
| `UPSTASH_REDIS_REST_URL` | من Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | من Upstash |

### 5.4 إعادة الـ Deploy
بعد إضافة المتغيرات: **Deployments → Redeploy**

---

## الخطوة 6 — بعد النشر

```bash
# تأكد من إنشاء admin user في الـ DB الجديدة
# (من جهازك بالـ DIRECT_URL في .env.local)
npm run db:seed-admin
```

### اختبر:
- [ ] فتح الموقع والتصفح
- [ ] تسجيل مستخدم جديد وتلقي Welcome Email
- [ ] تسجيل دخول Admin على `/admin`
- [ ] إضافة عقار مع صورة (تتحمّل على Supabase Storage)
- [ ] إرسال استفسار وتلقي إشعار إيميل
- [ ] اختبار على موبايل

---

## تحديث الـ Domain لاحقاً
1. اشتر Domain من Namecheap / GoDaddy / أي registrar
2. في Vercel: **Project → Settings → Domains → Add Domain**
3. حدّث `NEXTAUTH_URL` بالـ domain الجديد
4. حدّث `EMAIL_FROM` بنفس الـ domain

---

## الرجوع للـ Local Dev
```bash
npm run deploy:use-sqlite
# تأكد إن DATABASE_URL=file:./dev.db في .env.local
npm run dev
```
