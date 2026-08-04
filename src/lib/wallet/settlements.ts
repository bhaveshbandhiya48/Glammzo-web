import "server-only"

import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin"

export type SalonSettlementRow = {
  salonId: string
  salonName: string
  periodStart: string
  periodEnd: string
  amountPaise: number
  amountRupees: number
  status: "open" | "paid"
  settlementId: string
}

function monthBounds(year: number, monthIndex0: number) {
  const start = new Date(Date.UTC(year, monthIndex0, 1))
  const end = new Date(Date.UTC(year, monthIndex0 + 1, 0))
  const toDate = (d: Date) => d.toISOString().slice(0, 10)
  return { periodStart: toDate(start), periodEnd: toDate(end) }
}

export async function buildAndListSettlementsForMonth(input?: {
  year?: number
  month?: number // 1-12
}): Promise<{
  periodStart: string
  periodEnd: string
  built: number
  rows: SalonSettlementRow[]
}> {
  const now = new Date()
  const year = input?.year ?? now.getUTCFullYear()
  const month = input?.month ?? now.getUTCMonth() + 1
  const { periodStart, periodEnd } = monthBounds(year, month - 1)

  if (!isSupabaseConfigured()) {
    return { periodStart, periodEnd, built: 0, rows: [] }
  }

  const supabase = createAdminClient()
  const { data: built, error: buildError } = await supabase.rpc("build_salon_wallet_settlements", {
    p_period_start: periodStart,
    p_period_end: periodEnd,
  })

  if (buildError) {
    console.error("[wallet] build settlements failed:", buildError.message)
  }

  const { data, error } = await supabase
    .from("salon_wallet_settlements")
    .select("id, salon_id, period_start, period_end, amount_paise, status, salons(name)")
    .eq("period_start", periodStart)
    .eq("period_end", periodEnd)
    .order("amount_paise", { ascending: false })

  if (error) {
    console.error("[wallet] list settlements failed:", error.message)
    return { periodStart, periodEnd, built: Number(built ?? 0), rows: [] }
  }

  const rows: SalonSettlementRow[] = (data ?? []).map((row) => {
    const salon = row.salons as { name?: string } | { name?: string }[] | null
    const salonName = Array.isArray(salon) ? salon[0]?.name : salon?.name
    return {
      salonId: row.salon_id as string,
      salonName: salonName ?? "Salon",
      periodStart: String(row.period_start),
      periodEnd: String(row.period_end),
      amountPaise: Number(row.amount_paise),
      amountRupees: Number(row.amount_paise) / 100,
      status: row.status === "paid" ? "paid" : "open",
      settlementId: row.id as string,
    }
  })

  return {
    periodStart,
    periodEnd,
    built: Number(built ?? 0),
    rows,
  }
}

export async function markSettlementPaid(settlementId: string) {
  if (!isSupabaseConfigured()) return { ok: false as const }
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("salon_wallet_settlements")
    .update({ status: "paid", updated_at: new Date().toISOString() })
    .eq("id", settlementId)

  if (error) {
    console.error("[wallet] mark paid failed:", error.message)
    return { ok: false as const }
  }
  return { ok: true as const }
}
