import { AppointmentCardSkeleton } from "@/components/booking/appointment-card-skeleton"

export default function BookingsLoading() {
  return (
    <div className="space-y-8">
      <div className="max-w-2xl space-y-3">
        <div className="h-3 w-28 animate-pulse rounded bg-muted/70" />
        <div className="h-9 w-64 max-w-full animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-full max-w-md animate-pulse rounded bg-muted/60" />
      </div>

      <div className="h-11 w-full max-w-md animate-pulse rounded-full border border-border/60 bg-muted/40" />

      <div className="space-y-3.5">
        {Array.from({ length: 3 }).map((_, index) => (
          <AppointmentCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}
