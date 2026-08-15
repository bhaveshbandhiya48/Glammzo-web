import "server-only"

import { normalizeCustomerPhoneDigits } from "@/lib/phone/normalize"
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin"

export type MobilePushPlatform = "ios" | "android" | "web" | "unknown"

function isMissingPushTokensTable(error: { code?: string; message?: string }) {
  return (
    error.code === "PGRST205" ||
    Boolean(error.message?.includes("mobile_push_tokens")) ||
    Boolean(error.message?.includes("schema cache"))
  )
}

export async function upsertMobilePushToken(input: {
  phone: string
  expoPushToken: string
  platform?: MobilePushPlatform | null
  deviceId?: string | null
}): Promise<{ ok: boolean; missingTable?: boolean }> {
  if (!isSupabaseConfigured()) return { ok: false }

  const phoneDigits = normalizeCustomerPhoneDigits(input.phone)
  const token = input.expoPushToken.trim()
  if (!phoneDigits || !token) return { ok: false }

  const supabase = createAdminClient()
  const now = new Date().toISOString()

  const { error } = await supabase.from("mobile_push_tokens").upsert(
    {
      consumer_phone_normalized: phoneDigits,
      expo_push_token: token,
      platform: input.platform ?? null,
      device_id: input.deviceId?.trim() || null,
      updated_at: now,
    },
    { onConflict: "expo_push_token" },
  )

  if (error) {
    if (isMissingPushTokensTable(error)) {
      console.warn(
        "[mobile-push] mobile_push_tokens missing — run scripts/apply-mobile-push-tokens-migration.sql",
      )
      return { ok: false, missingTable: true }
    }
    console.error("[mobile-push] upsert failed:", error.message)
    return { ok: false }
  }

  return { ok: true }
}

export async function deleteMobilePushToken(input: {
  phone: string
  expoPushToken?: string
}): Promise<boolean> {
  if (!isSupabaseConfigured()) return false

  const phoneDigits = normalizeCustomerPhoneDigits(input.phone)
  if (!phoneDigits) return false

  const supabase = createAdminClient()
  let query = supabase
    .from("mobile_push_tokens")
    .delete()
    .eq("consumer_phone_normalized", phoneDigits)

  if (input.expoPushToken?.trim()) {
    query = query.eq("expo_push_token", input.expoPushToken.trim())
  }

  const { error } = await query
  if (error) {
    if (!isMissingPushTokensTable(error)) {
      console.error("[mobile-push] delete failed:", error.message)
    }
    return false
  }
  return true
}

export async function listMobilePushTokensForPhone(phone: string): Promise<string[]> {
  if (!isSupabaseConfigured()) return []

  const phoneDigits = normalizeCustomerPhoneDigits(phone)
  if (!phoneDigits) return []

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("mobile_push_tokens")
    .select("expo_push_token")
    .eq("consumer_phone_normalized", phoneDigits)

  if (error) {
    if (!isMissingPushTokensTable(error)) {
      console.error("[mobile-push] list failed:", error.message)
    }
    return []
  }

  return (data ?? [])
    .map((row) => (row as { expo_push_token?: string }).expo_push_token?.trim() ?? "")
    .filter(Boolean)
}
