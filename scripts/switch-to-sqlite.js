/**
 * switch-to-sqlite.js
 * Switches Prisma schema back to SQLite for local development.
 * Run: node scripts/switch-to-sqlite.js
 */

const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf-8');

if (schema.includes('provider = "sqlite"')) {
  console.log('✅ Already using SQLite — nothing to do.');
  process.exit(0);
}

schema = schema
  .replace('provider = "postgresql"', 'provider = "sqlite"')
  .replace('\n  directUrl = env("DIRECT_URL")', '');

fs.writeFileSync(schemaPath, schema, 'utf-8');

console.log('✅ schema.prisma switched back to SQLite');
console.log('');
console.log('Next steps:');
console.log('  1. Make sure DATABASE_URL=file:./dev.db in .env.local');
console.log('  2. Run: npx prisma db push');
console.log('  3. Run: npm run dev');
