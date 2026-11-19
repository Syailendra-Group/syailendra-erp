import { Skeleton } from '@/components/ui/skeleton'

export function SupplierFormSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-64 max-w-full" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="bg-muted/40 flex w-full flex-wrap gap-2 rounded-xl border p-2">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-9 min-w-36 flex-1" />
        ))}
      </div>
      <div className="bg-card flex flex-col gap-4 rounded-xl p-5 shadow-xs">
        <Skeleton className="h-5 w-40" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  )
}
