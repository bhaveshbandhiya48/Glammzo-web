export function MapSkeleton() {
  return (
    <div className="relative h-[min(72vh,42rem)] w-full overflow-hidden rounded-3xl border border-border/80 bg-muted/30">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted/40 via-background to-muted/60" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
        <div className="size-10 animate-pulse rounded-full border-2 border-primary/30 border-t-primary" />
        <p className="text-sm font-medium text-foreground/80">Loading map…</p>
        <p className="text-xs text-foreground/50">Finding salons near you</p>
      </div>
    </div>
  )
}
