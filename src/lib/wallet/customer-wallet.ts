import "server-only"

import { normalizeCustomerPhoneDigits } from "@/lib/phone/normalize"
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin"

import {
  FIRST_200_CAMPAIGN_CODE,
  FREE_SERVICE_CAP_PAISE,
  CASHBACK_REWARD_PAISE,
  CASHBACK_MIN_ORDER_PAISE,
  LOYALTY_DISCOUNT_CAP_PAISE,
} from "@/lib/wallet/wallet-constants"
import {
  computeWalletRedeemPaise,
  pickFreeServiceLine,
  pickLoyaltyDiscountLine,
} from "@/lib/wallet/wallet-math"

export {
  FIRST_200_CAMPAIGN_CODE,
  FREE_SERVICE_CAP_PAISE,
  CASHBACK_REWARD_PAISE,
  CASHBACK_MIN_ORDER_PAISE,
  LOYALTY_DISCOUNT_CAP_PAISE,
  computeWalletRedeemPaise,
  pickFreeServiceLine,
  pickLoyaltyDiscountLine,
}

export type CustomerWalletSummary = {
  balancePaise: number
  balanceRupees: number
}

export type CustomerLoyaltySummary = {
  completedVisits: number
  freeServiceCredits: number
  stampsTowardNextFree: number
}

export type PlatformCampaignSummary = {
  code: string
  title: string
  rewardPaise: number
  maxClaims: number
  claimsCount: number
  remainingClaims: number
  active: boolean
}

export type WalletLedgerEntry = {
  id: string
  deltaPaise: number
  reason: string
  createdAt: string
  appointmentId: string | null
}

function missingTable(error: { code?: string; message?: string } | null) {
  if (!error) return false
  return (
    error.code === "PGRST205" ||
    error.code === "42883" ||
    Boolean(error.message?.includes("schema cache")) ||
    Boolean(error.message?.includes("does not exist"))
  )
}

export function paiseToRupees(paise: number) {
  return Math.round(paise) / 100
}

export async function getCustomerWallet(
  phone: string,
): Promise<CustomerWalletSummary | null> {
  if (!isSupabaseConfigured()) return null
  const phoneDigits = normalizeCustomerPhoneDigits(phone)
  if (!phoneDigits) return null

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("customer_wallets")
    .select("balance_paise")
    .eq("phone_normalized", phoneDigits)
    .maybeSingle()

  if (error) {
    if (!missingTable(error)) {
      console.error("[wallet] getCustomerWallet failed:", error.message)
    }
    return { balancePaise: 0, balanceRupees: 0 }
  }

  const balancePaise = Number(data?.balance_paise ?? 0)
  return { balancePaise, balanceRupees: paiseToRupees(balancePaise) }
}

export async function getCustomerLoyalty(
  phone: string,
): Promise<CustomerLoyaltySummary | null> {
  if (!isSupabaseConfigured()) return null
  const phoneDigits = normalizeCustomerPhoneDigits(phone)
  if (!phoneDigits) return null

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("customer_loyalty")
    .select("completed_visits, free_service_credits")
    .eq("phone_normalized", phoneDigits)
    .maybeSingle()

  if (error) {
    if (!missingTable(error)) {
      console.error("[wallet] getCustomerLoyalty failed:", error.message)
    }
    return { completedVisits: 0, freeServiceCredits: 0, stampsTowardNextFree: 0 }
  }

  const completedVisits = Number(data?.completed_visits ?? 0)
  const freeServiceCredits = Number(data?.free_service_credits ?? 0)
  return {
    completedVisits,
    freeServiceCredits,
    stampsTowardNextFree: completedVisits % 10,
  }
}

export async function getFirst200Campaign(): Promise<PlatformCampaignSummary | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("platform_campaigns")
    .select("code, title, reward_paise, max_claims, claims_count, active")
    .eq("code", FIRST_200_CAMPAIGN_CODE)
    .maybeSingle()

  if (error || !data) {
    if (error && !missingTable(error)) {
      console.error("[wallet] getFirst200Campaign failed:", error.message)
    }
    return null
  }

  const maxClaims = Number(data.max_claims)
  const claimsCount = Number(data.claims_count)
  return {
    code: data.code,
    title: data.title,
    rewardPaise: Number(data.reward_paise),
    maxClaims,
    claimsCount,
    remainingClaims: Math.max(0, maxClaims - claimsCount),
    active: Boolean(data.active) && claimsCount < maxClaims,
  }
}

