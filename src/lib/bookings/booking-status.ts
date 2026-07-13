import type { BookingStatus } from "@/types/booking"

export const BOOKING_SOURCE_GLAMZZO_WEB = "glamzzo_web" as const
export const WEB_BOOKING_SOURCE_TAG = "source:glamzzo_web" as const
export const SALON_DECLINED_REASON_PREFIX = "Salon declined" as const
export const CUSTOMER_CANCELLED_REASON = "Cancelled by customer on Glammzo web" as const

export function isWebBookingAppointment(input: {
  bookingSource?: string | null
  internalNotes?: string | null
}) {
  return (
    input.bookingSource === BOOKING_SOURCE_GLAMZZO_WEB ||
    input.internalNotes === WEB_BOOKING_SOURCE_TAG
  )
}

export function mapCrmAppointmentToBookingStatus(input: {
  status: string
  appointmentDate: string
  cancellationReason?: string | null
  rejectReason?: string | null
  bookingSource?: string | null
  internalNotes?: string | null
}): BookingStatus {
  const isWebBooking = isWebBookingAppointment({
    bookingSource: input.bookingSource,
    internalNotes: input.internalNotes,
  })

  if (input.status === "pending" && isWebBooking) {
    return "pending"
  }

  if (input.status === "rejected") {
    return "declined"
  }

  if (input.status === "expired") {
    return "expired"
  }

  if (input.status === "cancelled_by_customer") {
    return "cancelled"
  }

  if (input.status === "cancelled" || input.status === "no_show") {
    if (
      input.cancellationReason?.startsWith(SALON_DECLINED_REASON_PREFIX) ||
      input.cancellationReason === SALON_DECLINED_REASON_PREFIX
    ) {
      return "declined"
    }
    return "cancelled"
  }

  if (input.status === "completed") {
    return "completed"
  }

  if (input.status === "scheduled" && isWebBooking) {
    return "pending"
  }

  if (input.status === "confirmed" || input.status === "checked_in" || input.status === "in_progress") {
    const today = new Date().toISOString().slice(0, 10)
    if (input.appointmentDate >= today) {
      return "confirmed"
    }
    return "completed"
  }

  const today = new Date().toISOString().slice(0, 10)
  if (input.appointmentDate >= today) {
    return "confirmed"
  }

  return "completed"
}

export function getBookingStatusLabel(status: BookingStatus): string {
  switch (status) {
    case "pending":
      return "Pending confirmation"
    case "confirmed":
      return "Confirmed"
    case "declined":
      return "Rejected"
    case "expired":
      return "Expired"
    case "cancelled":
      return "Cancelled"
    case "completed":
      return "Completed"
    case "upcoming":
      return "Upcoming"
    default:
      return status
  }
}

export function extractDeclineReasonForDisplay(input: {
  rejectReason?: string | null
  cancellationReason?: string | null
}) {
  if (input.rejectReason?.trim()) {
    return input.rejectReason.trim()
  }

  const cancellationReason = input.cancellationReason

  if (!cancellationReason?.trim()) {
    return null
  }

  if (cancellationReason === SALON_DECLINED_REASON_PREFIX) {
    return null
  }

  const prefix = `${SALON_DECLINED_REASON_PREFIX}: `
  if (cancellationReason.startsWith(prefix)) {
    return cancellationReason.slice(prefix.length).trim() || null
  }

  return null
}

export function canConsumerCancelBooking(status: BookingStatus) {
  return status === "pending" || status === "confirmed" || status === "upcoming"
}

export function canConsumerRescheduleBooking(status: BookingStatus) {
  return status === "pending" || status === "confirmed" || status === "upcoming"
}

export function canConsumerRebookBooking(status: BookingStatus) {
  return status === "completed" || status === "cancelled" || status === "declined" || status === "expired"
}
