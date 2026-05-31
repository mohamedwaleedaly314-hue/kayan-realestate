/**
 * مدينة 15 مايو — المناطق والمجاورات الحقيقية
 */

export interface DistrictGroup {
  label: string;
  districts: string[];
}

// المجاورات الرئيسية 1-36
const mainNeighborhoods = Array.from({ length: 36 }, (_, i) => `مجاورة ${i + 1}`);

// مجاورات امتداد مايو 1-12
const extensionNeighborhoods = Array.from({ length: 12 }, (_, i) => `مجاورة الامتداد ${i + 1}`);

export const districtGroups: DistrictGroup[] = [
  {
    label: 'المجاورات الرئيسية',
    districts: mainNeighborhoods,
  },
  {
    label: 'امتداد مايو',
    districts: [
      'امتداد مايو',
      ...extensionNeighborhoods,
    ],
  },
  {
    label: 'المناطق',
    districts: [
      'المنطقة الأولى',
      'المنطقة الثانية',
      'المنطقة الثالثة',
    ],
  },
];

// قائمة مسطحة لجميع المناطق
export const allDistricts: string[] = districtGroups.flatMap((g) => g.districts);

// للبحث والفلترة
export function matchDistrict(query: string): string[] {
  const q = query.toLowerCase();
  return allDistricts.filter((d) => d.includes(q));
}
