import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <SearchX className="w-20 h-20 mx-auto text-muted-foreground mb-6" />
        <h1 className="text-6xl font-bold text-navy dark:text-ivory mb-4">٤٠٤</h1>
        <h2 className="text-2xl font-bold text-foreground mb-3">الصفحة غير موجودة</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها
        </p>
        <Button variant="gold" size="lg" asChild>
          <Link href="/" className="gap-2">
            <Home className="w-5 h-5" />
            العودة للرئيسية
          </Link>
        </Button>
      </div>
    </div>
  );
}
