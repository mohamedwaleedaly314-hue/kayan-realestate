import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const adminEmail = 'admin@kayan.com';
  const adminPassword = 'Kayan@Admin2024';

  const existing = await prisma.adminUser.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hash = await bcrypt.hash(adminPassword, 12);
    await prisma.adminUser.create({ data: { email: adminEmail, password_hash: hash } });
    console.log(`✅ Admin: ${adminEmail} / ${adminPassword}`);
  }

  // Sample properties
  const props = [
    {
      title_ar: 'شقة 3 غرف للبيع في الحي الثالث',
      slug: 'apartment-3-rooms-district-3',
      description_ar: 'شقة واسعة بمساحة 120 متر مربع في الحي الثالث بمدينة 15 مايو. تتميز بالموقع المتميز والتشطيب الراقي. تشمل 3 غرف نوم وصالة معيشة ومطبخ أمريكي وحمامين. الطابق الثالث.',
      price: 1500000,
      area_m2: 120,
      rooms: 3,
      floor: 3,
      has_elevator: false,
      type: 'SALE',
      status: 'AVAILABLE',
      district: 'الحي الثالث',
      featured: true,
      lat: 29.858,
      lng: 31.258,
    },
    {
      title_ar: 'شقة مفروشة للإيجار في الحي الأول',
      slug: 'furnished-apartment-district-1',
      description_ar: 'شقة مفروشة بالكامل للإيجار في الحي الأول. مساحة 90 متر، غرفتين نوم، صالة، مطبخ مجهز، حمام. موقع مركزي ومطل على شارع رئيسي.',
      price: 8000,
      area_m2: 90,
      rooms: 2,
      floor: 2,
      has_elevator: true,
      type: 'RENT',
      status: 'AVAILABLE',
      district: 'الحي الأول',
      featured: true,
      lat: 29.861,
      lng: 31.255,
    },
    {
      title_ar: 'دوبلكس فاخر 4 غرف للبيع',
      slug: 'luxury-duplex-4-rooms',
      description_ar: 'دوبلكس فاخر على طابقين بمساحة 220 متر. 4 غرف نوم، صالتين، مطبخ ضخم، 3 حمامات، تراس واسع. تشطيبات عالية الجودة.',
      price: 3500000,
      area_m2: 220,
      rooms: 4,
      floor: 4,
      has_elevator: true,
      type: 'SALE',
      status: 'AVAILABLE',
      district: 'الحي السادس',
      featured: true,
    },
    {
      title_ar: 'محل تجاري للإيجار في وسط المدينة',
      slug: 'commercial-shop-downtown',
      description_ar: 'محل تجاري بموقع استراتيجي في وسط مدينة 15 مايو. مساحة 60 متر، واجهة زجاجية، مناسب لجميع النشاطات التجارية.',
      price: 15000,
      area_m2: 60,
      rooms: null,
      floor: 0,
      has_elevator: false,
      type: 'RENT',
      status: 'AVAILABLE',
      district: 'وسط المدينة',
      featured: false,
    },
    {
      title_ar: 'شقة 2 غرف للبيع بالحي الخامس',
      slug: 'apartment-2-rooms-district-5',
      description_ar: 'شقة 2 غرف نوم بمساحة 85 متر في الحي الخامس. بها بلكونة وإطلالة جميلة. تشطيب جيد.',
      price: 950000,
      area_m2: 85,
      rooms: 2,
      floor: 1,
      has_elevator: false,
      type: 'SALE',
      status: 'RESERVED',
      district: 'الحي الخامس',
      featured: false,
    },
    {
      title_ar: 'فيلا 5 غرف للبيع',
      slug: 'villa-5-rooms',
      description_ar: 'فيلا مستقلة فاخرة بمساحة 350 متر على أرض 500 متر. 5 غرف نوم، حديقة خاصة، جراج، تشطيبات سوبر لوكس.',
      price: 8500000,
      area_m2: 350,
      rooms: 5,
      floor: 2,
      has_elevator: false,
      type: 'SALE',
      status: 'AVAILABLE',
      district: 'الحي العاشر',
      featured: true,
    },
  ];

  for (const p of props) {
    const e = await prisma.property.findUnique({ where: { slug: p.slug } });
    if (!e) {
      await prisma.property.create({ data: p });
      console.log(`✅ ${p.title_ar}`);
    }
  }

  // Sample leads
  const leadsData = [
    { name: 'أحمد محمد', phone: '01012345678', message: 'أريد الاستفسار عن الشقة في الحي الثالث', source: 'WEBSITE', status: 'NEW' },
    { name: 'سارة علي', phone: '01098765432', message: 'هل الشقة المفروشة متاحة؟', source: 'WEBSITE', status: 'CONTACTED' },
    { name: 'محمد حسن', phone: '01123456789', message: 'أريد معرفة السعر النهائي للدوبلكس', source: 'WEBSITE', status: 'NEW' },
  ];

  const allLeads = await prisma.lead.count();
  if (allLeads === 0) {
    for (const l of leadsData) {
      await prisma.lead.create({ data: l });
    }
    console.log('✅ Sample leads created');
  }

  console.log('\n✨ Seed done!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🌐 Site:  http://localhost:3000');
  console.log('🔐 Admin: http://localhost:3000/admin/login');
  console.log('   Email: admin@kayan.com');
  console.log('   Pass:  Kayan@Admin2024');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
