import type { BookingStatus } from "@/types/booking"
import { getBookingStatusLabel } from "@/lib/bookings/booking-status"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type BookingStatusBadgeProps = {
  status: BookingStatus
  className?: string
}

export function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
  const variant =
    status === "confirmed" || status === "upcoming"
      ? "default"
      : status === "pending"
        ? "secondary"
        : status === "declined"
          ? "destructive"
          : "secondary"

  return (
    <Badge variant={variant} className={cn("rounded-full capitalize", className)}>
      {getBookingStatusLabel(status)}
    </Badge>
  )
}
