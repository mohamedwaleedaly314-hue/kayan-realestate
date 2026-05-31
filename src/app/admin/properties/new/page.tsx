import type { Metadata } from 'next';
import PropertyForm from '@/components/admin/property-form';

export const metadata: Metadata = { title: 'إضافة عقار جديد' };

export default function NewPropertyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">إضافة عقار جديد</h1>
        <p className="text-muted-foreground text-sm mt-1">أدخل بيانات العقار الجديد</p>
      </div>
      <PropertyForm />
    </div>
  );
}
