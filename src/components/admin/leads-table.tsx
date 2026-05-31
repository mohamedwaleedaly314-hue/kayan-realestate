'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, ChevronRight, ChevronLeft, StickyNote, Save, Trash2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Lead {
  id:           string;
  name:         string;
  phone:        string;
  message?:     string | null;
  source:       string;
  status:       string;
  admin_notes?: string | null;
  created_at:   Date;
  property?:    {
    title_ar: string;
    slug: string;
    owner?: { name?: string | null; phone?: string | null; whatsapp?: string | null } | null;
  } | null;
}

interface LeadsTableProps {
  leads:         Lead[];
  total:         number;
  page:          number;
  pageSize:      number;
  currentStatus?: string;
}

const statusConfig: Record<string, { label: string; badge: string }> = {
  NEW:       { label: 'جديد',        badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  CONTACTED: { label: 'تم التواصل',  badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  QUALIFIED: { label: 'مؤهل',        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  CLOSED:    { label: 'مغلق',        badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

const sourceLabels: Record<string, string> = {
  WEBSITE: 'الموقع', WHATSAPP: 'واتساب', PHONE: 'هاتف', REFERRAL: 'إحالة',
};

export default function LeadsTable({ leads, total, page, pageSize, currentStatus }: LeadsTableProps) {
  const router = useRouter();
  const [updatingId,  setUpdatingId]  = useState<string | null>(null);
  const [expandedId,  setExpandedId]  = useState<string | null>(null);
  const [notesMap,    setNotesMap]    = useState<Record<string, string>>({});
  const totalPages = Math.ceil(total / pageSize);

  function buildUrl(params: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    if (currentStatus) p.set('status', currentStatus);
    Object.entries(params).forEach(([k, v]) => { if (v) p.set(k, v); else p.delete(k); });
    return `/admin/leads?${p.toString()}`;
  }

  async function patchLead(id: string, data: Record<string, unknown>) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      toast.error('حدث خطأ');
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteLead(id: string) {
    if (!confirm('هل تريد حذف هذا الاستفسار؟')) return;
    setUpdatingId(id);
    try {
      await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' });
      toast.success('تم الحذف');
      router.refresh();
    } catch {
      toast.error('حدث خطأ');
    } finally {
      setUpdatingId(null);
    }
  }

  async function saveNotes(id: string) {
    const notes = notesMap[id] ?? '';
    await patchLead(id, { admin_notes: notes });
    toast.success('تم حفظ الملاحظة');
  }

  function exportCSV() {
    const headers = ['الاسم','الهاتف','الرسالة','العقار','المصدر','الحالة','الملاحظات','التاريخ'];
    const rows = leads.map(l => [
      l.name, l.phone, l.message ?? '', l.property?.title_ar ?? '',
      sourceLabels[l.source] ?? l.source, statusConfig[l.status]?.label ?? l.status,
      l.admin_notes ?? '', new Date(l.created_at).toLocaleDateString('ar-EG'),
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url; a.download = `kayan-leads-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('تم التصدير');
  }

  return (
    <div className="space-y-4">
      {/* Filters & export */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1.5 flex-wrap">
          {[undefined,'NEW','CONTACTED','QUALIFIED','CLOSED'].map(s => (
            <button
              key={s ?? 'all'}
              onClick={() => router.push(buildUrl({ status: s, page: '1' }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentStatus === s
                  ? 'bg-gold text-white shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {s ? statusConfig[s]?.label : 'الكل'}
              {s === undefined && <span className="mr-1 text-gold font-bold">{total}</span>}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2 mr-auto h-8 text-xs">
          <Download className="w-3.5 h-3.5" />
          تصدير CSV
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/60 border-b border-border">
                <th className="text-right px-4 py-3 font-semibold text-xs">الاسم</th>
                <th className="text-right px-4 py-3 font-semibold text-xs">الهاتف</th>
                <th className="text-right px-4 py-3 font-semibold text-xs">العقار</th>
                <th className="text-right px-4 py-3 font-semibold text-xs">الرسالة</th>
                <th className="text-right px-4 py-3 font-semibold text-xs">الحالة</th>
                <th className="text-right px-4 py-3 font-semibold text-xs">التاريخ</th>
                <th className="text-right px-4 py-3 font-semibold text-xs">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">لا توجد استفسارات</td>
                </tr>
              )}
              {leads.map(lead => {
                const cfg        = statusConfig[lead.status] ?? statusConfig.NEW;
                const isExpanded = expandedId === lead.id;

                // Owner WhatsApp for "notify owner" button
                const ownerContact = lead.property?.owner?.whatsapp || lead.property?.owner?.phone;
                const ownerWaMsg   = ownerContact
                  ? encodeURIComponent(`مرحباً ${lead.property?.owner?.name ?? 'أخي'}،\nمن مكتب كيان للعقارات 🏢\n\nوصلنا استفسار على عقارك "${lead.property?.title_ar ?? ''}" من عميل جديد.\n\nاسم العميل: ${lead.name}\nهاتفه: ${lead.phone}\n\nسنتواصل معه من المكتب. 🙏`)
                  : null;
                const ownerWaLink  = ownerContact && ownerWaMsg
                  ? `https://wa.me/${ownerContact.replace(/\D/g,'')}?text=${ownerWaMsg}`
                  : null;

                return (
                  <>
                    <tr key={lead.id}
                      className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${updatingId === lead.id ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-navy/10 dark:bg-ivory/10 flex items-center justify-center
                                          text-xs font-bold text-navy dark:text-ivory shrink-0">
                            {lead.name[0]}
                          </div>
                          <span className="font-medium text-sm">{lead.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs" dir="ltr">{lead.phone}</span>
                          <a
                            href={`https://wa.me/${lead.phone.replace(/\D/g,'')}?text=${encodeURIComponent(`مرحباً ${lead.name}،\nمن فريق كيان للعقارات بخصوص استفسارك${lead.property ? ` عن عقار "${lead.property.title_ar}"` : ''}.\n\nهل أنت متاح للحديث الآن؟`)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="w-6 h-6 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors shrink-0"
                            title="رد على العميل عبر واتساب"
                          >
                            <MessageCircle className="w-3 h-3" />
                          </a>
                          {ownerWaLink && (
                            <a
                              href={ownerWaLink}
                              target="_blank" rel="noopener noreferrer"
                              className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold hover:bg-amber-200 transition-colors border border-amber-300/50 whitespace-nowrap"
                              title={`أبلغ المالك: ${lead.property?.owner?.name ?? ''}`}
                            >
                              🏠 أبلغ المالك
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {lead.property ? (
                          <Link href={`/properties/${lead.property.slug}`} target="_blank"
                            className="text-gold hover:underline text-xs line-clamp-1 max-w-[150px] block">
                            {lead.property.title_ar}
                          </Link>
                        ) : <span className="text-muted-foreground text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 max-w-[180px]">
                        <p className="text-muted-foreground text-xs truncate">{lead.message ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={lead.status}
                          onChange={e => patchLead(lead.id, { status: e.target.value })}
                          disabled={updatingId === lead.id}
                          className={`text-xs rounded-lg border border-input px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring ${cfg.badge}`}
                        >
                          {Object.entries(statusConfig).map(([val, c]) => (
                            <option key={val} value={val}>{c.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(lead.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setExpandedId(expandedId === lead.id ? null : lead.id);
                              if (!notesMap[lead.id]) setNotesMap(m => ({ ...m, [lead.id]: lead.admin_notes ?? '' }));
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${isExpanded ? 'bg-gold/15 text-gold' : 'hover:bg-muted text-muted-foreground'}`}
                            title="ملاحظات داخلية"
                          >
                            <StickyNote className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteLead(lead.id)}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded notes row */}
                    {isExpanded && (
                      <tr key={`${lead.id}-notes`} className="bg-amber-50/50 dark:bg-amber-900/10 border-b border-border/50">
                        <td colSpan={7} className="px-4 py-3">
                          <div className="flex items-start gap-3">
                            <StickyNote className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-1 shrink-0" />
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1.5">
                                ملاحظات داخلية (لن تظهر للعميل)
                              </p>
                              <textarea
                                value={notesMap[lead.id] ?? ''}
                                onChange={e => setNotesMap(m => ({ ...m, [lead.id]: e.target.value }))}
                                placeholder="أضف ملاحظاتك هنا... (تواصلنا يوم كذا، العميل مهتم بسعر أقل...)"
                                rows={2}
                                className="w-full text-xs rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-card px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-gold/50"
                              />
                            </div>
                            <Button size="sm" variant="gold" onClick={() => saveNotes(lead.id)}
                              disabled={updatingId === lead.id}
                              className="gap-1.5 h-8 text-xs shrink-0 mt-6">
                              <Save className="w-3 h-3" />
                              حفظ
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">صفحة {page} من {totalPages} • {total} استفسار</p>
            <div className="flex gap-2">
              {page > 1 && (
                <Button variant="outline" size="sm" onClick={() => router.push(buildUrl({ page: String(page-1) }))}>
                  <ChevronRight className="w-4 h-4" /> السابق
                </Button>
              )}
              {page < totalPages && (
                <Button variant="outline" size="sm" onClick={() => router.push(buildUrl({ page: String(page+1) }))}>
                  التالي <ChevronLeft className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
