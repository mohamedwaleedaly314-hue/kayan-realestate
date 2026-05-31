/**
 * Unified storage helper
 * - Local dev  → saves to public/uploads/ (no config needed)
 * - Production → uploads to Supabase Storage (set SUPABASE_* env vars)
 */

import { createClient } from '@supabase/supabase-js';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join, dirname } from 'path';

const BUCKET = 'properties';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function uploadImage(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    // ── Supabase Storage ──────────────────────────────────────────────────
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, buffer, { contentType: mimeType, upsert: false });

    if (error) throw new Error(`Supabase upload failed: ${error.message}`);

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    return data.publicUrl;
  }

  // ── Local filesystem (dev fallback) ──────────────────────────────────────
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'properties');
  // Derive the exact directory — handles sub-folders like "submissions/"
  const fileDir   = join(uploadDir, dirname(fileName));
  await mkdir(fileDir, { recursive: true });
  await writeFile(join(uploadDir, fileName), buffer);
  return `/uploads/properties/${fileName}`;
}

export async function deleteImage(url: string): Promise<void> {
  const supabase = getSupabaseAdmin();

  if (supabase && url.includes('supabase')) {
    // Extract file path from Supabase URL
    const parts = url.split(`/${BUCKET}/`);
    if (parts.length === 2) {
      await supabase.storage.from(BUCKET).remove([parts[1]]);
    }
    return;
  }

  // Local file
  if (url.startsWith('/uploads/')) {
    try {
      const filePath = join(process.cwd(), 'public', url);
      await unlink(filePath);
    } catch {
      // File might already be deleted
    }
  }
}
