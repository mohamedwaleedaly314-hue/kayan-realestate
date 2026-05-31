'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search, Edit, Trash2, Star, ChevronRight, ChevronLeft,
  Eye, Check, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatPrice, getPropertyTypeLabel, getPropertyStatusLabel } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Property {
  id: string;
  title_ar: string;
  slug: string;
  price: number;
  type: string;
  status: string;
  district: string;
  featured: boolean;
  views_count: number;
  created_at: Date;
  images: Array<{ url: string; is_primary: boolean }>;
  _count: { leads: number };
}

interface PropertiesTableProps {
  properties: Property[];
  total: number;
  page: number;
  pageSize: number;
  searchParams: Record<string, string | undefined>;
}

export default function AdminPropertiesTable({
  properties, total, page, pageSize, searchParams,
}: PropertiesTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const totalPages = Math.ceil(total / pageSize);

  function buildUrl(params: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const merged = { ...searchParams, ...params };
    Object.entries(merged).forEach(([k, v]) => { if (v) p.set(k, v); });
    return `/admin/properties?${p.toString()}`;
  }

  async function handleDelete(id: string) {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/properties/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('تم حذف العقار بنجاح');
      router.refresh();
    } catch {
      toast.error('فشل حذف العقار');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  }

  async function toggleFeatured(id: string, current: boolean) {
    try {
      const res = await fetch(`/api/admin/properties/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !current }),
      });
      if (!res.ok) throw new Error();
      toast.success(current ? 'إلغاء التمييز' : 'تم تمييز العقار');
      router.refresh();
    } catch {
      toast.error('حدث خطأ');
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters bar */}
      <div className="bg-card rounded-2xl border border-border p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالعنوان أو الـ slug..."
            defaultValue={searchParams.search ?? ''}
            onChange={(e) => {
              if (e.target.value.length === 0 || e.target.value.length >= 2) {
                router.push(buildUrl({ search: e.target.value || undefined, page: '1' }));
              }
            }}
            className="pr-9"
          />
        </div>

        <select
          value={searchParams.status ?? ''}
          onChange={(e) => router.push(buildUrl({ status: e.target.value || undefined, page: '1' }))}
          className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
        >
          <option value="">جميع الحالات</option>
          <option value="AVAILABLE">متاح</option>
          <option value="SOLD">مباع</option>
          <option value="RESERVED">محجوز</option>
        </select>

        <select
          value={searchParams.type ?? ''}
          onChange={(e) => router.push(buildUrl({ type: e.target.value || undefined, page: '1' }))}
          className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
        >
          <option value="">جميع الأنواع</option>
          <option value="SALE">للبيع</option>
          <option value="RENT">للإيجار</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-right px-4 py-3 font-semibold text-foreground">العقار</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">النوع / الحالة</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">السعر</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">المنطقة</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">المشاهدات</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">الليدز</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">مميز</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {properties.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground">
                    لا توجد عقارات
                  </td>
                </tr>
              )}
              {properties.map((property) => {
                const primaryImage = property.images[0];
                return (
                  <tr key={property.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {primaryImage ? (
                          <div className="relative w-12 h-10 rounded-lg overflow-hidden shrink-0">
                            <Image src={primaryImage.url} alt={property.title_ar} fill className="object-cover" sizes="48px" />
                          </div>
                        ) : (
                          <div className="w-12 h-10 rounded-lg bg-muted shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate max-w-[180px]">{property.title_ar}</p>
                          <p className="text-xs text-muted-foreground">{property.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <Badge variant={property.type === 'SALE' ? 'sale' : 'rent'} className="w-fit">
                          {getPropertyTypeLabel(property.type)}
                        </Badge>
                        <Badge
                          variant={property.status === 'AVAILABLE' ? 'available' : property.status === 'SOLD' ? 'sold' : 'reserved'}
                          className="w-fit"
                        >
                          {getPropertyStatusLabel(property.status)}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gold">{formatPrice(property.price)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{property.district}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="w-3.5 h-3.5" />
                        {property.views_count.toLocaleString('ar-EG')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{property._count.leads}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleFeatured(property.id, property.featured)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          property.featured
                            ? 'bg-gold/20 text-gold hover:bg-gold/30'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                        title={property.featured ? 'إلغاء التمييز' : 'تمييز العقار'}
                      >
                        <Star className={`w-4 h-4 ${property.featured ? 'fill-current' : ''}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                          <Link href={`/admin/properties/${property.id}/edit`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        {confirmDelete === property.id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleDelete(property.id)}
                              disabled={deletingId === property.id}
                              className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="p-1.5 bg-muted rounded-lg hover:bg-muted/80"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDelete(property.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              صفحة {page} من {totalPages} ({total} إجمالي)
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={buildUrl({ page: String(page - 1) })}>
                    <ChevronRight className="w-4 h-4" />
                    السابق
                  </Link>
                </Button>
              )}
              {page < totalPages && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={buildUrl({ page: String(page + 1) })}>
                    التالي
                    <ChevronLeft className="w-4 h-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
