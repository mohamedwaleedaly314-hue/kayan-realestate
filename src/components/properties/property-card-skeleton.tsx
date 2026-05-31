import { Skeleton } from '@/components/ui/skeleton';

export default function PropertyCardSkeleton() {
  return (
    <div className="luxury-card overflow-hidden">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-6 w-1/3" />
      </div>
    </div>
  );
}
