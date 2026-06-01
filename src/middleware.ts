import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? 'fallback-secret');

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Admin protection ───────────────────────────────────────────
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('admin_session')?.value;
    if (!token) return NextResponse.redirect(new URL('/admin/login', request.url));
    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      const res = NextResponse.redirect(new URL('/admin/login', request.url));
      res.cookies.delete('admin_session');
      return res;
    }
  }

  // Redirect already-logged-in admin from login page
  if (pathname === '/admin/login') {
    const token = request.cookies.get('admin_session')?.value;
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        return NextResponse.redirect(new URL('/admin', request.url));
      } catch { /* invalid token, proceed */ }
    }
  }

  // ─── User auth pages — redirect if already logged in ────────────
  if (pathname === '/auth/signin' || pathname === '/auth/signup') {
    const token = request.cookies.get('user_session')?.value;
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        return NextResponse.redirect(new URL('/profile', request.url));
      } catch { /* invalid token, proceed */ }
    }
  }

  // ─── Protected user pages ────────────────────────────────────────
  // Visitors may browse freely, but must register/login before any action
  // page (their profile, listing a property, or requesting one).
  if (
    pathname.startsWith('/profile') ||
    pathname.startsWith('/submit-property') ||
    pathname.startsWith('/request')
  ) {
    const token = request.cookies.get('user_session')?.value;
    if (!token) {
      return NextResponse.redirect(new URL(`/auth/signin?from=${encodeURIComponent(pathname)}`, request.url));
    }
    try {
      await jwtVerify(token, JWT_SECRET);
    } catch {
      const res = NextResponse.redirect(new URL(`/auth/signin?from=${encodeURIComponent(pathname)}`, request.url));
      res.cookies.delete('user_session');
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/auth/:path*', '/profile/:path*', '/submit-property/:path*', '/request/:path*'],
};
