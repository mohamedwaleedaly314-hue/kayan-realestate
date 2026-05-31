export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatPrice, formatArea, getPropertyTypeLabel, getPropertyStatusLabel, formatDate } from '@/lib/utils';
import Image from 'next/image';
import { MapPin, Maximize2, BedDouble, Layers, CheckCircle2, Calendar, Clock, Phone } from 'lucide-react';
import PrintButton from './PrintButton';
import PrintStyles from './PrintStyles';

async function getProperty(slug: string) {
  const p = await prisma.property.findUnique({
    where: { slug, listing_status: 'APPROVED' },
    include: {
      images: { orderBy: [{ is_primary: 'desc' }, { sort_order: 'asc' }], take: 6 },
    },
  });
  return p;
}

export default async function PropertyPrintPage({ params }: { params: { slug: string } }) {
  const property = await getProperty(params.slug);
  if (!property) notFound();

  const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const typeLabel   = getPropertyTypeLabel(property.type);
  const statusLabel = getPropertyStatusLabel(property.status);
  const days = property.viewing_days
    ? (() => { try { return JSON.parse(property.viewing_days); } catch { return []; } })()
    : [];

  return (
    <div className="print-page bg-white min-h-screen" dir="rtl">
      {/* Print trigger button - hidden in print */}
      <div className="no-print fixed top-4 left-4 z-50 flex gap-2">
        <PrintButton />
        <a href={`/properties/${params.slug}`}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">
          ← رجوع
        </a>
      </div>

      <div className="max-w-[794px] mx-auto p-8">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-[#B8860B]">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${BASE_URL}/logo-kayan.png`} alt="كيان" width={64} height={64} className="object-contain" />
            <div>
              <h2 className="text-2xl font-extrabold text-[#1A2B4A] tracking-wide">كيان للعقارات</h2>
              <p className="text-sm text-gray-500">كيان | اختيارك الصح — مدينة 15 مايو</p>
            </div>
          </div>
          <div className="text-left">
            <span className="inline-block bg-[#B8860B] text-white text-sm font-bold px-4 py-1.5 rounded-full">
              {typeLabel}
            </span>
            <p className="text-xs text-gray-400 mt-1">{formatDate(property.created_at)}</p>
          </div>
        </div>

        {/* ── Primary Image ── */}
        {property.images[0] && (
          <div className="relative w-full h-72 rounded-2xl overflow-hidden mb-6">
            <Image src={property.images[0].url} alt={property.title_ar} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-4 right-4">
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                property.status === 'AVAILABLE' ? 'bg-emerald-500 text-white'
                : property.status === 'SOLD'    ? 'bg-red-500 text-white'
                : 'bg-amber-500 text-white'
              }`}>{statusLabel}</span>
            </div>
          </div>
        )}

        {/* ── Title & Location ── */}
        <h1 className="text-2xl font-bold text-[#1A2B4A] mb-2">{property.title_ar}</h1>
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
          <MapPin className="w-4 h-4 text-[#B8860B]" />
          {property.district} — مدينة 15 مايو، القاهرة
        </div>

        {/* ── Price ── */}
        <div className="bg-[#1A2B4A] rounded-2xl p-5 mb-6 text-center">
          <p className="text-sm text-gray-300 mb-1">السعر</p>
          <p className="text-4xl font-extrabold text-[#B8860B]">{formatPrice(Number(property.price))}</p>
          <p className="text-xs text-gray-400 mt-1">
            {Number(property.area_m2) > 0 && `${Math.round(Number(property.price) / Number(property.area_m2)).toLocaleString('ar-EG')} ج.م / م²`}
          </p>
        </div>

        {/* ── Specs Grid ── */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
            <Maximize2 className="w-5 h-5 mx-auto text-[#B8860B] mb-2" />
            <p className="text-xs text-gray-500">المساحة</p>
            <p className="font-bold text-[#1A2B4A]">{formatArea(Number(property.area_m2))}</p>
          </div>
          {property.rooms != null && (
            <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
              <BedDouble className="w-5 h-5 mx-auto text-[#B8860B] mb-2" />
              <p className="text-xs text-gray-500">الغرف</p>
              <p className="font-bold text-[#1A2B4A]">{property.rooms} غرف</p>
            </div>
          )}
          {property.floor != null && (
            <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
              <Layers className="w-5 h-5 mx-auto text-[#B8860B] mb-2" />
              <p className="text-xs text-gray-500">الطابق</p>
              <p className="font-bold text-[#1A2B4A]">طابق {property.floor}</p>
            </div>
          )}
          <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
            <CheckCircle2 className={`w-5 h-5 mx-auto mb-2 ${property.has_elevator ? 'text-emerald-500' : 'text-gray-300'}`} />
            <p className="text-xs text-gray-500">مصعد</p>
            <p className="font-bold text-[#1A2B4A]">{property.has_elevator ? 'يوجد' : 'لا يوجد'}</p>
          </div>
        </div>

        {/* ── Description ── */}
        {property.description_ar && (
          <div className="mb-6">
            <h3 className="font-bold text-[#1A2B4A] text-base mb-3 pb-2 border-b border-gray-200">وصف العقار</h3>
            <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">{property.description_ar}</p>
          </div>
        )}

        {/* ── Viewing Schedule ── */}
        {(days.length > 0 || property.viewing_time_from) && (
          <div className="mb-6 p-4 border border-[#B8860B]/30 rounded-xl bg-amber-50/50">
            <h3 className="font-bold text-[#1A2B4A] text-sm mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#B8860B]" /> مواعيد المعاينة
            </h3>
            {days.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {days.map((d: string) => (
                  <span key={d} className="px-3 py-1 bg-[#B8860B]/10 text-[#B8860B] border border-[#B8860B]/25 rounded-full text-xs font-semibold">{d}</span>
                ))}
              </div>
            )}
            {(property.viewing_time_from || property.viewing_time_to) && (
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#B8860B]" />
                {property.viewing_time_from && `من ${property.viewing_time_from}`}
                {property.viewing_time_to   && ` حتى ${property.viewing_time_to}`}
              </p>
            )}
          </div>
        )}

        {/* ── Extra Images ── */}
        {property.images.length > 1 && (
          <div className="mb-6">
            <h3 className="font-bold text-[#1A2B4A] text-base mb-3 pb-2 border-b border-gray-200">صور إضافية</h3>
            <div className="grid grid-cols-3 gap-2">
              {property.images.slice(1, 7).map((img, i) => (
                <div key={i} className="relative aspect-video rounded-xl overflow-hidden">
                  <Image src={img.url} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="mt-8 pt-6 border-t-2 border-[#B8860B] flex items-center justify-between">
          <div>
            <p className="font-bold text-[#1A2B4A]">كيان للعقارات</p>
            <p className="text-xs text-gray-500">مدينة 15 مايو — القاهرة</p>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4 text-[#B8860B]" />
              <span>التواصل عبر المكتب فقط</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">جميع الاستفسارات عبر كيان للعقارات</p>
          </div>
        </div>

        {/* QR / URL */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">لعرض العقار أون لاين: {BASE_URL}/properties/{params.slug}</p>
        </div>
      </div>

      <PrintStyles />
    </div>
  );
}
