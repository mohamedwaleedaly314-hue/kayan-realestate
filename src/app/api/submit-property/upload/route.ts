import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_PER_SESSION = 8; // max images per submission

// Simple in-memory IP rate limit (no Redis required)
const uploadCounts = new Map<string, { count: number; reset: number }>();

function checkUploadLimit(ip: string): boolean {
  const now = Date.now();
  const entry = uploadCounts.get(ip);
  if (!entry || entry.reset < now) {
    uploadCounts.set(ip, { count: 1, reset: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= MAX_PER_SESSION) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  if (!checkUploadLimit(ip)) {
    return NextResponse.json(
      { error: 'تجاوزت الحد المسموح به من الصور. حاول بعد ساعة.' },
      { status: 429 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'لم يتم إرسال ملف' }, { status: 400 });

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'نوع الملف غير مدعوم — يُقبل فقط JPEG وPNG وWebP' },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'حجم الصورة يتجاوز 5MB' }, { status: 400 });
  }

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const fileName = `submissions/${uuidv4()}.${ext}`;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const url = await uploadImage(buffer, fileName, file.type);
    return NextResponse.json({ url }, { status: 201 });
  } catch (err) {
    console.error('[SubmitUpload]', err);
    return NextResponse.json({ error: 'فشل رفع الصورة، حاول مرة أخرى' }, { status: 500 });
  }
}
