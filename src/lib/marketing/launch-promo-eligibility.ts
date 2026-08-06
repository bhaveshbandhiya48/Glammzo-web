import "server-only"

import {
  evaluateLaunchPromoReservations,
  LAUNCH_CASHBACK_NOTE_MARKER,
  launchPromoAlreadyUsedMessage,
  launchPromoSignInMessage,
  type LaunchPromoEligibility,
} from "@/lib/marketing/launch-promo-eligibility-rules"
import { normalizeCustomerPhoneDigits } from "@/lib/phone/normalize"
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin"

export {
  evaluateLaunchPromoReservations,
  LAUNCH_CASHBACK_NOTE_MARKER,
  LAUNCH_PROMO_CONSUMED_STATUSES,
  LAUNCH_PROMO_RESERVING_STATUSES,
  launchPromoAlreadyUsedMessage,
  launchPromoReservedMessage,
  launchPromoSignInMessage,
  type LaunchPromoEligibility,
  type LaunchPromoReservationRow,
} from "@/lib/marketing/launch-promo-eligibility-rules"

export async function getLaunchPromoEligibility(
  phone: string | null | undefined,
): Promise<LaunchPromoEligibility> {
  const phoneDigits = phone ? normalizeCustomerPhoneDigits(phone) : ""
  if (!phoneDigits) {
    return {
      ok: false,
      reason: "sign_in_required",
      message: launchPromoSignInMessage(),
    }
  }

  if (!isSupabaseConfigured()) {
    return { ok: true }
  }

  const supabase = createAdminClient()

  const { data: cashbackRow, error: cashbackError } = await supabase
    .from("wallet_ledger")
    .select("id")
    .eq("phone_normalized", phoneDigits)
    .eq("reason", "cashback_first200")
    .limit(1)
    .maybeSingle()

  if (cashbackError && !isMissingRelationError(cashbackError)) {
    console.error(
      "[launch-promo] cashback lookup failed:",
      cashbackError.message,
    )
  }

  const { data: appointmentRows, error: appointmentError } = await supabase
    .from("appointments")
    .select("id, status, customers!inner(phone_normalized)")
    .eq("customers.phone_normalized", phoneDigits)
    .is("deleted_at", null)
    .ilike("internal_notes", `%${LAUNCH_CASHBACK_NOTE_MARKER}%`)

  if (appointmentError) {
    console.error(
      "[launch-promo] reservation lookup failed:",
      appointmentError.message,
    )
    // Fail closed only when cashback already credited; otherwise allow apply
    // rather than blocking all launch bookings on a query failure.
    if (cashbackRow) {
      return {
        ok: false,
        reason: "already_used",
        message: launchPromoAlreadyUsedMessage(),
      }
    }
    return { ok: true }
  }

  return evaluateLaunchPromoReservations(
    (appointmentRows ?? []).map((row) => ({
      status: String((row as { status: string }).status ?? ""),
    })),
    { cashbackAlreadyCredited: Boolean(cashbackRow) },
  )
}

function isMissingRelationError(error: { code?: string; message?: string }) {
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    Boolean(error.message?.includes("schema cache")) ||
    Boolean(error.message?.includes("does not exist"))
  )
}
