import type { Booking, BookingStatus } from "@/types/booking"

export const BOOKING_FILTERS = ["all", "upcoming", "completed", "cancelled"] as const

export type BookingFilter = (typeof BOOKING_FILTERS)[number]

const UPCOMING_STATUSES: BookingStatus[] = ["pending", "confirmed", "upcoming"]
const CANCELLED_STATUSES: BookingStatus[] = ["cancelled", "declined", "expired"]

export function parseBookingFilter(value: string | undefined): BookingFilter {
  if (value && BOOKING_FILTERS.includes(value as BookingFilter)) {
    return value as BookingFilter
  }
  return "all"
}

export function matchesBookingFilter(booking: Booking, filter: BookingFilter): boolean {
  switch (filter) {
    case "upcoming":
      return UPCOMING_STATUSES.includes(booking.status)
    case "completed":
      return booking.status === "completed"
    case "cancelled":
      return CANCELLED_STATUSES.includes(booking.status)
    default:
      return true
  }
}

export function filterBookings(bookings: Booking[], filter: BookingFilter): Booking[] {
  if (filter === "all") return bookings
  return bookings.filter((booking) => matchesBookingFilter(booking, filter))
}

export function getBookingFilterLabel(filter: BookingFilter): string {
  switch (filter) {
    case "upcoming":
      return "Upcoming"
    case "completed":
      return "Completed"
    case "cancelled":
      return "Cancelled"
    default:
      return "All"
  }
}

export function getBookingFilterEmptyMessage(filter: BookingFilter): string {
  switch (filter) {
    case "upcoming":
      return "No upcoming appointments right now."
    case "completed":
      return "No completed appointments yet."
    case "cancelled":
      return "No cancelled or declined appointments."
    default:
      return "You haven't booked anything yet."
  }
}
