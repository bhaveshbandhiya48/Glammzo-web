import { cn } from "@/lib/utils"

export function FeaturedServiceCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-border/60 bg-card/60">
      <div className="aspect-[4/3] w-full bg-muted/40" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 rounded-md bg-muted/50" />
        <div className="h-3 w-1/2 rounded-md bg-muted/40" />
        <div className="h-3 w-2/3 rounded-md bg-muted/40" />
        <div className="h-5 w-1/4 rounded-md bg-muted/50" />
      </div>
    </div>
  )
}

export function ServiceCatalogRowSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-3 border-b border-border/50 px-4 py-3 last:border-b-0">
      <div className="size-11 shrink-0 rounded-lg bg-muted/50" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3.5 w-2/5 rounded-md bg-muted/50" />
        <div className="h-3 w-3/5 rounded-md bg-muted/40" />
      </div>
      <div className="h-4 w-12 rounded-md bg-muted/50" />
    </div>
  )
}

export function ServiceCardSkeleton({ className }: { className?: string }) {
  return <ServiceCatalogRowSkeleton />
}

export function PackageCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-border/60 bg-card/60">
      <div className="h-[210px] bg-muted/40" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-1/3 rounded-md bg-muted/50" />
        <div className="h-6 w-4/5 rounded-md bg-muted/50" />
        <div className="h-4 w-full rounded-md bg-muted/40" />
        <div className="h-8 w-1/2 rounded-md bg-muted/50" />
        <div className="h-10 w-full rounded-full bg-muted/50" />
      </div>
    </div>
  )
}

export function FeaturedServicesSkeleton({ count = 4 }: { count?: number }) {
  const items = Math.min(count, 4)
  const usePeek = items > 2

  if (!usePeek) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: items }).map((_, index) => (
          <FeaturedServiceCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="w-[calc((100%-1.5rem)/2.5)] shrink-0">
          <FeaturedServiceCardSkeleton />
        </div>
      ))}
    </div>
  )
}

export function BrowseAccordionSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-border/60 bg-card/60"
        >
          <div className="h-12 animate-pulse bg-muted/30" />
          {index === 0 ? (
            <div className="border-t border-border/50">
              {Array.from({ length: 3 }).map((__, rowIndex) => (
                <ServiceCatalogRowSkeleton key={rowIndex} />
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export function CatalogServicesSkeleton({ count = 4 }: { count?: number }) {
  return <FeaturedServicesSkeleton count={count} />
}

export function CatalogPackagesSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <PackageCardSkeleton key={index} />
      ))}
    </div>
  )
}
