/** Minimum notice before appointment start for customer self-cancel. */
export const CUSTOMER_CANCEL_MIN_NOTICE_HOURS = 2

/** Cancels above this count in a calendar month flag the customer for future booking-fee rules. */
export const HIGH_CANCELLATION_MONTHLY_THRESHOLD = 2

export const CUSTOMER_CANCEL_ENTITY_TYPE = "web_cancel"

export function buildCustomerCancelDedupeKey(appointmentId: string) {
  return `web_cancel:${appointmentId}`
}

export function calendarMonthKey(date = new Date()) {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

/**
 * Customer may cancel only when appointment start is more than
 * CUSTOMER_CANCEL_MIN_NOTICE_HOURS away.
 */
export function canCancelWithNotice(startsAtIso: string | null | undefined, now = new Date()) {
  if (!startsAtIso) {
    return { allowed: false as const, reason: "missing_start" as const }
  }

  const startsAt = new Date(startsAtIso)
  if (Number.isNaN(startsAt.getTime())) {
    return { allowed: false as const, reason: "missing_start" as const }
  }

  const msUntilStart = startsAt.getTime() - now.getTime()
  const minMs = CUSTOMER_CANCEL_MIN_NOTICE_HOURS * 60 * 60 * 1000

  if (msUntilStart < minMs) {
    return { allowed: false as const, reason: "too_soon" as const, startsAt }
  }

  return { allowed: true as const, startsAt }
}
