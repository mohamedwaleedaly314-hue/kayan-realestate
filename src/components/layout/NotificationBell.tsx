'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'الآن';
  if (m < 60) return `منذ ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `منذ ${h} ساعة`;
  const d = Math.floor(h / 24);
  if (d < 30) return `منذ ${d} يوم`;
  return `منذ ${Math.floor(d / 30)} شهر`;
}

interface Notification {
  id:         string;
  type:       string;
  title:      string;
  message:    string;
  link:       string | null;
  is_read:    boolean;
  created_at: string;
}

interface Props {
  transparent?: boolean;
}

export default function NotificationBell({ transparent }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen]                   = useState(false);
  const [loading, setLoading]             = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter(n => !n.is_read).length;

  // Fetch on mount
  useEffect(() => {
    setLoading(true);
    fetch('/api/notifications')
      .then(r => r.json())
      .then(d => setNotifications(d.notifications ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Close on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  async function markAllRead() {
    if (!unread) return;
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    setNotifications(ns => ns.map(n => ({ ...n, is_read: true })));
  }

  function handleOpen() {
    setOpen(v => !v);
    if (!open && unread > 0) markAllRead();
  }

  const iconBtnCls = cn(
    'relative w-9 h-9 rounded-xl flex items-center justify-center transition-all',
    transparent
      ? 'text-white/80 hover:text-white hover:bg-white/15'
      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
  );

  if (notifications.length === 0 && !loading) return null;

  return (
    <div ref={ref} className="relative">
      <button onClick={handleOpen} className={iconBtnCls} aria-label="الإشعارات">
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold
                           rounded-full flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 w-80 bg-card border border-border
                        rounded-2xl shadow-xl z-50 overflow-hidden animate-scale-in">
          <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
            <p className="text-sm font-bold">الإشعارات</p>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-gold hover:underline">
                تحديد الكل كمقروء
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                لا توجد إشعارات
              </div>
            ) : (
              notifications.map(n => {
                const content = (
                  <div className={cn(
                    'px-4 py-3 border-b border-border/30 last:border-0 transition-colors',
                    !n.is_read ? 'bg-gold/5' : 'hover:bg-muted/50'
                  )}>
                    <div className="flex gap-2">
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-gold shrink-0 mt-1.5" />
                      )}
                      <div className={cn('flex-1', n.is_read && 'pr-4')}>
                        <p className="text-sm font-semibold text-foreground leading-snug">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {timeAgo(n.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                );

                return n.link ? (
                  <Link key={n.id} href={n.link} onClick={() => setOpen(false)}>
                    {content}
                  </Link>
                ) : (
                  <div key={n.id}>{content}</div>
                );
              })
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-border/50">
            <Link href="/profile?tab=listings" onClick={() => setOpen(false)}
              className="text-xs text-gold hover:underline font-medium">
              عرض إعلاناتي ←
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
