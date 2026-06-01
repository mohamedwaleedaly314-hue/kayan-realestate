import type { Metadata } from 'next';
import { Cairo, Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import WhatsAppButton from '@/components/ui/whatsapp-button';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? 'http://localhost:3000'),
  title: {
    default: 'كيان للعقارات | مدينة 15 مايو',
    template: '%s | كيان للعقارات',
  },
  description: 'شركة كيان للعقارات في مدينة 15 مايو - أفضل العروض العقارية من بيع وإيجار شقق وفيلات ومحلات',
  keywords: ['عقارات', 'مدينة 15 مايو', 'كيان', 'شقق للبيع', 'شقق للإيجار', 'عقارات مصر'],
  authors: [{ name: 'كيان للعقارات' }],
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    siteName: 'كيان للعقارات',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      {/* Anti-flash: apply dark mode BEFORE React hydration */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var t = localStorage.getItem('theme');
            var sys = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (t === 'dark' || (!t && sys)) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          } catch(e) {}
        `}} />
      </head>
      <body className={`${cairo.variable} ${inter.variable} font-cairo`}>
        {children}
        <WhatsAppButton />
        <Analytics />
        <SpeedInsights />
        <Toaster
          position="top-center"
          toastOptions={{
            className: 'font-cairo',
            duration: 4000,
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
      </body>
    </html>
  );
}
