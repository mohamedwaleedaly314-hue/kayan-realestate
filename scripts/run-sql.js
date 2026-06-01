const { Client } = require('pg');

const SQL = `
CREATE TABLE IF NOT EXISTS "Property" (
    "id" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description_ar" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "area_m2" DOUBLE PRECISION NOT NULL,
    "rooms" INTEGER,
    "floor" INTEGER,
    "has_elevator" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL DEFAULT 'SALE',
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "district" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listing_status" TEXT NOT NULL DEFAULT 'APPROVED',
    "rejection_reason" TEXT,
    "viewing_days" TEXT,
    "viewing_time_from" TEXT,
    "viewing_time_to" TEXT,
    "is_free_listing" BOOLEAN NOT NULL DEFAULT false,
    "free_listing_until" TIMESTAMP(3),
    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PropertyImage" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt_text" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PropertyImage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PropertyOwner" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "whatsapp" TEXT,
    "facebook_url" TEXT,
    "instagram_url" TEXT,
    "tiktok_url" TEXT,
    "youtube_url" TEXT,
    "twitter_url" TEXT,
    "notes" TEXT,
    "show_contact" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PropertyOwner_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Lead" (
    "id" TEXT NOT NULL,
    "property_id" TEXT,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "message" TEXT,
    "source" TEXT NOT NULL DEFAULT 'WEBSITE',
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "admin_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SearchAlert" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "email" TEXT NOT NULL,
    "type" TEXT,
    "district" TEXT,
    "min_price" DOUBLE PRECISION,
    "max_price" DOUBLE PRECISION,
    "rooms" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SearchAlert_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "district" TEXT,
    "password_hash" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SavedProperty" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedProperty_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SearchHistory" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "filters" TEXT,
    "results" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PropertyRequest" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "type" TEXT NOT NULL DEFAULT 'SALE',
    "district" TEXT,
    "min_price" DOUBLE PRECISION,
    "max_price" DOUBLE PRECISION,
    "rooms" INTEGER,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PropertyRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Review" (
    "id" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "deal_type" TEXT,
    "district" TEXT,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "Property_slug_key" ON "Property"("slug");
CREATE INDEX IF NOT EXISTS "Property_status_idx" ON "Property"("status");
CREATE INDEX IF NOT EXISTS "Property_type_idx" ON "Property"("type");
CREATE INDEX IF NOT EXISTS "Property_district_idx" ON "Property"("district");
CREATE INDEX IF NOT EXISTS "Property_featured_idx" ON "Property"("featured");
CREATE INDEX IF NOT EXISTS "Property_status_type_idx" ON "Property"("status", "type");
CREATE INDEX IF NOT EXISTS "Property_status_featured_created_at_idx" ON "Property"("status", "featured", "created_at");
CREATE INDEX IF NOT EXISTS "Property_views_count_idx" ON "Property"("views_count");
CREATE INDEX IF NOT EXISTS "Property_created_at_idx" ON "Property"("created_at");
CREATE INDEX IF NOT EXISTS "Property_listing_status_idx" ON "Property"("listing_status");
CREATE INDEX IF NOT EXISTS "PropertyImage_property_id_is_primary_idx" ON "PropertyImage"("property_id", "is_primary");
CREATE UNIQUE INDEX IF NOT EXISTS "PropertyOwner_property_id_key" ON "PropertyOwner"("property_id");
CREATE INDEX IF NOT EXISTS "PropertyOwner_user_id_idx" ON "PropertyOwner"("user_id");
CREATE INDEX IF NOT EXISTS "Lead_status_idx" ON "Lead"("status");
CREATE INDEX IF NOT EXISTS "Lead_created_at_idx" ON "Lead"("created_at");
CREATE INDEX IF NOT EXISTS "SearchAlert_is_active_idx" ON "SearchAlert"("is_active");
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE INDEX IF NOT EXISTS "SavedProperty_user_id_idx" ON "SavedProperty"("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "SavedProperty_user_id_property_id_key" ON "SavedProperty"("user_id", "property_id");
CREATE INDEX IF NOT EXISTS "SearchHistory_user_id_idx" ON "SearchHistory"("user_id");
CREATE INDEX IF NOT EXISTS "PropertyRequest_status_idx" ON "PropertyRequest"("status");
CREATE INDEX IF NOT EXISTS "PropertyRequest_created_at_idx" ON "PropertyRequest"("created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "AdminUser_email_key" ON "AdminUser"("email");
CREATE INDEX IF NOT EXISTS "Review_is_approved_idx" ON "Review"("is_approved");
CREATE INDEX IF NOT EXISTS "Review_is_featured_idx" ON "Review"("is_featured");
CREATE INDEX IF NOT EXISTS "Review_created_at_idx" ON "Review"("created_at");
CREATE INDEX IF NOT EXISTS "Notification_user_id_is_read_idx" ON "Notification"("user_id", "is_read");
CREATE INDEX IF NOT EXISTS "Notification_created_at_idx" ON "Notification"("created_at");

-- Foreign Keys
ALTER TABLE "PropertyImage" ADD CONSTRAINT "PropertyImage_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PropertyOwner" ADD CONSTRAINT "PropertyOwner_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PropertyOwner" ADD CONSTRAINT "PropertyOwner_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SearchAlert" ADD CONSTRAINT "SearchAlert_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SavedProperty" ADD CONSTRAINT "SavedProperty_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SavedProperty" ADD CONSTRAINT "SavedProperty_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SearchHistory" ADD CONSTRAINT "SearchHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PropertyRequest" ADD CONSTRAINT "PropertyRequest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Admin user
INSERT INTO "AdminUser" ("id", "email", "password_hash", "created_at")
VALUES ('admin-kayan-001', 'mohamedwaleedaly314@gmail.com', '$2a$12$/XxMOAINMfydRxIlLLl6DO/0oJwzDzdF//LJPQN1FEMda7G91gQjW', NOW())
ON CONFLICT ("email") DO NOTHING;
`;

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase...');
    await client.connect();
    console.log('Connected! Running SQL...');
    await client.query(SQL);
    console.log('✅ All tables created successfully!');

    const res = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`);
    console.log('Tables created:', res.rows.map(r => r.table_name).join(', '));
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}

main();
