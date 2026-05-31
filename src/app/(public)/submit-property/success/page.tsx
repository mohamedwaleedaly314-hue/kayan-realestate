import Link from 'next/link';
import { CheckCircle2, Clock, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SubmitSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-card border border-border rounded-2xl p-8 shadow-sm">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-3">تم استلام طلبك! 🎉</h1>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          شكراً لك — وصل طلبك إلى فريق كيان للعقارات.
          سنراجع إعلانك وسيُنشر خلال <strong>24 ساعة</strong> بعد الموافقة.
        </p>

        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl text-right">
            <Clock className="w-5 h-5 text-gold shrink-0" />
            <p className="text-sm text-foreground">مراجعة وموافقة خلال 24 ساعة</p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl text-right">
            <Phone className="w-5 h-5 text-gold shrink-0" />
            <p className="text-sm text-foreground">سيتواصل معك فريقنا على الهاتف أو واتساب للتأكيد</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button variant="gold" asChild>
            <Link href="/properties">تصفح العقارات</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">الصفحة الرئيسية</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
