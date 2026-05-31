'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Building2, LayoutDashboard, Home, MessageSquare, LogOut,
  Plus, Users, Menu, X, ClipboardList, Inbox, Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/admin', label: 'نظرة عامة', icon: LayoutDashboard, exact: true },
  { href: '/admin/properties', label: 'العقارات', icon: Home },
  { href: '/admin/properties/new', label: 'إضافة عقار', icon: Plus },
  { href: '/admin/submissions', label: 'عروض المالكين', icon: Inbox },
  { href: '/admin/leads', label: 'الليدز', icon: MessageSquare },
  { href: '/admin/requests', label: 'طلبات العقارات', icon: ClipboardList },
  { href: '/admin/reviews', label: 'التقييمات', icon: Star },
  { href: '/admin/users', label: 'المستخدمون', icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast.success('تم تسجيل الخروج');
    router.push('/admin/login');
    router.refresh();
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <div className="w-9 h-9 rounded-xl bg-gold flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white">كيان</p>
            <p className="text-xs text-ivory/60">لوحة التحكم</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href) && !(item.exact === false && pathname === '/admin');
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className={cn('flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                active ? 'bg-gold text-white shadow-md' : 'text-ivory/70 hover:bg-white/10 hover:text-white')}>
              <item.icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-ivory/70 hover:bg-red-500/20 hover:text-red-400 transition-all w-full">
          <LogOut className="w-5 h-5" /> تسجيل الخروج
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 right-0 h-full w-64 bg-navy text-white flex-col z-30">
        <SidebarContent />
      </aside>

      {/* Mobile toggle button */}
      <button
        className="lg:hidden fixed top-4 right-4 z-50 w-10 h-10 bg-navy text-white rounded-xl flex items-center justify-center shadow-lg"
        onClick={() => setOpen(true)}
        aria-label="فتح القائمة"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="relative w-72 bg-navy text-white flex flex-col shadow-2xl">
            <button
              className="absolute top-4 left-4 w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              onClick={() => setOpen(false)}
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
