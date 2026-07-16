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
      return "border-amber-200/80 bg-amber-50 text-amber-900"
    case "confirmed":
    case "upcoming":
      return "border-emerald-200/80 bg-emerald-50 text-emerald-900"
    case "completed":
      return "border-border/70 bg-muted text-foreground/70"
    case "cancelled":
      return "border-border/80 bg-secondary text-foreground/60"
    case "declined":
      return "border-red-200/70 bg-red-50 text-red-800"
    case "expired":
      return "border-orange-200/70 bg-orange-50 text-orange-900"
    default:
      return "border-border/70 bg-secondary text-foreground/65"
  }
}

export function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex h-7 w-fit shrink-0 items-center justify-center rounded-full border px-3 text-[0.7rem] font-semibold tracking-[0.02em] whitespace-nowrap transition-colors duration-200",
        statusClasses(status),
        className,
      )}
    >
      {getBookingStatusLabel(status)}
    </span>
  )
}