export async function listWalletLedger(
  phone: string,
  limit = 30,
): Promise<WalletLedgerEntry[]> {
  if (!isSupabaseConfigured()) return []
  const phoneDigits = normalizeCustomerPhoneDigits(phone)
  if (!phoneDigits) return []

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("wallet_ledger")
    .select("id, delta_paise, reason, created_at, appointment_id")
    .eq("phone_normalized", phoneDigits)
    .neq("reason", "free_service_settle")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    if (!missingTable(error)) {
      console.error("[wallet] listWalletLedger failed:", error.message)
    }
    return []
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    deltaPaise: Number(row.delta_paise),
    reason: String(row.reason),
    createdAt: String(row.created_at),
    appointmentId: (row.appointment_id as string | null) ?? null,
  }))
}

export async function debitCustomerWallet(input: {
  phone: string
  amountPaise: number
  appointmentId: string
  salonId: string
}): Promise<{ ok: true; debited: number } | { ok: false; error: string }> {
  const phoneDigits = normalizeCustomerPhoneDigits(input.phone)
  if (!phoneDigits) return { ok: false, error: "Invalid phone." }
  if (input.amountPaise <= 0) return { ok: true, debited: 0 }

  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc("debit_customer_wallet", {
    p_phone: phoneDigits,
    p_amount_paise: input.amountPaise,
    p_appointment_id: input.appointmentId,
    p_salon_id: input.salonId,
  })

  if (error) {
    console.error("[wallet] debit failed:", error.message)
    return { ok: false, error: "Could not apply wallet credit." }
  }

  const result = data as { ok?: boolean; debited?: number; error?: string } | null
  if (!result?.ok) {
    return { ok: false, error: result?.error === "insufficient_balance" ? "Insufficient wallet balance." : "Could not apply wallet credit." }
  }
  return { ok: true, debited: Number(result.debited ?? input.amountPaise) }
}

export async function redeemFreeServiceCredit(input: {
  phone: string
  appointmentId: string
  salonId: string
  valuePaise: number
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const phoneDigits = normalizeCustomerPhoneDigits(input.phone)
  if (!phoneDigits) return { ok: false, error: "Invalid phone." }

  const capped = Math.min(Math.max(0, input.valuePaise), LOYALTY_DISCOUNT_CAP_PAISE)
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc("redeem_free_service_credit", {
    p_phone: phoneDigits,
    p_appointment_id: input.appointmentId,
    p_salon_id: input.salonId,
    p_value_paise: capped,
  })

  if (error) {
    console.error("[wallet] free redeem failed:", error.message)
    return { ok: false, error: "Could not apply free service credit." }
  }

  const result = data as { ok?: boolean; error?: string } | null
  if (!result?.ok) {
    return {
      ok: false,
      error: result?.error === "no_free_credits" ? "No free service credits left." : "Could not apply free service credit.",
    }
  }
  return { ok: true }
}

export async function restoreBookingWalletLoyalty(appointmentId: string) {
  if (!isSupabaseConfigured()) return
  const supabase = createAdminClient()
  const { error } = await supabase.rpc("restore_booking_wallet_loyalty", {
    p_appointment_id: appointmentId,
  })
  if (error && !missingTable(error)) {
    console.error("[wallet] restore failed:", error.message)
  }
}

export async function processAppointmentCompletionRewards(appointmentId: string) {
  if (!isSupabaseConfigured()) {
    return { ok: false as const, error: "not_configured" }
  }
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc("process_appointment_completion_rewards", {
    p_appointment_id: appointmentId,
  })

  if (error) {
    if (!missingTable(error)) {
      console.error("[wallet] completion rewards failed:", error.message)
    }
    return { ok: false as const, error: error.message }
  }

  return { ok: true as const, result: data }
}
