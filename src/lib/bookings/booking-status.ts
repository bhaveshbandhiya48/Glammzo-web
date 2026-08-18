import type { BookingStatus } from "@/types/booking"
import {
  canCancelWithNotice,
  canRescheduleWithNotice,
  CUSTOMER_CANCEL_MIN_NOTICE_HOURS,
  CUSTOMER_RESCHEDULE_MIN_NOTICE_HOURS,
  getCustomerCancelBlockedMessage,
} from "@/lib/bookings/cancel-policy"

export const BOOKING_SOURCE_GLAMZZO_WEB = "glamzzo_web" as const
export const WEB_BOOKING_SOURCE_TAG = "source:glamzzo_web" as const
export const SALON_DECLINED_REASON_PREFIX = "Salon declined" as const
export const CUSTOMER_CANCELLED_REASON = "Cancelled by customer on Glammzo web" as const

export const CUSTOMER_CANCEL_REASON_OPTIONS = [
  { id: "change_of_plans", label: "Change of plans" },
  { id: "different_time", label: "Need a different time" },
  { id: "found_another", label: "Found another option" },
  { id: "personal", label: "Personal reasons" },
  { id: "other", label: "Other" },
] as const

export type CustomerCancelReasonId =
  (typeof CUSTOMER_CANCEL_REASON_OPTIONS)[number]["id"]

export function formatCustomerCancellationReason(input: {
  reasonId: string
  details?: string
}): string | null {
  const option = CUSTOMER_CANCEL_REASON_OPTIONS.find((item) => item.id === input.reasonId)
  if (!option) return null

  const details = input.details?.trim() ?? ""
  if (option.id === "other") {
    if (!details) return null
    return `${CUSTOMER_CANCELLED_REASON}: ${details}`
  }

  if (details) {
    return `${CUSTOMER_CANCELLED_REASON}: ${option.label} — ${details}`
  }

  return `${CUSTOMER_CANCELLED_REASON}: ${option.label}`
}

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
  /** When set, past-deadline pending web bookings show as expired even before cron flips status. */
  expiresAt?: string | null
}): BookingStatus {
  const isWebBooking = isWebBookingAppointment({
    bookingSource: input.bookingSource,
    internalNotes: input.internalNotes,
  })

  if (input.status === "rejected") {
    return "declined"
  }

  if (input.status === "expired") {
    return "expired"
  }

  if (
    isWebBooking &&
    (input.status === "pending" || input.status === "scheduled") &&
    input.expiresAt
  ) {
    const expiresMs = new Date(input.expiresAt).getTime()
    if (Number.isFinite(expiresMs) && expiresMs <= Date.now()) {
      return "expired"
    }
  }

  if (input.status === "pending" && isWebBooking) {
    return "pending"
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
      return "Pending Confirmation"
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

export function canConsumerCancelBooking(
  status: BookingStatus,
  startsAtIso?: string | null,
  noticeHours: number = CUSTOMER_CANCEL_MIN_NOTICE_HOURS,
) {
  if (status !== "pending" && status !== "confirmed" && status !== "upcoming") {
    return false
  }
  if (startsAtIso === undefined) {
    // Legacy callers without start time keep status-only check.
    return true
  }
  return canCancelWithNotice(startsAtIso, noticeHours).allowed
}

export function getConsumerCancelBlockedReason(
  startsAtIso?: string | null,
  noticeHours: number = CUSTOMER_CANCEL_MIN_NOTICE_HOURS,
) {
  if (startsAtIso == null) return null
  const result = canCancelWithNotice(startsAtIso, noticeHours)
  if (result.allowed) return null
  if (result.reason === "too_soon") {
    return getCustomerCancelBlockedMessage(noticeHours)
  }
  return "This booking can no longer be cancelled online."
}

export function canConsumerRescheduleBooking(
  status: BookingStatus,
  startsAtIso?: string | null,
) {
  if (status !== "pending" && status !== "confirmed" && status !== "upcoming") {
    return false
  }
  if (startsAtIso === undefined) {
    // Legacy callers without start time keep status-only check.
    return true
  }
  return canRescheduleWithNotice(startsAtIso).allowed
}

export function getConsumerRescheduleBlockedReason(startsAtIso?: string | null) {
  if (startsAtIso == null) return null
  const result = canRescheduleWithNotice(startsAtIso)
  if (result.allowed) return null
  if (result.reason === "too_soon") {
    return `Reschedules must be made at least ${CUSTOMER_RESCHEDULE_MIN_NOTICE_HOURS} hours before your appointment. Please contact the salon if you need help.`
  }
  return "This booking can no longer be rescheduled online."
}

export function canConsumerRebookBooking(status: BookingStatus) {
  return status === "completed" || status === "cancelled" || status === "declined" || status === "expired"
}

/**
 * UI: customer can leave a review for visits shown as completed,
 * when we have a CRM appointment id and no review yet.
 */
export function canLeaveBookingReview(input: {
  status: BookingStatus
  crmAppointmentId?: string | null
  hasVerifiedReview?: boolean
}) {
  return (
    input.status === "completed" &&
    Boolean(input.crmAppointmentId) &&
    !input.hasVerifiedReview
  )
}

/**
 * Server: allow reviews for CRM `completed`, or for past visits still in
 * confirmed / checked_in / in_progress (UI already labels those "Completed").
 */
export function isCrmAppointmentEligibleForReview(input: {
  status: string
  appointmentDate: string
}) {
  if (input.status === "completed") return true

  if (
    input.status !== "confirmed" &&
    input.status !== "checked_in" &&
    input.status !== "in_progress"
  ) {
    return false
  }

  const today = new Date().toISOString().slice(0, 10)
  return input.appointmentDate < today
}

