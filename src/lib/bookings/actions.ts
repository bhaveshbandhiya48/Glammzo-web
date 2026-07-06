"use server"

import { redirect } from "next/navigation"

import { getSalonById } from "@/data/salons"
import {
  parseServiceIds,
  resolveServices,
  sumServiceDuration,
  sumServicePrice,
} from "@/lib/bookings/utils"
import { addBooking, getBookings, saveBookings } from "@/lib/bookings/store"
import { getSession } from "@/lib/auth/session"
import type { Booking } from "@/types/booking"

export async function createBookingAction(formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login?next=/explore")

  const salonId = String(formData.get("salonId") ?? "")
  const serviceIdsRaw = String(formData.get("serviceIds") ?? "")
  const date = String(formData.get("date") ?? "")
  const time = String(formData.get("time") ?? "")
  const notes = String(formData.get("notes") ?? "").trim()

  const salon = getSalonById(salonId)
  const serviceIds = parseServiceIds(serviceIdsRaw)
  const services = salon ? resolveServices(salon.services, serviceIds) : []

  if (!salon || services.length === 0 || !date || !time) {
    redirect(`/salons/${salonId}?error=missing`)
  }

  const existing = await getBookings()
  const slotTaken = existing.some(
    (b) =>
      b.salonId === salon.id &&
      b.date === date &&
      b.time === time &&
      b.status !== "cancelled"
  )
  if (slotTaken) {
    redirect(`/book/${salonId}?services=${serviceIds.join(",")}&error=slot`)
  }

  const totalPrice = sumServicePrice(services)
  const totalDuration = sumServiceDuration(services)

  const booking: Booking = {
    id: `bk_${Date.now()}`,
    salonId: salon.id,
    salonName: salon.name,
    salonArea: salon.area,
    services: services.map((s) => ({
      id: s.id,
      name: s.name,
      price: s.price,
      durationMin: s.durationMin,
    })),
    date,
    time,
    price: totalPrice,
    durationMin: totalDuration,
    notes: notes || undefined,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  }

  await addBooking(booking)
  redirect(`/book/confirmation?id=${booking.id}`)
}

export async function cancelBookingAction(formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const bookingId = String(formData.get("bookingId") ?? "")
  const all = await getBookings()
  const updated = all.map((b) =>
    b.id === bookingId ? { ...b, status: "cancelled" as const } : b
  )
  await saveBookings(updated)
  redirect("/dashboard/bookings")
}
