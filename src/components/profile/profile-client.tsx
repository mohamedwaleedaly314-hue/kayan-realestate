'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  User, Mail, Phone, Heart, MessageSquare, LogOut,
  MapPin, Maximize2, BedDouble, Calendar, Home,
  CheckCircle2, Clock, XCircle, Eye, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDate, getPropertyTypeLabel } from '@/lib/utils';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

/* ── types ─────────────────────────────────────────────── */
interface ProfileClientProps {
  user: {
    id: string; name: string; email: string; phone?: string | null;
    created_at: string; _count: { saves: number; leads: number };
  };
  savedProperties: Array<{
    id: string;
    property: {
      id: string; title_ar: string; slug: string; price: number;
      area_m2: number; rooms?: number | null; type: string; status: string;
      district: string; featured: boolean;
      images: Array<{ url: string; is_primary: boolean }>;
    };
  }>;
  myLeads: Array<{
    id: string; name: string; phone: string; message?: string | null;
    status: string; created_at: Date;
    property?: { title_ar: string; slug: string } | null;
  }>;
  myListings: Array<{
    id: string; title_ar: string; slug: string; price: number;
    area_m2: number; rooms?: number | null; type: string; status: string;
    district: string; listing_status: string; views_count: number;
    is_free_listing: boolean; free_listing_until?: string | null;
    created_at: string;
    images: Array<{ url: string; is_primary: boolean }>;
  }>;
}

/* ── helpers ─────────────────────────────────────────────── */
const leadStatusLabels: Record<string, string> = {
  NEW: 'جديد', CONTACTED: 'تم التواصل', QUALIFIED: 'مؤهل', CLOSED: 'مغلق',
};

