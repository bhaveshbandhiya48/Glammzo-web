import "server-only"

import {
  evaluateSalonOfferReservations,
  salonOfferIdNoteNeedle,
  salonOfferNewCustomerOnlyMessage,
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
  salonOfferNewCustomerOnlyMessage,
  salonOfferReservedMessage,
  salonOfferSignInMessage,
  type SalonOfferEligibility,
} from "@/lib/bookings/salon-offer-eligibility-rules"

export async function getSalonOfferEligibility(input: {
  phone: string | null | undefined
  offerId: string
  code: string
  salonId: string
  customerEligibility?: "all_customers" | "new_customers_only"
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

  if (input.customerEligibility === "new_customers_only") {
    const { data: completedRows, error: completedError } = await supabase
      .from("appointments")
      .select("id, customers!inner(phone_normalized)")
      .eq("salon_id", input.salonId)
      .eq("status", "completed")
      .eq("customers.phone_normalized", phoneDigits)
      .is("deleted_at", null)
      .limit(1)

    if (completedError) {
      console.error("[salon-offer] new-customer lookup failed:", completedError.message)
    } else if ((completedRows ?? []).length > 0) {
      return {
        ok: false,
        reason: "new_customers_only",
        message: salonOfferNewCustomerOnlyMessage(input.code),
      }
    }
  }

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
