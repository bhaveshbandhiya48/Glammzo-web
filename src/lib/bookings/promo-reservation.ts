/** Shared one-time promo reservation rules (launch + salon offers). */

/** Open bookings hold a promo until completed or cancelled. */
export const PROMO_RESERVING_STATUSES = new Set([
  "pending",
  "scheduled",
  "confirmed",
  "checked_in",
  "in_progress",
])

/** Terminal statuses that permanently consume a one-time promo. */
export const PROMO_CONSUMED_STATUSES = new Set(["completed"])

export type PromoReservationRow = {
  status: string
}

export type PromoReservationResult =
  | { ok: true }
  | {
      ok: false
      reason: "already_used" | "reserved"
      message: string
    }

/**
 * - Completed booking with promo tag → permanently used
 * - Open booking with promo tag → reserved
 * - Cancelled / expired / declined / no-show → released (eligible again)
 */
export function evaluatePromoReservations(
  rows: PromoReservationRow[],
  messages: { alreadyUsed: string; reserved: string },
  opts?: { permanentlyConsumed?: boolean },
): PromoReservationResult {
  if (opts?.permanentlyConsumed) {
    return {
      ok: false,
      reason: "already_used",
      message: messages.alreadyUsed,
    }
  }

  let reserved = false

  for (const row of rows) {
    const status = row.status.trim().toLowerCase()
    if (PROMO_CONSUMED_STATUSES.has(status)) {
      return {
        ok: false,
        reason: "already_used",
        message: messages.alreadyUsed,
      }
    }
    if (PROMO_RESERVING_STATUSES.has(status)) {
      reserved = true
    }
  }

  if (reserved) {
    return {
      ok: false,
      reason: "reserved",
      message: messages.reserved,
    }
  }

  return { ok: true }
}
