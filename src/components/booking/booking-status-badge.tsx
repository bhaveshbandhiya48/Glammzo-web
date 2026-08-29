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
      return "border-amber-400 bg-amber-50 text-amber-800"
    case "confirmed":
    case "upcoming":
      return "border-blue-400 bg-blue-50 text-blue-800"
    case "completed":
      return "border-emerald-400 bg-emerald-50 text-emerald-800"
    case "cancelled":
      return "border-rose-400 bg-rose-50 text-rose-800"
    case "declined":
      return "border-red-400 bg-red-50 text-red-800"
    case "expired":
      return "border-orange-400 bg-orange-50 text-orange-800"
    default:
      return "border-border bg-secondary text-foreground/70"
  }
}

function statusDotClasses(status: BookingStatus) {
  switch (status) {
    case "pending":
      return "bg-amber-500"
    case "confirmed":
    case "upcoming":
      return "bg-blue-500"
    case "completed":
      return "bg-emerald-500"
    case "cancelled":
      return "bg-rose-500"
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
        "inline-flex h-8 w-fit max-w-full shrink-0 items-center gap-2 rounded-full border px-3.5 text-xs font-semibold tracking-[0.01em] whitespace-nowrap shadow-sm transition-colors duration-200",
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
