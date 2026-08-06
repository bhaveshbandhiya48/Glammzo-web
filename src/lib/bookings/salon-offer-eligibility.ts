import "server-only"

import {
  evaluateSalonOfferReservations,
  salonOfferIdNoteNeedle,
  salonOfferSignInMessage,
  type SalonOfferEligibility,
} from "@/lib/bookings/salon-offer-eligibility-rules"
import { normalizeCustomerPhoneDigits } from "@/lib/phone/normalize"
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin"

export {
  evaluateSalonOfferReservations,
  SALON_OFFER_ID_NOTE_MARKER,
  salonOfferAlreadyUsedMessage,
  salonOfferIdNoteNeedle,
  salonOfferReservedMessage,
  salonOfferSignInMessage,
  type SalonOfferEligibility,
} from "@/lib/bookings/salon-offer-eligibility-rules"

export async function getSalonOfferEligibility(input: {
  phone: string | null | undefined
  offerId: string
  code: string
}): Promise<SalonOfferEligibility> {
  const phoneDigits = input.phone ? normalizeCustomerPhoneDigits(input.phone) : ""
  if (!phoneDigits) {
    return {
      ok: false,
      reason: "sign_in_required",
      message: salonOfferSignInMessage(),
    }
  }

  if (!isSupabaseConfigured()) {
    return { ok: true }
  }

  const supabase = createAdminClient()
  const needle = salonOfferIdNoteNeedle(input.offerId)

  const { data: appointmentRows, error } = await supabase
    .from("appointments")
    .select("id, status, customers!inner(phone_normalized)")
    .eq("customers.phone_normalized", phoneDigits)
    .is("deleted_at", null)
    .ilike("internal_notes", `%${needle}%`)

  if (error) {
    console.error("[salon-offer] reservation lookup failed:", error.message)
    return { ok: true }
  }

  return evaluateSalonOfferReservations(
    (appointmentRows ?? []).map((row) => ({
      status: String((row as { status: string }).status ?? ""),
    })),
    input.code,
  )
}
