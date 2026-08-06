import { LAUNCH_PROMO_CODE } from "@/lib/marketing/launch-promo"
import {
  evaluatePromoReservations,
  PROMO_CONSUMED_STATUSES,
  PROMO_RESERVING_STATUSES,
  type PromoReservationRow,
} from "@/lib/bookings/promo-reservation"

/** Marker written to appointment.internal_notes when launch promo is claimed. */
export const LAUNCH_CASHBACK_NOTE_MARKER = "launch_cashback:"

/** @deprecated Prefer PROMO_RESERVING_STATUSES */
export const LAUNCH_PROMO_RESERVING_STATUSES = PROMO_RESERVING_STATUSES

/** @deprecated Prefer PROMO_CONSUMED_STATUSES */
export const LAUNCH_PROMO_CONSUMED_STATUSES = PROMO_CONSUMED_STATUSES

export type LaunchPromoEligibility =
  | { ok: true }
  | {
      ok: false
      reason: "already_used" | "reserved" | "sign_in_required"
      message: string
    }

export type LaunchPromoReservationRow = PromoReservationRow

export function launchPromoAlreadyUsedMessage() {
  return `You've already used ${LAUNCH_PROMO_CODE}. This launch offer is one-time only.`
}

export function launchPromoReservedMessage() {
  return `You've already applied ${LAUNCH_PROMO_CODE} on another booking. Complete or cancel that booking before using it again.`
}

export function launchPromoSignInMessage() {
  return `Sign in to apply ${LAUNCH_PROMO_CODE}.`
}

export function evaluateLaunchPromoReservations(
  rows: LaunchPromoReservationRow[],
  opts?: { cashbackAlreadyCredited?: boolean },
): LaunchPromoEligibility {
  return evaluatePromoReservations(
    rows,
    {
      alreadyUsed: launchPromoAlreadyUsedMessage(),
      reserved: launchPromoReservedMessage(),
    },
    { permanentlyConsumed: opts?.cashbackAlreadyCredited },
  )
}
