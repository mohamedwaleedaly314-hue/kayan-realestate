interface PropertySchemaProps {
  property: {
    title_ar: string;
    description_ar?: string | null;
    price: number;
    area_m2: number;
    district: string;
    type: string;
    status: string;
    slug: string;
    images: Array<{ url: string }>;
  };
}

export default function PropertySchema({ property }: PropertySchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title_ar,
    description: property.description_ar ?? property.title_ar,
    url: `${baseUrl}/properties/${property.slug}`,
    image: property.images.map((img) => img.url),
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'EGP',
      availability:
        property.status === 'AVAILABLE'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/SoldOut',
    },
    floorSize: {
      '@type': 'QuantitativeValue',
      value: property.area_m2,
      unitCode: 'MTK',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.district,
      addressRegion: 'مدينة 15 مايو',
      addressCountry: 'EG',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
