import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { uploadImage } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

export const maxDuration = 30;

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) return NextResponse.json({ error: 'لم يتم رفع ملف' }, { status: 400 });

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'نوع الملف غير مدعوم. يُسمح فقط بـ JPEG وPNG وWebP' },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'حجم الملف يتجاوز 5MB' }, { status: 400 });
  }

  const ext = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp';
  const fileName = `${uuidv4()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const url = await uploadImage(buffer, fileName, file.type);
    return NextResponse.json({ url }, { status: 201 });
  } catch (err) {
    console.error('[Upload]', err);
    return NextResponse.json({ error: 'فشل رفع الملف، حاول مرة أخرى' }, { status: 500 });
  }
}
