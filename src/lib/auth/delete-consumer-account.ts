import "server-only"

import { createHash } from "crypto"

import { normalizeCustomerPhoneDigits } from "@/lib/phone/normalize"
import { deleteMobilePushToken } from "@/lib/push/mobile-push-tokens"
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin"

function missingTable(error: { code?: string; message?: string } | null | undefined) {
  if (!error) return false
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    Boolean(error.message?.includes("schema cache")) ||
    Boolean(error.message?.includes("does not exist"))
  )
}

function deletedPhoneKey(phoneDigits: string) {
  const hash = createHash("sha256").update(phoneDigits).digest("hex").slice(0, 24)
  return `d_${hash}`
}

async function ignoreMissing(
  label: string,
  run: () => PromiseLike<{ error: { code?: string; message?: string } | null }>,
) {
  const { error } = await run()
  if (!error) return
  if (missingTable(error)) {
    console.warn(`[delete-account] skip ${label}: table missing`)
    return
  }
  console.error(`[delete-account] ${label} failed:`, error.message)
}

/**
 * Wipe platform account data for a consumer phone.
 * Booking rows are retained; salon customer PII is anonymized for retention.
 */
export async function deleteConsumerAccount(phone: string): Promise<{ ok: boolean; message?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Account deletion is not configured." }
  }

  const phoneDigits = normalizeCustomerPhoneDigits(phone)
  if (!phoneDigits) {
    return { ok: false, message: "Invalid account phone." }
  }

  const supabase = createAdminClient()
  const now = new Date().toISOString()
  const anonymizedPhone = deletedPhoneKey(phoneDigits)

  await ignoreMissing("consumer_profiles", () =>
    supabase.from("consumer_profiles").delete().eq("consumer_phone_normalized", phoneDigits),
  )

  await ignoreMissing("consumer_favorite_salons", () =>
    supabase.from("consumer_favorite_salons").delete().eq("consumer_phone_normalized", phoneDigits),
  )

  await deleteMobilePushToken({ phone: phoneDigits })

  await ignoreMissing("customer_wallets", () =>
    supabase.from("customer_wallets").delete().eq("phone_normalized", phoneDigits),
  )

  await ignoreMissing("customer_loyalty", () =>
    supabase.from("customer_loyalty").delete().eq("phone_normalized", phoneDigits),
  )

  await ignoreMissing("wallet_ledger", () =>
    supabase
      .from("wallet_ledger")
      .update({ phone_normalized: anonymizedPhone })
      .eq("phone_normalized", phoneDigits),
  )

  await ignoreMissing("customers anonymize", () =>
    supabase
      .from("customers")
      .update({
        full_name: "Deleted user",
        first_name: "Deleted",
        last_name: "user",
        email: null,
        phone: anonymizedPhone,
        phone_normalized: anonymizedPhone,
        gender: null,
        date_of_birth: null,
        address: null,
        marketing_opt_in: false,
        deleted_at: now,
      })
      .eq("phone_normalized", phoneDigits),
  )

  return { ok: true }
}
