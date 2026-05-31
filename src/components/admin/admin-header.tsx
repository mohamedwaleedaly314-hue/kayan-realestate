import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export default function AdminHeader() {
  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="font-bold text-foreground">لوحة تحكم كيان للعقارات</h2>
        <p className="text-sm text-muted-foreground">مرحباً بك، المشرف</p>
      </div>
      <Link
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        عرض الموقع
      </Link>
    </header>
  );
}
