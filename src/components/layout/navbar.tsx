'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu, X, Building2, Moon, Sun,
  User, Heart, LogOut, ChevronDown,
  Home, Grid3X3, Info, Phone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import NotificationBell from '@/components/layout/NotificationBell';

const navLinks = [
  { href: '/',           label: 'الرئيسية',  icon: Home },
  { href: '/properties', label: 'العقارات',   icon: Grid3X3 },
  { href: '/request',    label: 'طلب عقار',   icon: Phone },
  { href: '/about',      label: 'من نحن',     icon: Info },
  { href: '/contact',    label: 'تواصل معنا', icon: Phone },
];

interface UserInfo { id: string; name: string; email: string; phone?: string | null }

export default function Navbar() {
  const [scrolled,    setScrolled]   = useState(false);
  const [mobileOpen,  setMobileOpen] = useState(false);
  const [darkMode,    setDarkMode]   = useState(false);
  const [user,        setUser]       = useState<UserInfo | null>(null);
  const [userMenu,    setUserMenu]   = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router   = useRouter();

  /* hero page = homepage only → transparent navbar */
  const isHeroPage  = pathname === '/';
  const transparent = isHeroPage && !scrolled;

  /* ── scroll ── */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    fn();
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* ── dark mode (sync with anti-flash script in layout) ── */
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  /* ── auth ── (fetch once on mount only) */
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => setUser(d.user ?? null))
      .finally(() => setLoadingUser(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── close dropdown on outside click ── */
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setUserMenu(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  /* ── close mobile on route change ── */
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  function toggleDark() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  async function handleLogout() {
    await fetch('/api/auth/user-logout', { method: 'POST' });
    setUser(null);
    setUserMenu(false);
    toast.success('تم تسجيل الخروج');
    router.push('/');
    router.refresh();
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  /* ── style helpers ── */
  const navLinkCls = (href: string) => cn(
    'px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150',
    isActive(href)
      ? transparent
        ? 'bg-white/15 text-white font-semibold'
        : 'bg-gold/10 text-gold font-semibold'
      : transparent
        ? 'text-white/90 hover:text-white hover:bg-white/15'
        : 'text-foreground/80 hover:text-foreground hover:bg-muted'
  );

  const iconBtnCls = cn(
    'w-9 h-9 rounded-xl flex items-center justify-center transition-all',
    transparent
      ? 'text-white/80 hover:text-white hover:bg-white/15'
      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
  );

  return (
    <>
      <header className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        transparent
          ? 'bg-gradient-to-b from-black/60 via-black/20 to-transparent'
          : 'bg-background/95 backdrop-blur-xl border-b border-border shadow-[0_1px_12px_rgba(0,0,0,0.07)] dark:shadow-[0_1px_12px_rgba(0,0,0,0.35)]'
      )}>
        <div className="container-kayan">
          <div className="flex items-center justify-between h-[68px] gap-3">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 rounded-xl bg-gold flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
                <Building2 className="w-[18px] h-[18px] text-white" />
              </div>
              <div className="leading-none">
                <p className={cn(
                  'text-base font-extrabold tracking-wide leading-none transition-colors duration-300',
                  transparent ? 'text-white' : 'text-navy dark:text-ivory'
                )}>كيان</p>
                <p className="text-[10px] text-gold font-medium leading-tight mt-0.5">للعقارات</p>
              </div>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navLinks.map(({ href, label }) => (
                <Link key={href} href={href} className={navLinkCls(href)}>
                  {label}
                </Link>
              ))}
            </nav>

            {/* ── Desktop Right Controls ── */}
            <div className="hidden lg:flex items-center gap-1.5">
              {/* Dark toggle */}
              <button onClick={toggleDark} className={iconBtnCls} aria-label="تبديل المظهر">
                {darkMode
                  ? <Sun  className="w-4 h-4 text-gold" />
                  : <Moon className="w-4 h-4" />}
              </button>

              {/* Notification bell — only for logged-in users */}
              {!loadingUser && user && (
                <NotificationBell transparent={transparent} />
              )}

              {!loadingUser && (
                user ? (
                  /* User dropdown */
                  <div ref={dropdownRef} className="relative">
                    <button
                      onClick={() => setUserMenu(v => !v)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-sm font-medium max-w-[180px]',
                        transparent ? 'text-white/90 hover:bg-white/15' : 'hover:bg-muted'
                      )}
                    >
                      <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {user.name[0]}
                      </div>
                      <span className="truncate">{user.name}</span>
                      <ChevronDown className={cn(
                        'w-3.5 h-3.5 shrink-0 transition-transform',
                        userMenu && 'rotate-180',
                        transparent ? 'text-white/60' : 'text-muted-foreground'
                      )} />
                    </button>

                    {userMenu && (
                      <div className="absolute left-0 top-full mt-1.5 w-52 bg-card border border-border
                                      rounded-2xl shadow-xl py-1.5 z-50 animate-scale-in">
                        <div className="px-4 py-2 border-b border-border/50 mb-1">
                          <p className="text-sm font-semibold truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate" dir="ltr">{user.phone ?? ''}</p>
                        </div>
                        <Link href="/profile" onClick={() => setUserMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted transition-colors rounded-lg mx-1">
                          <User className="w-4 h-4 text-gold" />
                          <span>حسابي</span>
                        </Link>
                        <Link href="/profile?tab=saved" onClick={() => setUserMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted transition-colors rounded-lg mx-1">
                          <Heart className="w-4 h-4 text-red-400" />
                          <span>العقارات المحفوظة</span>
                        </Link>
                        <div className="border-t border-border/50 mt-1 pt-1">
                          <button onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm
                                       text-destructive hover:bg-destructive/10 transition-colors rounded-lg mx-1">
                            <LogOut className="w-4 h-4" />
                            <span>تسجيل الخروج</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Auth buttons */
                  <div className="flex items-center gap-1.5">
                    <Button variant="ghost" size="sm" asChild className={cn(
                      'text-sm h-9',
                      transparent ? 'text-white/90 hover:text-white hover:bg-white/15' : ''
                    )}>
                      <Link href="/auth/signin">دخول</Link>
                    </Button>
                    <Button variant="gold" size="sm" asChild className="text-sm h-9 px-4 shadow-md">
                      <Link href="/auth/signup">حساب جديد</Link>
                    </Button>
                  </div>
                )
              )}

              {/* "اعرض عقارك" — always visible on desktop */}
              <Link href="/submit-property"
                className={cn(
                  'inline-flex items-center gap-1.5 text-sm font-bold px-3 h-9 rounded-xl border transition-all',
                  transparent
                    ? 'bg-gold/20 border-gold/40 text-white hover:bg-gold/30'
                    : 'bg-gold text-white border-gold hover:bg-gold/90 shadow-md shadow-gold/20'
                )}>
                🏠 اعرض عقارك
              </Link>
            </div>

            {/* ── Mobile Controls ── */}
            <div className="lg:hidden flex items-center gap-1.5">
              <button onClick={toggleDark} className={iconBtnCls}>
                {darkMode ? <Sun className="w-4 h-4 text-gold" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setMobileOpen(v => !v)}
                className={cn(iconBtnCls, transparent ? 'text-white' : '')}
                aria-label="القائمة"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"
               onClick={() => setMobileOpen(false)} />

          <div className="absolute top-[68px] inset-x-0 bg-background border-b border-border shadow-2xl
                          animate-fade-up overflow-y-auto max-h-[calc(100dvh-68px)]">
            <div className="container-kayan py-4 space-y-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all',
                    isActive(href) ? 'bg-gold/10 text-gold' : 'hover:bg-muted text-foreground'
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {label}
                </Link>
              ))}

              {/* "اعرض عقارك" — mobile */}
              <Link href="/submit-property"
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20 transition-all text-base">
                🏠 اعرض عقارك مجاناً
              </Link>

              <div className="border-t border-border/50 pt-3 mt-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 bg-muted/60 rounded-xl mb-2">
                      <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center
                                      text-white font-bold text-sm shrink-0">
                        {user.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate" dir="ltr">{user.phone ?? ''}</p>
                      </div>
                    </div>
                    <Link href="/profile"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-all">
                      <User className="w-5 h-5 text-gold" />
                      <span>حسابي والمحفوظات</span>
                    </Link>
                    <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                 text-destructive hover:bg-destructive/10 transition-all">
                      <LogOut className="w-5 h-5" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 px-1 pb-2">
                    <Button variant="gold" size="lg" className="w-full shadow-md" asChild>
                      <Link href="/auth/signup">إنشاء حساب مجاني</Link>
                    </Button>
                    <Button variant="outline" size="lg" className="w-full" asChild>
                      <Link href="/auth/signin">تسجيل الدخول</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
