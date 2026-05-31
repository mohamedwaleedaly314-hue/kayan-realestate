import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const property = await prisma.property.findUnique({
    where: { id: params.id, listing_status: 'APPROVED' },
    select: {
      title_ar: true, price: true, area_m2: true,
      district: true, type: true, rooms: true,
      images: { where: { is_primary: true }, take: 1, select: { url: true } },
    },
  });

  if (!property) return new Response('Not found', { status: 404 });

  const typeLabel  = property.type === 'SALE' ? 'للبيع' : 'للإيجار';
  const priceStr   = Number(property.price).toLocaleString('ar-EG') + ' ج.م';
  const areaStr    = property.area_m2 + ' م²';
  const imgUrl     = property.images[0]?.url ?? null;
  const BASE_URL   = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const logoUrl    = `${BASE_URL}/logo-kayan.png`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px', height: '630px',
          background: 'linear-gradient(135deg, #0d1829 0%, #1A2B4A 60%, #0f1d33 100%)',
          display: 'flex', fontFamily: 'serif',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Gold accent line top */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'linear-gradient(90deg, #B8860B, #D4A017, #B8860B)' }} />

        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(184,134,11,0.08)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(184,134,11,0.06)' }} />

        {/* Left: Property Image */}
        {imgUrl && (
          <div style={{ width: '480px', height: '630px', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(13,24,41,0) 60%, #1A2B4A 100%)' }} />
            {/* Type badge */}
            <div style={{
              position: 'absolute', top: '24px', right: '24px',
              background: '#B8860B', color: 'white',
              padding: '8px 20px', borderRadius: '30px',
              fontSize: '22px', fontWeight: 'bold',
            }}>
              {typeLabel}
            </div>
          </div>
        )}

        {/* Right: Details */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          padding: imgUrl ? '48px 48px 48px 36px' : '48px 56px',
          justifyContent: 'space-between',
          direction: 'rtl',
        }}>
          {/* Logo area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt="كيان" style={{ width: '52px', height: '52px', objectFit: 'contain' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#B8860B', fontSize: '22px', fontWeight: 'bold', letterSpacing: '2px' }}>كيان للعقارات</span>
              <span style={{ color: '#8a9bb5', fontSize: '13px' }}>كيان | اختيارك الصح</span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: '60px', height: '3px', background: '#B8860B', borderRadius: '2px', margin: '8px 0 16px' }} />

          {/* Title */}
          <div style={{ color: 'white', fontSize: imgUrl ? '30px' : '36px', fontWeight: 'bold', lineHeight: 1.4, marginBottom: '8px' }}>
            {property.title_ar.length > 60 ? property.title_ar.slice(0, 57) + '...' : property.title_ar}
          </div>

          {/* District */}
          <div style={{ color: '#8a9bb5', fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📍 {property.district} — مدينة 15 مايو
          </div>

          {/* Price */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ color: '#8a9bb5', fontSize: '14px', marginBottom: '4px' }}>السعر</div>
            <div style={{ color: '#B8860B', fontSize: '40px', fontWeight: 'bold' }}>{priceStr}</div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 20px', textAlign: 'center', border: '1px solid rgba(184,134,11,0.25)' }}>
              <div style={{ color: '#B8860B', fontSize: '22px', fontWeight: 'bold' }}>{areaStr}</div>
              <div style={{ color: '#8a9bb5', fontSize: '13px' }}>المساحة</div>
            </div>
            {property.rooms && (
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 20px', textAlign: 'center', border: '1px solid rgba(184,134,11,0.25)' }}>
                <div style={{ color: '#B8860B', fontSize: '22px', fontWeight: 'bold' }}>{property.rooms}</div>
                <div style={{ color: '#8a9bb5', fontSize: '13px' }}>غرف</div>
              </div>
            )}
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 20px', textAlign: 'center', border: '1px solid rgba(184,134,11,0.25)' }}>
              <div style={{ color: '#B8860B', fontSize: '22px', fontWeight: 'bold' }}>{typeLabel}</div>
              <div style={{ color: '#8a9bb5', fontSize: '13px' }}>النوع</div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(184,134,11,0.2)', paddingTop: '16px' }}>
            <span style={{ color: '#8a9bb5', fontSize: '14px' }}>🌐 kayan-realestate.com</span>
            <span style={{ color: '#8a9bb5', fontSize: '14px' }}>📞 تواصل معنا عبر واتساب</span>
          </div>
        </div>

        {/* No image fallback: type badge */}
        {!imgUrl && (
          <div style={{
            position: 'absolute', top: '48px', left: '56px',
            background: '#B8860B', color: 'white',
            padding: '10px 24px', borderRadius: '30px',
            fontSize: '20px', fontWeight: 'bold',
          }}>
            {typeLabel}
          </div>
        )}
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
