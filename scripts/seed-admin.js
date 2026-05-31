/**
 * seed-admin.js
 * Creates the admin user in the database (needed after PostgreSQL migration).
 * Run: node scripts/seed-admin.js
 *
 * Reads ADMIN_EMAIL and ADMIN_PASSWORD_HASH from .env.local
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Parse .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx === -1) continue;
  const key = trimmed.slice(0, idx).trim();
  const val = trimmed.slice(idx + 1).trim().replace(/^"(.*)"$/, '$1');
  env[key] = val;
}

const prisma = new PrismaClient();

async function main() {
  const email = env.ADMIN_EMAIL || 'admin@kayan.com';
  const hash  = env.ADMIN_PASSWORD_HASH;

  if (!hash) {
    console.error('❌ ADMIN_PASSWORD_HASH not found in .env.local');
    process.exit(1);
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`✅ Admin user already exists: ${email}`);
    return;
  }

  await prisma.adminUser.create({ data: { email, password_hash: hash } });
  console.log(`✅ Admin user created: ${email}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
