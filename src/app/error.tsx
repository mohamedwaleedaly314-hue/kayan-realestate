'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <AlertTriangle className="w-16 h-16 mx-auto text-destructive mb-6" />
        <h1 className="text-2xl font-bold text-foreground mb-3">حدث خطأ غير متوقع</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          عذراً، حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى.
        </p>
        <Button variant="gold" onClick={reset}>
          إعادة المحاولة
        </Button>
      </div>
    </div>
  );
}
