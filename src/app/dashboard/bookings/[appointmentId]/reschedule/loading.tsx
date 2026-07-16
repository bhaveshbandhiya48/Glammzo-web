export default function RescheduleLoading() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="space-y-3">
        <div className="h-3 w-24 animate-pulse rounded bg-muted/70" />
        <div className="h-9 w-56 max-w-full animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded bg-muted/60" />
      </div>
      <div className="space-y-4 rounded-2xl border border-border/65 bg-card p-5 sm:p-6">
        <div className="h-16 animate-pulse rounded-xl bg-muted/50" />
        <div className="h-11 animate-pulse rounded-xl bg-muted/60" />
        <div className="h-11 animate-pulse rounded-xl bg-muted/60" />
        <div className="h-12 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  )
}
