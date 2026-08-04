import { NextResponse } from "next/server"

import { isCronRequestAuthorized } from "@/lib/env/cron-auth"
import { buildAndListSettlementsForMonth, markSettlementPaid } from "@/lib/wallet/settlements"

export const runtime = "nodejs"

/** Build / list month-end salon wallet settlements. Auth: cron secret. */
export async function GET(request: Request) {
  if (!isCronRequestAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const year = Number(url.searchParams.get("year") || "") || undefined
  const month = Number(url.searchParams.get("month") || "") || undefined

  try {
    const result = await buildAndListSettlementsForMonth({ year, month })
    return NextResponse.json({
      ok: true,
      periodStart: result.periodStart,
      periodEnd: result.periodEnd,
      built: result.built,
      settlements: result.rows,
      totalPaise: result.rows.reduce((sum, row) => sum + row.amountPaise, 0),
    })
  } catch (error) {
    console.error("[wallet] settlements GET failed:", error)
    return NextResponse.json({ error: "Failed to build settlements" }, { status: 500 })
  }
}

/** Mark a settlement paid. Body: { settlementId }. Auth: cron secret. */
export async function POST(request: Request) {
  if (!isCronRequestAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = (await request.json()) as { settlementId?: string }
    if (!body.settlementId) {
      return NextResponse.json({ error: "settlementId required" }, { status: 400 })
    }
    const result = await markSettlementPaid(body.settlementId)
    if (!result.ok) {
      return NextResponse.json({ error: "Could not mark paid" }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[wallet] settlements POST failed:", error)
    return NextResponse.json({ error: "Failed to update settlement" }, { status: 500 })
  }
}
