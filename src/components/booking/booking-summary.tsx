import type { SalonService } from "@/types/salon"
import { formatDuration, sumServiceDuration, sumServicePrice } from "@/lib/bookings/utils"

type BookingSummaryProps = {
  services: SalonService[]
  emptyLabel?: string
  compact?: boolean
}

export function BookingSummary({
  services,
  emptyLabel = "Select at least one service to see your estimate.",
  compact = false,
}: BookingSummaryProps) {
  if (services.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-foreground/60">{emptyLabel}</p>
    )
  }

  const total = sumServicePrice(services)
  const duration = sumServiceDuration(services)

  if (compact) {
    return (
      <div className="space-y-1">
        <p className="font-heading text-3xl font-semibold tabular-nums sm:text-4xl">₹{total}</p>
        <p className="text-sm text-foreground/60">
          {services.length} service{services.length === 1 ? "" : "s"} · ~{formatDuration(duration)}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-accent/40 p-5">
      <p className="text-sm text-foreground/60">Estimated total</p>
      <p className="mt-1 font-heading text-2xl font-semibold tabular-nums">₹{total}</p>
      <p className="mt-1 text-sm text-foreground/60">
        {services.length} service{services.length === 1 ? "" : "s"} · ~{formatDuration(duration)} at the salon
      </p>
      <ul className="mt-4 space-y-2 border-t border-border/60 pt-4">
        {services.map((svc) => (
          <li key={svc.id} className="flex items-start justify-between gap-3 text-sm">
            <span className="text-foreground/75">{svc.name}</span>
            <span className="shrink-0 tabular-nums text-foreground/60">
              ₹{svc.price} · {svc.durationMin} min
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
