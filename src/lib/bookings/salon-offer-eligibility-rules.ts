/** Pure rules for one-time salon promo redemption per customer. */

import {
  evaluatePromoReservations,
  type PromoReservationResult,
  type PromoReservationRow,
} from "@/lib/bookings/promo-reservation"

/** Marker written to appointment.internal_notes when a salon offer is applied. */
export const SALON_OFFER_ID_NOTE_MARKER = "offer_id:"

export type SalonOfferEligibility = PromoReservationResult | {
  ok: false
  reason: "sign_in_required" | "new_customers_only"
  message: string
}

export function salonOfferAlreadyUsedMessage(code: string) {
  return `You've already used ${code}. This promo is one-time only per customer.`
}

export function salonOfferReservedMessage(code: string) {
  return `You've already applied ${code} on another booking. Complete or cancel that booking before using it again.`
}

export function salonOfferSignInMessage() {
  return "Sign in to apply this promo code."
}

export function salonOfferNewCustomerOnlyMessage(code: string) {
  return `${code} is for new customers only at this salon.`
}

export function evaluateSalonOfferReservations(
  rows: PromoReservationRow[],
  code: string,
): PromoReservationResult {
  return evaluatePromoReservations(rows, {
    alreadyUsed: salonOfferAlreadyUsedMessage(code),
    reserved: salonOfferReservedMessage(code),
  })
}

export function salonOfferIdNoteNeedle(offerId: string) {
  return `${SALON_OFFER_ID_NOTE_MARKER}${offerId}`
}
