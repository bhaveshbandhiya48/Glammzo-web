import "server-only"

import { formatSlotLabel } from "@/lib/bookings/crm/availability"
import { getActiveSmsProvider } from "@/lib/sms"
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin"

type OutcomeKind = "expired" | "declined"

type OutcomeRow = {
  id: string
  status: string
  appointment_date: string
  start_time: string
  updated_at: string
  salons: { name: string } | { name: string }[] | null
  customers:
    | { phone: string | null; full_name: string | null }
    | { phone: string | null; full_name: string | null }[]
    | null
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

function buildOutcomeSms(input: {
  salonName: string
  appointmentDate: string
  startTime: string
  kind: OutcomeKind
}) {
  const timeLabel = formatSlotLabel(input.startTime)
  const when = `${input.appointmentDate} at ${timeLabel}`

  if (input.kind === "expired") {
    return `Glammzo: ${input.salonName} did not confirm your booking request for ${when}. The slot was released — you can book another time on Glammzo.`
  }

  return `Glammzo: ${input.salonName} could not accept your booking request for ${when}. You can book another time on Glammzo.`
}

/**
 * SMS customers when a Glamzzo web booking is declined or expires
 * without salon acceptance (consumer-facing fallback; CRM also sends WhatsApp when entitled).
 */
export async function processConsumerBookingOutcomeNotices(): Promise<number> {
  if (!isSupabaseConfigured()) return 0

  const supabase = createAdminClient()
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: rows, error } = await supabase
    .from("appointments")
    .select(
      `
      id,
      status,
      appointment_date,
      start_time,
      updated_at,
      salons ( name ),
      customers ( phone, full_name )
    `,
    )
    .eq("booking_source", "glamzzo_web")
    .in("status", ["expired", "rejected"])
    .gte("updated_at", since)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(100)

  if (error || !rows?.length) {
    if (error) console.error("[outcome-notices] fetch failed:", error.message)
    return 0
  }

  const sms = getActiveSmsProvider()
  let sent = 0

  for (const raw of rows as unknown as OutcomeRow[]) {
    const kind: OutcomeKind = raw.status === "expired" ? "expired" : "declined"
    const salon = firstRelation(raw.salons)
    const customer = firstRelation(raw.customers)
    const phone = customer?.phone?.trim()

    if (!phone || !salon?.name) continue

    const { data: existing } = await supabase
      .from("appointment_reminder_logs")
      .select("id")
      .eq("appointment_id", raw.id)
      .eq("reminder_kind", kind)
      .maybeSingle()

    if (existing) continue

    const body = buildOutcomeSms({
      salonName: salon.name,
      appointmentDate: raw.appointment_date,
      startTime: raw.start_time,
      kind,
    })

    const result = await sms.sendSms({ to: phone, body })
    if (!result.success) {
      console.error("[outcome-notices] SMS failed:", result.error, raw.id)
      continue
    }

    const { error: logError } = await supabase.from("appointment_reminder_logs").insert({
      appointment_id: raw.id,
      reminder_kind: kind,
      channel: "sms",
    })

    if (logError) {
      console.error("[outcome-notices] log insert failed:", logError.message)
      continue
    }

    sent += 1
  }

  return sent
}
