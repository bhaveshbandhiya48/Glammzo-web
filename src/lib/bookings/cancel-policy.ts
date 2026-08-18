/** Fallback when a salon has no active cancellation policy. */
export const CUSTOMER_CANCEL_MIN_NOTICE_HOURS = 2

/** Minimum notice before appointment start for customer self-reschedule. */
export const CUSTOMER_RESCHEDULE_MIN_NOTICE_HOURS = 4

export const CUSTOMER_CANCEL_MAX_NOTICE_HOURS = 168

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

export function clampCancelNoticeHours(hours: unknown): number {
  const parsed =
    typeof hours === "number"
      ? hours
      : typeof hours === "string" && hours.trim()
        ? Number(hours)
        : Number.NaN
  if (!Number.isFinite(parsed)) {
    return CUSTOMER_CANCEL_MIN_NOTICE_HOURS
  }
  return Math.max(0, Math.min(Math.round(parsed), CUSTOMER_CANCEL_MAX_NOTICE_HOURS))
}

export function resolveCustomerCancelNoticeHours(
  policy?: { active?: boolean; freeCancelHours?: number } | null,
): number {
  if (policy?.active === true) {
    return clampCancelNoticeHours(policy.freeCancelHours)
  }
  return CUSTOMER_CANCEL_MIN_NOTICE_HOURS
}

export function parseSalonCancelPolicyFromSettings(settings: unknown): {
  active: boolean
  freeCancelHours: number
} | null {
  if (!settings || typeof settings !== "object") return null
  const cancellation = (settings as { policies?: { cancellation?: unknown } }).policies
    ?.cancellation
  if (!cancellation || typeof cancellation !== "object") return null

  const row = cancellation as { active?: unknown; freeCancelHours?: unknown }
  const active = row.active === true
  if (!active) {
    return { active: false, freeCancelHours: CUSTOMER_CANCEL_MIN_NOTICE_HOURS }
  }

  return {
    active: true,
    freeCancelHours: clampCancelNoticeHours(row.freeCancelHours),
  }
}

export function getCustomerCancelBlockedMessage(noticeHours: number) {
  if (noticeHours <= 0) {
    return "This booking can no longer be cancelled online. Please contact the salon if you need help."
  }
  return `Cancellations must be made at least ${noticeHours} hours before your appointment. Please contact the salon if you need help.`
}

type NoticeResult =
  | { allowed: true; startsAt: Date }
  | { allowed: false; reason: "missing_start" | "too_soon"; startsAt?: Date }

function canChangeWithNotice(
  startsAtIso: string | null | undefined,
  minNoticeHours: number,
  now = new Date(),
): NoticeResult {
  if (!startsAtIso) {
    return { allowed: false, reason: "missing_start" }
  }

  const startsAt = new Date(startsAtIso)
  if (Number.isNaN(startsAt.getTime())) {
    return { allowed: false, reason: "missing_start" }
  }

  const msUntilStart = startsAt.getTime() - now.getTime()
  const minMs = minNoticeHours * 60 * 60 * 1000

  if (msUntilStart < minMs) {
    return { allowed: false, reason: "too_soon", startsAt }
  }

  return { allowed: true, startsAt }
}

/**
 * Customer may cancel only when appointment start is more than
 * `minNoticeHours` away (salon policy, or platform default).
 */
export function canCancelWithNotice(
  startsAtIso: string | null | undefined,
  minNoticeHours: number = CUSTOMER_CANCEL_MIN_NOTICE_HOURS,
  now = new Date(),
) {
  return canChangeWithNotice(startsAtIso, minNoticeHours, now)
}

/**
 * Customer may reschedule only when appointment start is more than
 * CUSTOMER_RESCHEDULE_MIN_NOTICE_HOURS away.
 */
export function canRescheduleWithNotice(
  startsAtIso: string | null | undefined,
  now = new Date(),
) {
  return canChangeWithNotice(startsAtIso, CUSTOMER_RESCHEDULE_MIN_NOTICE_HOURS, now)
}
