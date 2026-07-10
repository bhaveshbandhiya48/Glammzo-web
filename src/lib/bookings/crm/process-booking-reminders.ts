import "server-only"

import { formatSlotLabel } from "@/lib/bookings/crm/availability"
import { getActiveSmsProvider } from "@/lib/sms"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/admin"

type ReminderKind = "24h" | "2h"

const REMINDER_WINDOWS: Record<ReminderKind, { minHours: number; maxHours: number }> = {
  "24h": { minHours: 22, maxHours: 26 },
  "2h": { minHours: 1.5, maxHours: 2.5 },
}

type AppointmentReminderRow = {
  id: string
  appointment_date: string
  start_time: string
  salons: { name: string; timezone?: string | null } | { name: string; timezone?: string | null }[] | null
  customers:
    | { phone: string | null; full_name: string | null }
    | { phone: string | null; full_name: string | null }[]
    | null
  services: { name: string } | { name: string }[] | null
}

function appointmentStartMs(date: string, time: string) {
  const normalized = time.length >= 5 ? time.slice(0, 8) : `${time}:00`
  return new Date(`${date}T${normalized}+05:30`).getTime()
}

function buildReminderSms(input: {
  salonName: string
  appointmentDate: string
  startTime: string
  kind: ReminderKind
}) {
  const timeLabel = formatSlotLabel(input.startTime)
  const lead = input.kind === "24h" ? "tomorrow" : "in about 2 hours"
  return `Glammzo reminder: Your visit at ${input.salonName} is ${lead} (${input.appointmentDate} at ${timeLabel}). Reply to the salon if you need to change plans.`
}

function hoursUntil(startMs: number) {
  return (startMs - Date.now()) / (60 * 60 * 1000)
}

function isInWindow(hours: number, kind: ReminderKind) {
  const window = REMINDER_WINDOWS[kind]
  return hours >= window.minHours && hours <= window.maxHours
}

export async function processConsumerBookingReminders(): Promise<number> {
  if (!isSupabaseConfigured()) return 0

  const supabase = createAdminClient()
  const now = new Date()
  const horizonStart = new Date(now.getTime() + 1 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const horizonEnd = new Date(now.getTime() + 30 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const { data: rows, error } = await supabase
    .from("appointments")
    .select(
      `
      id,
      appointment_date,
      start_time,
      status,
      booking_source,
      salons ( name, timezone ),
      customers ( phone, full_name ),
      services ( name )
    `,
    )
    .eq("booking_source", "glamzzo_web")
    .in("status", ["scheduled", "confirmed"])
    .gte("appointment_date", horizonStart)
    .lte("appointment_date", horizonEnd)
    .is("deleted_at", null)

  if (error || !rows?.length) {
    if (error) console.error("[reminders] fetch failed:", error.message)
    return 0
  }

  const sms = getActiveSmsProvider()
  let sent = 0

  for (const raw of rows as unknown as AppointmentReminderRow[]) {
    const salon = Array.isArray(raw.salons) ? raw.salons[0] : raw.salons
    const customer = Array.isArray(raw.customers) ? raw.customers[0] : raw.customers
    const phone = customer?.phone?.trim()

    if (!phone || !salon?.name) continue

    const startMs = appointmentStartMs(raw.appointment_date, raw.start_time)
    if (!Number.isFinite(startMs)) continue

    const hours = hoursUntil(startMs)
    const kinds: ReminderKind[] = []

    if (isInWindow(hours, "24h")) kinds.push("24h")
    if (isInWindow(hours, "2h")) kinds.push("2h")

    for (const kind of kinds) {
      const { data: existing } = await supabase
        .from("appointment_reminder_logs")
        .select("id")
        .eq("appointment_id", raw.id)
        .eq("reminder_kind", kind)
        .maybeSingle()

      if (existing) continue

      const body = buildReminderSms({
        salonName: salon.name,
        appointmentDate: raw.appointment_date,
        startTime: raw.start_time,
        kind,
      })

      const result = await sms.sendSms({ to: phone, body })
      if (!result.success) {
        console.error("[reminders] SMS failed:", result.error)
        continue
      }

      const { error: logError } = await supabase.from("appointment_reminder_logs").insert({
        appointment_id: raw.id,
        reminder_kind: kind,
        channel: "sms",
      })

      if (logError) {
        console.error("[reminders] log insert failed:", logError.message)
        continue
      }

      sent += 1
    }
  }

  return sent
}
