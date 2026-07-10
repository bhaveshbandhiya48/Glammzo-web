import "server-only"

import { fetchCrmCustomerBookings } from "@/lib/bookings/crm/fetch-customer-bookings"
import { processConsumerBookingReminders } from "@/lib/bookings/crm/process-booking-reminders"
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

export async function getCustomerBookings(): Promise<Booking[]> {
  const session = await getSession()
  const cookieBookings = await getBookings()

  if (!session?.phone || !isSupabaseConfigured()) {
    return cookieBookings
  }

  const crmBookings = await fetchCrmCustomerBookings(session.phone)
  void processConsumerBookingReminders().catch((error) => {
    console.error("[reminders] lazy process failed:", error)
  })
  return mergeBookings(crmBookings, cookieBookings)
}

export async function getCustomerBookingById(id: string): Promise<Booking | undefined> {
  const bookings = await getCustomerBookings()
  return bookings.find((booking) => booking.id === id || booking.crmAppointmentId === id)
}
