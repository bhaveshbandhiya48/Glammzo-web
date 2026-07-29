import type { BookingStatus } from "@/types/booking"
import { getBookingStatusLabel } from "@/lib/bookings/booking-status"
import { cn } from "@/lib/utils"

type BookingStatusBadgeProps = {
  status: BookingStatus
  className?: string
}

function statusClasses(status: BookingStatus) {
  switch (status) {
    case "pending":
      return "border-amber-300/90 bg-amber-50 text-amber-950 ring-amber-200/60"
    case "confirmed":
    case "upcoming":
      return "border-emerald-300/90 bg-emerald-50 text-emerald-950 ring-emerald-200/60"
    case "completed":
      return "border-border/80 bg-muted/80 text-foreground/75 ring-border/50"
    case "cancelled":
      return "border-border/80 bg-secondary text-foreground/65 ring-border/40"
    case "declined":
      return "border-red-300/80 bg-red-50 text-red-900 ring-red-200/50"
    case "expired":
      return "border-orange-300/80 bg-orange-50 text-orange-950 ring-orange-200/50"
    default:
      return "border-border/70 bg-secondary text-foreground/70 ring-border/40"
  }
}

function statusDotClasses(status: BookingStatus) {
  switch (status) {
    case "pending":
      return "bg-amber-500"
    case "confirmed":
    case "upcoming":
      return "bg-emerald-500"
    case "completed":
      return "bg-foreground/35"
    case "cancelled":
      return "bg-foreground/30"
    case "declined":
      return "bg-red-500"
    case "expired":
      return "bg-orange-500"
    default:
      return "bg-foreground/35"
  }
}

export function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
  return (
    <span
      data-slot="badge"
      role="status"
      className={cn(
        "inline-flex h-8 w-fit max-w-full shrink-0 items-center gap-2 rounded-full border px-3.5 text-xs font-semibold tracking-[0.01em] whitespace-nowrap shadow-sm ring-1 ring-inset transition-colors duration-200",
        statusClasses(status),
        className,
      )}
    >
      <span
        className={cn("size-2 shrink-0 rounded-full", statusDotClasses(status))}
        aria-hidden
      />
      <span className="truncate">{getBookingStatusLabel(status)}</span>
    </span>
  )
}