function ListingStatusBadge({ status }: { status: string }) {
  const cfg = {
    APPROVED: { label: 'منشور',        icon: CheckCircle2, cls: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400' },
    PENDING:  { label: 'قيد المراجعة', icon: Clock,        cls: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400'           },
    REJECTED: { label: 'مرفوض',        icon: XCircle,      cls: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400'                     },
  }[status] ?? { label: status, icon: Clock, cls: 'bg-muted text-muted-foreground border-border' };

  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
      <Icon className="w-3 h-3" /> {cfg.label}
    </span>
  );
}

/* ── main ─────────────────────────────────────────────────── */
export default function ProfileClient({ user, savedProperties, myLeads, myListings }: ProfileClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<'saved' | 'leads' | 'listings'>('saved');
  const [saved, setSaved] = useState(savedProperties);

  async function handleLogout() {
    await fetch('/api/auth/user-logout', { method: 'POST' });
    toast.success('تم تسجيل الخروج');
    router.push('/');
    router.refresh();
  }

  async function handleUnsave(saveId: string, propertyId: string) {
    await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property_id: propertyId }),
    });
    setSaved((prev) => prev.filter((s) => s.id !== saveId));
    toast.success('تم إزالة العقار من المحفوظات');
  }

  const tabs = [
    { key: 'saved',    label: `المحفوظة (${saved.length})`,    icon: Heart          },
    { key: 'listings', label: `إعلاناتي (${myListings.length})`, icon: Home          },
    { key: 'leads',    label: `استفساراتي (${myLeads.length})`, icon: MessageSquare  },
  ] as const;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-20">

        {/* ── Header ──────────────────────────────────────── */}
        <div className="navy-gradient py-12">
          <div className="container-kayan">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gold flex items-center justify-center shrink-0">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-ivory/70 text-sm mt-0.5">{user.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}
                className="mr-auto border-white/30 text-white hover:bg-white/10 hover:text-white gap-2">
                <LogOut className="w-4 h-4" /> تسجيل الخروج
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                { icon: Heart,        label: 'عقارات محفوظة',  value: user._count.saves  },
                { icon: Home,         label: 'إعلاناتي',        value: myListings.length  },
                { icon: Calendar,     label: 'عضو منذ',         value: formatDate(user.created_at) },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 rounded-xl p-4 text-center text-white">
                  <s.icon className="w-5 h-5 mx-auto mb-2 opacity-80" />
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-xs text-ivory/60 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container-kayan py-8">
          {/* Contact info */}
          <div className="bg-card rounded-2xl border border-border p-5 mb-6 flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4 text-gold" /> {user.email}
            </span>
            {user.phone && (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 text-gold" /> {user.phone}
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  tab === key
                    ? 'bg-gold text-white shadow-md'
                    : 'bg-card border border-border text-foreground hover:bg-muted'
                }`}>
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* ── Tab: Saved Properties ─────────────────────── */}
          {tab === 'saved' && (
            <div>
              {saved.length === 0 ? (
                <div className="text-center py-16">
                  <Heart className="w-14 h-14 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-bold mb-2">لا توجد عقارات محفوظة</h3>
                  <p className="text-muted-foreground mb-6 text-sm">تصفح العقارات وانقر على ❤️ لحفظ ما يعجبك</p>
                  <Button variant="gold" asChild><Link href="/properties">تصفح العقارات</Link></Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {saved.map(({ id, property: p }) => {
                    const img = p.images[0];
                    return (
                      <div key={id} className="luxury-card overflow-hidden group">
                        <div className="relative aspect-[4/3]">
                          {img ? (
                            <Image src={img.url} alt={p.title_ar} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="33vw" />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center text-3xl">🏠</div>
                          )}
                          <button onClick={() => handleUnsave(id, p.id)}
                            className="absolute top-3 left-3 w-9 h-9 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                            title="إزالة من المحفوظات">
                            <Heart className="w-4 h-4 fill-current" />
                          </button>
                        </div>
                        <div className="p-4">
                          <Link href={`/properties/${p.slug}`} className="font-bold text-foreground hover:text-gold transition-colors line-clamp-2 text-sm leading-relaxed">
                            {p.title_ar}
                          </Link>
                          <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1.5">
                            <MapPin className="w-3 h-3" /> {p.district}
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-gold font-bold">{formatPrice(p.price)}</span>
                            <div className="flex gap-1.5 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Maximize2 className="w-3 h-3" />{p.area_m2}م²</span>
                              {p.rooms && <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" />{p.rooms}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Tab: My Listings ──────────────────────────── */}
          {tab === 'listings' && (
            <div>
              {myListings.length === 0 ? (
                <div className="text-center py-16">
                  <Home className="w-14 h-14 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-bold mb-2">لا توجد إعلانات</h3>
                  <p className="text-muted-foreground mb-6 text-sm">
                    أضف عقارك مجاناً وستظهر هنا لمتابعة حالته
                  </p>
                  <Button variant="gold" asChild>
                    <Link href="/submit-property">أضف عقارك الآن</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myListings.map((p) => {
                    const img = p.images[0];
                    const expiryDate = p.free_listing_until ? new Date(p.free_listing_until) : null;
                    const daysLeft = expiryDate
                      ? Math.ceil((expiryDate.getTime() - Date.now()) / 86_400_000)
                      : null;

                    return (
                      <div key={p.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                        <div className="flex flex-col sm:flex-row gap-0">
                          {/* Image */}
                          <div className="relative w-full sm:w-44 h-36 sm:h-auto shrink-0">
                            {img ? (
                              <Image src={img.url} alt={p.title_ar} fill className="object-cover" sizes="176px" />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center text-3xl">🏠</div>
                            )}
                            {/* Type badge */}
                            <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-navy text-white">
                              {getPropertyTypeLabel(p.type)}
                            </span>
                          </div>

                          {/* Details */}
                          <div className="flex-1 p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-bold text-sm text-foreground leading-snug line-clamp-2 flex-1">
                                {p.title_ar}
                              </h3>
                              <ListingStatusBadge status={p.listing_status} />
                            </div>

                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gold" />{p.district}</span>
                              <span className="flex items-center gap-1"><Maximize2 className="w-3 h-3 text-gold" />{p.area_m2}م²</span>
                              {p.rooms && <span className="flex items-center gap-1"><BedDouble className="w-3 h-3 text-gold" />{p.rooms} غرف</span>}
                              <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-gold" />{p.views_count} مشاهدة</span>
                            </div>

                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <p className="text-gold font-extrabold">{formatPrice(p.price)}</p>

                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {/* Expiry */}
                                {daysLeft !== null && (
                                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border font-medium ${
                                    daysLeft <= 3
                                      ? 'bg-red-100 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400'
                                      : daysLeft <= 7
                                        ? 'bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400'
                                        : 'bg-muted text-muted-foreground border-border'
                                  }`}>
                                    <RefreshCw className="w-3 h-3" />
                                    {daysLeft <= 0 ? 'انتهى الإعلان' : `${daysLeft} يوم متبقي`}
                                  </span>
                                )}

                                {/* View link (only if approved) */}
                                {p.listing_status === 'APPROVED' && (
                                  <Link
                                    href={`/properties/${p.slug}`}
                                    className="text-gold font-semibold hover:underline"
                                    target="_blank"
                                  >
                                    عرض الإعلان ↗
                                  </Link>
                                )}

                                {p.listing_status === 'PENDING' && (
                                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                                    جاري المراجعة من المكتب...
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Footer: submit date */}
                        <div className="px-4 py-2 border-t border-border/50 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
                          <span>تاريخ التقديم: {new Date(p.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          <Link
                            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '201234567890'}?text=${encodeURIComponent(`مرحباً، أريد الاستفسار عن إعلاني: ${p.title_ar}`)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="text-[#25D366] font-semibold hover:underline"
                          >
                            تواصل مع المكتب
                          </Link>
                        </div>
                      </div>
                    );
                  })}

                  <p className="text-center text-xs text-muted-foreground pt-2">
                    لتعديل إعلانك أو تجديده تواصل مع المكتب عبر واتساب
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Tab: My Leads ─────────────────────────────── */}
          {tab === 'leads' && (
            <div className="space-y-3">
              {myLeads.length === 0 ? (
                <div className="text-center py-16">
                  <MessageSquare className="w-14 h-14 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-bold mb-2">لا توجد استفسارات</h3>
                  <p className="text-muted-foreground text-sm">استفسارك عن أي عقار سيظهر هنا</p>
                </div>
              ) : (
                myLeads.map((lead) => (
                  <div key={lead.id} className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {lead.property && (
                          <Link href={`/properties/${lead.property.slug}`}
                            className="text-sm font-medium text-gold hover:underline line-clamp-1">
                            {lead.property.title_ar}
                          </Link>
                        )}
                        {lead.message && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{lead.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">{formatDate(lead.created_at)}</p>
                      </div>
                      <Badge variant={lead.status === 'NEW' ? 'available' : lead.status === 'CLOSED' ? 'sold' : 'reserved'}>
                        {leadStatusLabels[lead.status] ?? lead.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
