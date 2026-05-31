# كيان للعقارات — دليل الإعداد

## 1. إعداد Supabase

1. أنشئ مشروعاً جديداً على [supabase.com](https://supabase.com)
2. اذهب إلى **Storage** وأنشئ bucket باسم `property-images` (Public)
3. احفظ:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon Key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Service Role Key → `SUPABASE_SERVICE_ROLE_KEY`
   - Database Password → لاستخدامه في `DATABASE_URL`

### Storage Policy
في Supabase → Storage → property-images → Policies:
- **SELECT**: `true` (public read)
- **INSERT**: `(auth.role() = 'service_role')` (only service role writes)

## 2. إعداد Upstash Redis (Rate Limiting)

1. أنشئ قاعدة بيانات على [upstash.com](https://upstash.com)
2. احفظ:
   - REST URL → `UPSTASH_REDIS_REST_URL`
   - REST Token → `UPSTASH_REDIS_REST_TOKEN`

## 3. إعداد Google Maps API

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com)
2. فعّل **Maps Embed API** و**Maps JavaScript API**
3. أنشئ API Key → `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

## 4. إعداد ملف .env.local

```bash
cp .env.example .env.local
# عبئ جميع القيم
```

### توليد NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### توليد ADMIN_PASSWORD_HASH:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('كلمة_المرور_هنا', 12).then(h => console.log(h))"
```

## 5. إعداد قاعدة البيانات

```bash
# Push schema to Supabase
npm run db:push

# Or run migrations
npm run db:migrate

# Seed initial data (admin user + sample properties)
npx tsx prisma/seed.ts
```

## 6. تشغيل المشروع

```bash
npm run dev
```

ثم افتح:
- الموقع: http://localhost:3000
- الأدمن: http://localhost:3000/admin/login
  - Email: admin@kayan-realestate.com
  - Password: Admin@123456 (غيّرها فوراً!)

## 7. النشر على Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

تأكد من إضافة جميع environment variables في Vercel Dashboard.
