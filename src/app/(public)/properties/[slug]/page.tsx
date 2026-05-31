import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyUserSession } from '@/lib/user-auth';
import PropertyGallery from '@/components/properties/property-gallery';
import PropertyDetails from '@/components/properties/property-details';
import PropertyMap from '@/components/properties/property-map';
import LeadForm from '@/components/properties/lead-form';
import SimilarProperties from '@/components/properties/similar-properties';
import SocialShare from '@/components/properties/social-share';
import PropertySchema from '@/components/properties/property-schema';
import Breadcrumb from '@/components/ui/breadcrumb';
import FavoriteButton from '@/components/properties/favorite-button';
import MortgageCalculator from '@/components/properties/mortgage-calculator';
import StickyCTA from '@/components/properties/sticky-cta';
import RecentlyViewed from '@/components/properties/recently-viewed';
import ViewTracker from '@/components/properties/view-tracker';

interface PageProps { params: { slug: string } }

async function getProperty(slug: string) {
  const property = await prisma.property.findUnique({
    where: { slug },
    include: {
      images: { orderBy: [{ is_primary: 'desc' }, { sort_order: 'asc' }] },
      owner: {
        select: {
          id: true, name: true, whatsapp: true,
          facebook_url: true, instagram_url: true,
          tiktok_url: true, youtube_url: true, twitter_url: true,
          notes: true, show_contact: true,
          // phone is intentionally excluded — admin only
        },
      },
    },
  });
  // Don't serve pending/rejected properties publicly
  if (!property || property.listing_status !== 'APPROVED') return null;
  await prisma.property.update({
    where: { id: property.id },
    data: { views_count: { increment: 1 } },
  });
  return property;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const property = await prisma.property.findUnique({
    where: { slug: params.slug },
    include: { images: { where: { is_primary: true }, take: 1 } },
  });
  if (!property) return { title: 'عقار غير موجود' };

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const image = property.images[0]?.url;

  return {
    title: property.title_ar,
    description: property.description_ar?.slice(0, 160) ?? `${property.title_ar} في ${property.district}`,
    openGraph: {
      title: property.title_ar,
      description: property.description_ar?.slice(0, 160) ?? `${property.title_ar} في ${property.district}`,
      url: `${baseUrl}/properties/${property.slug}`,
      images: image ? [{ url: image, alt: property.title_ar }] : [],
      type: 'website',
      locale: 'ar_EG',
    },
    twitter: {
      card: 'summary_large_image',
      title: property.title_ar,
      description: property.description_ar?.slice(0, 160) ?? property.title_ar,
      images: image ? [image] : [],
    },
  };
}

export default async function PropertyPage({ params }: PageProps) {
  const [property, session] = await Promise.all([
    getProperty(params.slug),
    verifyUserSession(),
  ]);

  if (!property) notFound();

  let isSaved = false;
  if (session) {
    const save = await prisma.savedProperty.findUnique({
      where: { user_id_property_id: { user_id: session.userId, property_id: property.id } },
    });
    isSaved = Boolean(save);
  }

  const showOwner = property.owner?.show_contact ?? false;
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '201234567890';

  return (
    <>
      <PropertySchema property={{ ...property, price: Number(property.price) }} />

      {/* Track recently viewed in localStorage */}
      <ViewTracker property={{
        id: property.id,
        title_ar: property.title_ar,
        slug: property.slug,
        price: Number(property.price),
        district: property.district,
        type: property.type,
        primaryImage: property.images[0]?.url,
      }} />

      {/* Sticky mobile CTA */}
      <StickyCTA
        propertyId={property.id}
        propertyTitle={property.title_ar}
        whatsappNumber={whatsapp}
        initialSaved={isSaved}
      />

      <div className="pt-20 min-h-screen bg-background">
        <div className="container-kayan py-8">
          <Breadcrumb items={[
            { label: 'الرئيسية', href: '/' },
            { label: 'العقارات', href: '/properties' },
            { label: property.district, href: `/properties?district=${encodeURIComponent(property.district)}` },
            { label: property.title_ar },
          ]} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              <PropertyGallery images={property.images} title={property.title_ar} />

              <PropertyDetails property={{ ...property, price: Number(property.price) }} />

              {/* Action bar */}
              <div className="flex items-center gap-3">
                <FavoriteButton propertyId={property.id} initialSaved={isSaved} />
                <SocialShare title={property.title_ar} propertyId={property.id} slug={property.slug} />
                <a
                  href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`مرحباً، أريد الاستفسار عن: ${property.title_ar}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1fba58] transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  واتساب
                </a>
              </div>

              {property.lat && property.lng && (
                <PropertyMap lat={property.lat} lng={property.lng} title={property.title_ar} />
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {showOwner && property.owner && (
                <div className="luxury-card p-5">
                  <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gold" />
                    بيانات التواصل
                  </h3>
                  {property.owner.name && (
                    <p className="text-sm text-muted-foreground mb-3">
                      المالك: <strong className="text-foreground">{property.owner.name}</strong>
                    </p>
                  )}
                  <div className="flex flex-col gap-2">
                    {property.owner.whatsapp && (
                      <a href={`https://wa.me/${property.owner.whatsapp}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 text-sm bg-[#25D366] text-white px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity font-medium">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        واتساب المالك
                      </a>
                    )}
                    {property.owner.facebook_url && (
                      <a href={property.owner.facebook_url} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline text-center">فيسبوك</a>
                    )}
                  </div>
                </div>
              )}

              {/* Lead form */}
              <div id="lead-form">
                <LeadForm propertyId={property.id} propertyTitle={property.title_ar} />
              </div>

              {/* Mortgage calculator */}
              <MortgageCalculator propertyPrice={Number(property.price)} />
            </div>
          </div>

          {/* Similar properties */}
          <Suspense fallback={null}>
            <SimilarProperties currentId={property.id} district={property.district} type={property.type} />
          </Suspense>

          {/* Recently viewed */}
          <RecentlyViewed currentId={property.id} />
        </div>
      </div>
    </>
  );
}
