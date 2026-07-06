import { cookies } from "next/headers"

import type { Booking, LegacyBooking } from "@/types/booking"
import { normalizeBooking } from "@/types/booking"

const COOKIE_NAME = "glamzzo_bookings"

export async function getBookings(): Promise<Booking[]> {
  const jar = await cookies()
  const raw = jar.get(COOKIE_NAME)?.value
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as LegacyBooking[]
    return parsed.map(normalizeBooking)
  } catch {
    return []
  }
}

export async function saveBookings(bookings: Booking[]) {
  const jar = await cookies()
  jar.set(COOKIE_NAME, JSON.stringify(bookings), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  })
}

export async function addBooking(booking: Booking) {
  const existing = await getBookings()
  await saveBookings([booking, ...existing])
}

export async function getBookingById(id: string) {
  const all = await getBookings()
  return all.find((b) => b.id === id)
}
