export function AppointmentCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/65 bg-card shadow-sm shadow-black/[0.03]">
      <div className="flex items-start justify-between gap-3 border-b border-border/55 px-4 py-3.5 sm:px-5">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="h-5 w-40 max-w-full animate-pulse rounded-md bg-muted" />
            <div className="h-7 w-24 animate-pulse rounded-full bg-muted/80" />
          </div>
          <div className="h-4 w-28 animate-pulse rounded bg-muted/70" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-b border-border/55 px-4 py-3 sm:grid-cols-4 sm:px-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[3.75rem] animate-pulse rounded-xl border border-border/50 bg-muted/40"
          />
        ))}
      </div>

      <div className="space-y-2.5 border-b border-border/55 px-4 py-3.5 sm:px-5">
        <div className="h-3 w-16 animate-pulse rounded bg-muted/70" />
        <div className="h-4 w-full max-w-xs animate-pulse rounded bg-muted/60" />
        <div className="h-4 w-3/4 max-w-sm animate-pulse rounded bg-muted/50" />
      </div>

      <div className="flex items-end justify-between gap-3 border-b border-border/55 px-4 py-3.5 sm:px-5">
        <div className="space-y-2">
          <div className="h-3 w-24 animate-pulse rounded bg-muted/70" />
          <div className="h-6 w-20 animate-pulse rounded bg-muted" />
        </div>
        <div className="space-y-2 text-right">
          <div className="ml-auto h-3 w-16 animate-pulse rounded bg-muted/70" />
          <div className="ml-auto h-4 w-20 animate-pulse rounded bg-muted/60" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 px-4 py-3 sm:px-5">
        <div className="h-9 w-24 animate-pulse rounded-full bg-muted" />
        <div className="h-9 w-20 animate-pulse rounded-full bg-muted/70" />
      </div>
    </div>
  )
}
