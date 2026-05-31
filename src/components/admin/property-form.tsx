'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import {
  Upload, X, Star, GripVertical, Save, ArrowRight,
  ChevronDown, ChevronUp, Eye, EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateSlug } from '@/lib/utils';
import { districtGroups } from '@/lib/districts';
import toast from 'react-hot-toast';

interface ImageItem {
  id?: string;
  url: string;
  alt_text?: string | null;
  sort_order: number;
  is_primary: boolean;
  uploading?: boolean;
  file?: File;
}

interface OwnerData {
  id?: string;
  name?: string | null;
  whatsapp?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  tiktok_url?: string | null;
  youtube_url?: string | null;
  twitter_url?: string | null;
  notes?: string | null;
  show_contact?: boolean;
}

interface InitialData {
  id: string;
  title_ar: string;
  slug: string;
  description_ar?: string | null;
  price: number;
  area_m2: number;
  rooms?: number | null;
  floor?: number | null;
  has_elevator: boolean;
  type: string;
  status: string;
  district: string;
  lat?: number | null;
  lng?: number | null;
  featured: boolean;
  images: ImageItem[];
  owner: OwnerData | null;
}

interface PropertyFormProps {
  initialData?: InitialData;
}

export default function PropertyForm({ initialData }: PropertyFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initialData?.id);

  // Basic fields
  const [titleAr, setTitleAr] = useState(initialData?.title_ar ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [slugManual, setSlugManual] = useState(Boolean(initialData?.slug));
  const [descriptionAr, setDescriptionAr] = useState(initialData?.description_ar ?? '');
  const [price, setPrice] = useState(initialData?.price?.toString() ?? '');
  const [areaM2, setAreaM2] = useState(initialData?.area_m2?.toString() ?? '');
  const [rooms, setRooms] = useState(initialData?.rooms?.toString() ?? '');
  const [floor, setFloor] = useState(initialData?.floor?.toString() ?? '');
  const [hasElevator, setHasElevator] = useState(initialData?.has_elevator ?? false);
  const [type, setType] = useState(initialData?.type ?? 'SALE');
  const [status, setStatus] = useState(initialData?.status ?? 'AVAILABLE');
  const [district, setDistrict] = useState(initialData?.district ?? '');
  const [lat, setLat] = useState(initialData?.lat?.toString() ?? '');
  const [lng, setLng] = useState(initialData?.lng?.toString() ?? '');
  const [featured, setFeatured] = useState(initialData?.featured ?? false);

  // Images
  const [images, setImages] = useState<ImageItem[]>(
    initialData?.images ?? []
  );

  // Owner
  const [ownerName, setOwnerName] = useState(initialData?.owner?.name ?? '');
  const [ownerWhatsapp, setOwnerWhatsapp] = useState(initialData?.owner?.whatsapp ?? '');
  const [ownerFb, setOwnerFb] = useState(initialData?.owner?.facebook_url ?? '');
  const [ownerIg, setOwnerIg] = useState(initialData?.owner?.instagram_url ?? '');
  const [ownerTt, setOwnerTt] = useState(initialData?.owner?.tiktok_url ?? '');
  const [ownerYt, setOwnerYt] = useState(initialData?.owner?.youtube_url ?? '');
  const [ownerTw, setOwnerTw] = useState(initialData?.owner?.twitter_url ?? '');
  const [ownerNotes, setOwnerNotes] = useState(initialData?.owner?.notes ?? '');
  const [showContact, setShowContact] = useState(initialData?.owner?.show_contact ?? false);

  const [loading, setLoading] = useState(false);
  const [ownerExpanded, setOwnerExpanded] = useState(Boolean(initialData?.owner?.name));

  // Handle title → auto-slug
  function handleTitleChange(val: string) {
    setTitleAr(val);
    if (!slugManual) {
      setSlug(generateSlug(val));
    }
  }

  // Dropzone
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const toUpload = acceptedFiles.slice(0, 20 - images.length);
    if (toUpload.length === 0) return;

    const newImages: ImageItem[] = toUpload.map((file, i) => ({
      url: URL.createObjectURL(file),
      sort_order: images.length + i,
      is_primary: images.length === 0 && i === 0,
      uploading: true,
      file,
    }));
    setImages((prev) => [...prev, ...newImages]);

    // Upload each
    for (let i = 0; i < newImages.length; i++) {
      const img = newImages[i];
      if (!img.file) continue;

      const formData = new FormData();
      formData.append('file', img.file);

      try {
        const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? 'فشل الرفع');
        }
        const { url } = await res.json();
        setImages((prev) =>
          prev.map((im) =>
            im === newImages[i]
              ? { ...im, url, uploading: false, file: undefined }
              : im
          )
        );
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'فشل رفع الصورة');
        setImages((prev) => prev.filter((im) => im !== newImages[i]));
      }
    }
  }, [images]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: 5 * 1024 * 1024,
    disabled: images.length >= 20,
  });

  function removeImage(index: number) {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      // Ensure there's a primary
      if (next.length > 0 && !next.some((im) => im.is_primary)) {
        next[0].is_primary = true;
      }
      return next.map((im, i) => ({ ...im, sort_order: i }));
    });
  }

  function setPrimary(index: number) {
    setImages((prev) =>
      prev.map((im, i) => ({ ...im, is_primary: i === index }))
    );
  }

  // Drag reorder (simple swap on drop)
  const [dragging, setDragging] = useState<number | null>(null);

  function handleDragStart(i: number) { setDragging(i); }
  function handleDragOver(e: React.DragEvent, i: number) {
    e.preventDefault();
    if (dragging === null || dragging === i) return;
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragging, 1);
      next.splice(i, 0, moved);
      setDragging(i);
      return next.map((im, idx) => ({ ...im, sort_order: idx }));
    });
  }
  function handleDragEnd() { setDragging(null); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate required
    if (!titleAr.trim() || !slug.trim() || !price || !areaM2 || !district) {
      toast.error('يرجى ملء جميع الحقول الإلزامية');
      return;
    }
    if (images.some((im) => im.uploading)) {
      toast.error('انتظر انتهاء رفع الصور');
      return;
    }

    setLoading(true);

    const body = {
      title_ar: titleAr.trim(),
      slug: slug.trim(),
      description_ar: descriptionAr || null,
      price: parseFloat(price),
      area_m2: parseFloat(areaM2),
      rooms: rooms ? parseInt(rooms, 10) : null,
      floor: floor ? parseInt(floor, 10) : null,
      has_elevator: hasElevator,
      type,
      status,
      district,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      featured,
      owner: {
        name: ownerName || null,
        whatsapp: ownerWhatsapp || null,
        facebook_url: ownerFb || null,
        instagram_url: ownerIg || null,
        tiktok_url: ownerTt || null,
        youtube_url: ownerYt || null,
        twitter_url: ownerTw || null,
        notes: ownerNotes || null,
        show_contact: showContact,
      },
    };

    try {
      const url = isEdit
        ? `/api/admin/properties/${initialData!.id}`
        : '/api/admin/properties';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        let errMsg = `خطأ ${res.status}`;
        try {
          const err = await res.json();
          errMsg = err.error ?? errMsg;
        } catch { /* response was not JSON */ }
        throw new Error(errMsg);
      }

      const property = await res.json();
      const propertyId = property.id ?? initialData!.id;

      // Save/update images via API
      if (!isEdit) {
        // Create new images
        for (const [i, img] of images.entries()) {
          await fetch('/api/admin/images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              property_id: propertyId,
              url: img.url,
              alt_text: img.alt_text ?? null,
              sort_order: i,
              is_primary: img.is_primary,
            }),
          });
        }
      } else {
        // For edit: handle reorder of existing images
        const existingImages = images.filter((im) => im.id);
        if (existingImages.length > 0) {
          await fetch('/api/admin/images', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
              existingImages.map((im) => ({ id: im.id!, sort_order: im.sort_order }))
            ),
          });
        }
        // New images (no id)
        const newImages = images.filter((im) => !im.id);
        for (const img of newImages) {
          await fetch('/api/admin/images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              property_id: propertyId,
              url: img.url,
              alt_text: img.alt_text ?? null,
              sort_order: img.sort_order,
              is_primary: img.is_primary,
            }),
          });
        }
        // Update primary flag
        for (const img of images.filter((im) => im.id)) {
          await fetch(`/api/admin/images/${img.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_primary: img.is_primary }),
          });
        }
      }

      toast.success(isEdit ? 'تم تحديث العقار بنجاح!' : 'تم إضافة العقار بنجاح!');
      router.push('/admin/properties');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Basic Info */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <h2 className="font-bold text-lg text-foreground border-b border-border pb-3">البيانات الأساسية</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <Label htmlFor="title_ar">عنوان العقار بالعربي *</Label>
            <Input
              id="title_ar"
              value={titleAr}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="مثال: شقة 3 غرف للبيع في الحي الثالث"
              required
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="slug">الـ Slug (رابط العقار) *</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                id="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                  setSlugManual(true);
                }}
                placeholder="apartment-3-rooms-district-3"
                dir="ltr"
                required
                className="flex-1"
              />
              {slugManual && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSlug(generateSlug(titleAr));
                    setSlugManual(false);
                  }}
                >
                  تلقائي
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              سيظهر في الرابط: /properties/{slug || 'slug-هنا'}
            </p>
          </div>

          <div>
            <Label htmlFor="district">المنطقة *</Label>
            <select
              id="district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              required
              className="mt-1.5 flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">اختر المنطقة</option>
              {districtGroups.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="description_ar">الوصف (اختياري)</Label>
            <textarea
              id="description_ar"
              value={descriptionAr}
              onChange={(e) => setDescriptionAr(e.target.value)}
              rows={5}
              placeholder="وصف تفصيلي للعقار، المميزات، الموقع..."
              maxLength={5000}
              className="mt-1.5 flex w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <h2 className="font-bold text-lg text-foreground border-b border-border pb-3">تفاصيل العقار</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="price">السعر (جنيه) *</Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="1500000"
              required
              min={0}
              className="mt-1.5"
              dir="ltr"
            />
          </div>
          <div>
            <Label htmlFor="area">المساحة (م²) *</Label>
            <Input
              id="area"
              type="number"
              value={areaM2}
              onChange={(e) => setAreaM2(e.target.value)}
              placeholder="120"
              required
              min={1}
              className="mt-1.5"
              dir="ltr"
            />
          </div>
          <div>
            <Label htmlFor="rooms">عدد الغرف</Label>
            <Input
              id="rooms"
              type="number"
              value={rooms}
              onChange={(e) => setRooms(e.target.value)}
              placeholder="3"
              min={0}
              max={20}
              className="mt-1.5"
              dir="ltr"
            />
          </div>
          <div>
            <Label htmlFor="floor">الطابق</Label>
            <Input
              id="floor"
              type="number"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              placeholder="2"
              min={0}
              className="mt-1.5"
              dir="ltr"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label>نوع العقار</Label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1.5 flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="SALE">للبيع</option>
              <option value="RENT">للإيجار</option>
            </select>
          </div>
          <div>
            <Label>حالة العقار</Label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1.5 flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="AVAILABLE">متاح</option>
              <option value="RESERVED">محجوز</option>
              <option value="SOLD">مباع</option>
            </select>
          </div>
          <div className="flex items-end gap-3 pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasElevator}
                onChange={(e) => setHasElevator(e.target.checked)}
                className="w-4 h-4 rounded accent-gold"
              />
              <span className="text-sm font-medium">يوجد مصعد</span>
            </label>
          </div>
          <div className="flex items-end gap-3 pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded accent-gold"
              />
              <span className="text-sm font-medium">عقار مميز ⭐</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="lat">خط العرض (Lat)</Label>
            <Input id="lat" type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="29.9" className="mt-1.5" dir="ltr" />
          </div>
          <div>
            <Label htmlFor="lng">خط الطول (Lng)</Label>
            <Input id="lng" type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="31.2" className="mt-1.5" dir="ltr" />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <h2 className="font-bold text-lg text-foreground border-b border-border pb-3">
          الصور ({images.length}/20)
        </h2>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-gold bg-gold/5'
              : 'border-border hover:border-gold/50 hover:bg-muted/30'
          } ${images.length >= 20 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground">
            {isDragActive ? 'اسحب الصور هنا' : 'اسحب الصور أو انقر للاختيار'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JPEG, PNG, WebP — حتى 5MB لكل صورة — حتى 20 صورة
          </p>
        </div>

        {/* Images grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.map((img, i) => (
              <div
                key={`${img.url}-${i}`}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDragEnd={handleDragEnd}
                className={`relative group rounded-xl overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing ${
                  img.is_primary ? 'border-gold' : 'border-transparent hover:border-border'
                } ${dragging === i ? 'opacity-50' : ''}`}
              >
                <div className="aspect-square relative">
                  <Image
                    src={img.url}
                    alt={`صورة ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="150px"
                  />
                  {img.uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Controls overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-start justify-end p-1.5 gap-1">
                  <button
                    type="button"
                    onClick={() => setPrimary(i)}
                    className={`p-1 rounded-lg transition-all ${
                      img.is_primary
                        ? 'bg-gold text-white opacity-100'
                        : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'
                    }`}
                    title="تعيين كصورة رئيسية"
                  >
                    <Star className={`w-3.5 h-3.5 ${img.is_primary ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="p-1 rounded-lg bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="حذف الصورة"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Primary badge */}
                {img.is_primary && (
                  <div className="absolute bottom-1 right-1 bg-gold text-white text-[10px] px-1.5 py-0.5 rounded-md font-medium">
                    رئيسية
                  </div>
                )}

                <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="w-4 h-4 text-white drop-shadow" />
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          اسحب الصور لإعادة ترتيبها • انقر على ⭐ لتحديد الصورة الرئيسية
        </p>
      </div>

      {/* Owner Info */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => setOwnerExpanded(!ownerExpanded)}
          className="w-full flex items-center justify-between p-6 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-lg text-foreground">بيانات المالك</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              اختياري وخاص
            </span>
          </div>
          {ownerExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {ownerExpanded && (
          <div className="p-6 pt-0 space-y-5 border-t border-border">
            <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-xl px-4 py-3 text-sm">
              <EyeOff className="w-4 h-4 shrink-0" />
              {'بيانات المالك خاصة ولن تظهر للزوار إلا إذا فعّلت خيار "إظهار للزوار"'}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>اسم المالك</Label>
                <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="محمد أحمد" className="mt-1.5" />
              </div>
              <div>
                <Label>رقم واتساب المالك</Label>
                <Input value={ownerWhatsapp} onChange={(e) => setOwnerWhatsapp(e.target.value)} placeholder="201234567890" dir="ltr" className="mt-1.5" />
              </div>
              <div>
                <Label>رابط فيسبوك</Label>
                <Input value={ownerFb} onChange={(e) => setOwnerFb(e.target.value)} placeholder="https://facebook.com/..." dir="ltr" className="mt-1.5" />
              </div>
              <div>
                <Label>رابط انستجرام</Label>
                <Input value={ownerIg} onChange={(e) => setOwnerIg(e.target.value)} placeholder="https://instagram.com/..." dir="ltr" className="mt-1.5" />
              </div>
              <div>
                <Label>رابط تيك توك</Label>
                <Input value={ownerTt} onChange={(e) => setOwnerTt(e.target.value)} placeholder="https://tiktok.com/..." dir="ltr" className="mt-1.5" />
              </div>
              <div>
                <Label>رابط يوتيوب</Label>
                <Input value={ownerYt} onChange={(e) => setOwnerYt(e.target.value)} placeholder="https://youtube.com/..." dir="ltr" className="mt-1.5" />
              </div>
              <div>
                <Label>رابط تويتر / X</Label>
                <Input value={ownerTw} onChange={(e) => setOwnerTw(e.target.value)} placeholder="https://x.com/..." dir="ltr" className="mt-1.5" />
              </div>
            </div>

            <div>
              <Label>ملاحظات داخلية (لن تُعرض للزوار أبداً)</Label>
              <textarea
                value={ownerNotes}
                onChange={(e) => setOwnerNotes(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="ملاحظات خاصة، أوقات التواصل، تفضيلات المالك..."
                className="mt-1.5 flex w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors resize-none"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer p-4 bg-muted/50 rounded-xl">
              <input
                type="checkbox"
                checked={showContact}
                onChange={(e) => setShowContact(e.target.checked)}
                className="w-5 h-5 rounded accent-gold"
              />
              <div>
                <p className="font-medium flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gold" />
                  إظهار بيانات التواصل للزوار
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  إذا كان مفعّلاً، سيظهر واتساب المالك وروابط سوشيال ميديا في صفحة العقار
                </p>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 sticky bottom-0 bg-background/80 backdrop-blur-md py-4 border-t border-border">
        <Button type="submit" variant="gold" size="lg" disabled={loading} className="gap-2">
          <Save className="w-4 h-4" />
          {loading ? 'جاري الحفظ...' : isEdit ? 'حفظ التعديلات' : 'إضافة العقار'}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.push('/admin/properties')}
          className="gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          إلغاء
        </Button>
      </div>
    </form>
  );
}
