/**
 * switch-to-postgres.js
 * Switches Prisma schema from SQLite to PostgreSQL for production deployment.
 * Run: node scripts/switch-to-postgres.js
 */

const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf-8');

if (schema.includes('provider = "postgresql"')) {
  console.log('✅ Already using PostgreSQL — nothing to do.');
  process.exit(0);
}

schema = schema
  .replace('provider = "sqlite"', 'provider = "postgresql"')
  // Add connection pooling for Supabase/Vercel
  .replace(
    'url      = env("DATABASE_URL")',
    'url      = env("DATABASE_URL")\n  directUrl = env("DIRECT_URL")'
  );

fs.writeFileSync(schemaPath, schema, 'utf-8');

console.log('✅ schema.prisma updated to PostgreSQL');
console.log('');
console.log('Next steps:');
console.log('  1. Set DATABASE_URL and DIRECT_URL in your .env.local (Supabase connection strings)');
console.log('  2. Run: npx prisma migrate dev --name init');
console.log('  3. Run: node scripts/seed-admin.js  (to recreate admin user)');
console.log('');
console.log('To switch back to SQLite: node scripts/switch-to-sqlite.js');
