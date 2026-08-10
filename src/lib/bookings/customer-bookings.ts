import "server-only"

import { after } from "next/server"

import { fetchCrmCustomerBookingById, fetchCrmCustomerBookings } from "@/lib/bookings/crm/fetch-customer-bookings"
import { processConsumerBookingReminders } from "@/lib/bookings/crm/process-booking-reminders"
import { processConsumerBookingOutcomeNotices } from "@/lib/bookings/crm/process-booking-outcome-notices"
import { triggerCrmExpiredWebBookingsCron } from "@/lib/bookings/crm/trigger-crm-expire-cron"
import { getBookings } from "@/lib/bookings/store"
import { getSession } from "@/lib/auth/session"
import { isSupabaseConfigured } from "@/lib/supabase/admin"
import type { Booking } from "@/types/booking"

function mergeBookings(crmBookings: Booking[], cookieBookings: Booking[]): Booking[] {
  const byId = new Map<string, Booking>()

  for (const booking of crmBookings) {
    byId.set(booking.crmAppointmentId ?? booking.id, booking)
  }

  for (const booking of cookieBookings) {
    const key = booking.crmAppointmentId ?? booking.id
    if (!byId.has(key)) {
      byId.set(key, booking)
    }
  }

  return [...byId.values()].sort((a, b) => {
    const aKey = `${a.date}T${a.time}`
    const bKey = `${b.date}T${b.time}`
    return bKey.localeCompare(aKey)
  })
}

function scheduleBookingMaintenance() {
  after(() =>
    triggerCrmExpiredWebBookingsCron().catch((error) => {
      console.error("[bookings] expire trigger failed:", error)
    }),
  )
  after(() =>
    processConsumerBookingReminders().catch((error) => {
      console.error("[reminders] lazy process failed:", error)
    }),
  )
  after(() =>
    processConsumerBookingOutcomeNotices().catch((error) => {
      console.error("[outcome-notices] lazy process failed:", error)
    }),
  )
}

export async function getCustomerBookings(): Promise<Booking[]> {
  const session = await getSession()
  const cookieBookings = await getBookings()

  if (!session?.phone || !isSupabaseConfigured()) {
    return cookieBookings
  }

  // Expire + notice side effects must not block the bookings UI.
  // UI status already maps past-deadline pending via expiresAt.
  scheduleBookingMaintenance()

  const crmBookings = await fetchCrmCustomerBookings(session.phone)
  return mergeBookings(crmBookings, cookieBookings)
}

export async function getCustomerBookingById(id: string): Promise<Booking | undefined> {
  const cookieBookings = await getBookings()
  const fromCookie = cookieBookings.find(
    (booking) => booking.id === id || booking.crmAppointmentId === id,
  )
  if (fromCookie) {
    return fromCookie
  }

  const session = await getSession()
  if (!session?.phone || !isSupabaseConfigured()) {
    return undefined
  }

  return fetchCrmCustomerBookingById(session.phone, id)
}
