"use server"

import { redirect } from "next/navigation"

import { createCrmWebBooking } from "@/lib/bookings/crm/create-booking"
import { cancelCrmWebBooking } from "@/lib/bookings/crm/cancel-booking"
import { rescheduleCrmWebBooking } from "@/lib/bookings/crm/reschedule-booking"
import { formatSlotLabel } from "@/lib/bookings/crm/availability"
import { getSalonById } from "@/lib/salons"
import {
  parseServiceIds,
  resolveServices,
  sumServiceDuration,
} from "@/lib/bookings/utils"
import { computeBookingSubtotal } from "@/lib/salons/offer-utils"
import { addBooking } from "@/lib/bookings/store"
import { getSession, updateSessionProfile } from "@/lib/auth/session"
import { isSupabaseConfigured } from "@/lib/supabase/admin"
import { normalizeCustomerPhone } from "@/lib/phone/normalize"
import { isValidEmail } from "@/lib/validations/email"
import type { Booking } from "@/types/booking"

async function persistBookingProfile(customerName: string, customerEmail: string) {
  await updateSessionProfile({
    name: customerName,
    email: customerEmail,
  })
}

export async function createBookingAction(formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login?next=/explore")

  const salonId = String(formData.get("salonId") ?? "")
  const serviceIdsRaw = String(formData.get("serviceIds") ?? "")
  const date = String(formData.get("date") ?? "")
  const time = String(formData.get("time") ?? "")
  const notes = String(formData.get("notes") ?? "").trim()
  const customerName = String(formData.get("customerName") ?? session.name ?? "").trim()
  const customerEmail = String(formData.get("customerEmail") ?? session.email ?? "").trim()
  const customerPhone = String(
    formData.get("customerPhone") ?? session.phone ?? "",
  ).trim()
  const preferredStaffId = String(formData.get("preferredStaffId") ?? "").trim() || undefined
  const packageId = String(formData.get("packageId") ?? "").trim()
  const promoCode = String(formData.get("promoCode") ?? "").trim()

  const salon = await getSalonById(salonId)
  const serviceIds = parseServiceIds(serviceIdsRaw)
  const services = salon ? resolveServices(salon.services, serviceIds) : []
  const selectedPackage = packageId
    ? salon?.packages.find((pkg) => pkg.id === packageId) ?? null
    : null

  if (!salon || services.length === 0 || !date || !time) {
    redirect(`/salons/${salonId}?error=missing`)
  }

  const totalPrice = computeBookingSubtotal({
    services: salon.services,
    selectedServiceIds: serviceIds,
    selectedPackage,
  })
  const totalDuration = sumServiceDuration(services)
  const displayTime = time.includes("AM") || time.includes("PM") ? time : formatSlotLabel(time)

  if (isSupabaseConfigured() && salon.crmSalonId) {
    if (!customerName || customerPhone.length < 8 || !isValidEmail(customerEmail)) {
      redirect(
        `/book/${salonId}?services=${serviceIds.join(",")}&error=contact`,
      )
    }

    const result = await createCrmWebBooking({
      crmSalonId: salon.crmSalonId,
      serviceIds,
      appointmentDate: date,
      startTime: time,
      customerName,
      customerPhone: normalizeCustomerPhone(customerPhone),
      customerEmail,
      notes: notes || undefined,
      preferredStaffId,
      packageBooking: Boolean(packageId),
      packageId: packageId || undefined,
      promoCode: promoCode || undefined,
    })

    if (!result.success) {
      const errorCode =
        result.code === "slot_taken"
          ? "slot"
          : promoCode && result.code === "invalid"
            ? "promo"
            : "booking"
      const query = new URLSearchParams({
        services: serviceIds.join(","),
        error: errorCode,
      })
      if (packageId) query.set("package", packageId)
      if (promoCode && errorCode === "promo") query.set("promo", promoCode)
      redirect(`/book/${salonId}?${query.toString()}`)
    }

    const booking: Booking = {
      id: result.appointmentId,
      crmAppointmentId: result.appointmentId,
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
      time: displayTime,
      price: totalPrice,
      durationMin: totalDuration,
      notes: notes || undefined,
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    await addBooking(booking)
    await persistBookingProfile(customerName, customerEmail)
    redirect(`/book/confirmation?id=${booking.id}`)
  }

  if (!customerName || customerPhone.length < 8 || !isValidEmail(customerEmail)) {
    redirect(`/book/${salonId}?services=${serviceIds.join(",")}&error=contact`)
  }

  const { getBookings } = await import("@/lib/bookings/store")
  const existing = await getBookings()
  const slotTaken = existing.some(
    (b) =>
      b.salonId === salon.id &&
      b.date === date &&
      b.time === displayTime &&
      b.status !== "cancelled",
  )
  if (slotTaken) {
    redirect(`/book/${salonId}?services=${serviceIds.join(",")}&error=slot`)
  }

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
    time: displayTime,
    price: totalPrice,
    durationMin: totalDuration,
    notes: notes || undefined,
    status: "pending",
    createdAt: new Date().toISOString(),
  }

  await addBooking(booking)
  await persistBookingProfile(customerName, customerEmail)
  redirect(`/book/confirmation?id=${booking.id}`)
}

export async function cancelBookingAction(formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const bookingId = String(formData.get("bookingId") ?? "")

  if (isSupabaseConfigured() && session.phone && bookingId) {
    const result = await cancelCrmWebBooking(bookingId, session.phone)

    if (!result.success) {
      return redirect("/dashboard/bookings?error=cancel")
    }

    const { getBookings, saveBookings } = await import("@/lib/bookings/store")
    const all = await getBookings()
    const updated = all.map((booking) =>
      booking.id === bookingId || booking.crmAppointmentId === bookingId
        ? { ...booking, status: "cancelled" as const }
        : booking,
    )
    await saveBookings(updated)
    redirect("/dashboard/bookings")
  }

  const { getBookings, saveBookings } = await import("@/lib/bookings/store")
  const all = await getBookings()
  const updated = all.map((b) =>
    b.id === bookingId ? { ...b, status: "cancelled" as const } : b,
  )
  await saveBookings(updated)
  redirect("/dashboard/bookings")
}

export async function rescheduleBookingAction(formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const appointmentId = String(formData.get("appointmentId") ?? "")
  const date = String(formData.get("date") ?? "")
  const time = String(formData.get("time") ?? "")

  if (!appointmentId || !date || !time) {
    redirect("/dashboard/bookings?error=reschedule")
  }

  if (isSupabaseConfigured() && session.phone) {
    const result = await rescheduleCrmWebBooking({
      appointmentId,
      phone: session.phone,
      appointmentDate: date,
      startTime: time,
    })

    if (!result.success) {
      const code = result.code === "slot_taken" ? "reschedule_slot" : "reschedule"
      redirect(`/dashboard/bookings/${appointmentId}/reschedule?error=${code}`)
    }

    redirect("/dashboard/bookings?rescheduled=1")
  }

  redirect("/dashboard/bookings?error=reschedule")
}
