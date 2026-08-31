"use server"

import { redirect } from "next/navigation"

import { createCrmWebBooking } from "@/lib/bookings/crm/create-booking"
import { cancelCrmWebBooking } from "@/lib/bookings/crm/cancel-booking"
import { rescheduleCrmWebBooking } from "@/lib/bookings/crm/reschedule-booking"
import { formatCustomerCancellationReason } from "@/lib/bookings/booking-status"
import { formatSlotLabel } from "@/lib/bookings/crm/availability"
import { getSalonById } from "@/lib/salons"
import {
  parseServiceIds,
  parseServiceQuantities,
  resolveServices,
  sumServiceDuration,
} from "@/lib/bookings/utils"
import { quantityForService } from "@/lib/salons/pricing-unit"
import { computeBookingSubtotal } from "@/lib/salons/offer-utils"
import { addBooking } from "@/lib/bookings/store"
import { getSession, updateSessionProfile } from "@/lib/auth/session"
import { isSupabaseConfigured } from "@/lib/supabase/admin"
import { guardCreateBooking } from "@/lib/bookings/guard-create-booking"
import { isValidEmail } from "@/lib/validations/email"
import type { Booking } from "@/types/booking"

function parseMarketingOptIn(formData: FormData) {
  const raw = String(formData.get("marketingOptIn") ?? "true").trim().toLowerCase()
  return raw === "true" || raw === "1" || raw === "on"
}

async function persistBookingProfile(customerName: string, customerEmail: string) {
  await updateSessionProfile({
    name: customerName,
    email: customerEmail,
  })
}

function bookingErrorPath(
  salonId: string,
  serviceIds: string[],
  error: string,
  extras?: { packageId?: string; promoCode?: string },
) {
  const query = new URLSearchParams({
    services: serviceIds.join(","),
    error,
  })
  if (extras?.packageId) query.set("package", extras.packageId)
  if (extras?.promoCode) query.set("promo", extras.promoCode)
  return `/book/${salonId}?${query.toString()}`
}

export async function createBookingAction(formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login?next=/explore")

  const salonId = String(formData.get("salonId") ?? "")
  const serviceIdsRaw = String(formData.get("serviceIds") ?? "")
  const serviceQuantities = parseServiceQuantities(
    String(formData.get("serviceQuantities") ?? ""),
  )
  const date = String(formData.get("date") ?? "")
  const time = String(formData.get("time") ?? "")
  const notes = String(formData.get("notes") ?? "").trim()
  const customerName = String(formData.get("customerName") ?? session.name ?? "").trim()
  const customerEmail = String(formData.get("customerEmail") ?? session.email ?? "").trim()
  const preferredStaffId = String(formData.get("preferredStaffId") ?? "").trim() || undefined
  const packageId = String(formData.get("packageId") ?? "").trim()
  const promoCode = String(formData.get("promoCode") ?? "").trim()
  const marketingOptIn = parseMarketingOptIn(formData)
  const useWallet = String(formData.get("useWallet") ?? "") === "1"
  const useFreeService = String(formData.get("useFreeService") ?? "") === "1"

  const gated = await guardCreateBooking(session.phone)
  if (!gated.ok) {
    if (gated.code === "no_session_phone") {
      redirect(`/login?next=/book/${encodeURIComponent(salonId)}`)
    } else {
      const pendingServiceIds = parseServiceIds(serviceIdsRaw)
      redirect(bookingErrorPath(salonId, pendingServiceIds, "rate_limit", { packageId }))
    }
  }
  const customerPhone = gated.customerPhone

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
    quantities: serviceQuantities,
  })
  const totalDuration = sumServiceDuration(services, serviceQuantities)
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
      customerPhone,
      customerEmail,
      notes: notes || undefined,
      preferredStaffId,
      packageBooking: Boolean(packageId),
      packageId: packageId || undefined,
      promoCode: promoCode || undefined,
      marketingOptIn,
      useWallet,
      useFreeService,
      serviceQuantities,
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
      services: services.map((s) => {
        const quantity = quantityForService(s, serviceQuantities)
        return {
          id: s.id,
          name: s.name,
          price: s.price * quantity,
          durationMin: s.durationMin * quantity,
        }
      }),
      date,
      time: displayTime,
      price: result.payAtSalonRupees,
      durationMin: totalDuration,
      notes: notes || undefined,
      status: result.appointmentStatus === "confirmed" ? "confirmed" : "pending",
      createdAt: new Date().toISOString(),
      confirmationDeadline: result.confirmationDeadline ?? undefined,
      bookingMode: result.bookingMode,
    }

    await addBooking(booking)
    await persistBookingProfile(customerName, customerEmail)
    redirect(`/book/confirmation?id=${booking.id}`)
  }

  // Production / configured CRM: never create phantom cookie-only bookings.
  if (isSupabaseConfigured()) {
    redirect(`/book/${salonId}?services=${serviceIds.join(",")}&error=booking`)
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
    services: services.map((s) => {
      const quantity = quantityForService(s, serviceQuantities)
      return {
        id: s.id,
        name: s.name,
        price: s.price * quantity,
        durationMin: s.durationMin * quantity,
      }
    }),
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
  const reasonId = String(formData.get("cancelReason") ?? "").trim()
  const details = String(formData.get("cancelDetails") ?? "").trim()

  const cancellationReason = formatCustomerCancellationReason({
    reasonId,
    details,
  })

  if (!bookingId || !cancellationReason) {
    redirect("/dashboard/profile?error=cancel#bookings")
  }

  if (isSupabaseConfigured() && session.phone && bookingId) {
    const result = await cancelCrmWebBooking(bookingId, session.phone, cancellationReason)

    if (!result.success) {
      const code = result.code === "too_soon" ? "cancel_too_soon" : "cancel"
      return redirect(`/dashboard/profile?error=${code}#bookings`)
    }

    const { getBookings, saveBookings } = await import("@/lib/bookings/store")
    const all = await getBookings()
    const updated = all.map((booking) =>
      booking.id === bookingId || booking.crmAppointmentId === bookingId
        ? { ...booking, status: "cancelled" as const }
        : booking,
    )
    await saveBookings(updated)
    redirect("/dashboard/profile#bookings")
  }

  const { getBookings, saveBookings } = await import("@/lib/bookings/store")
  const all = await getBookings()
  const updated = all.map((b) =>
    b.id === bookingId ? { ...b, status: "cancelled" as const } : b,
  )
  await saveBookings(updated)
  redirect("/dashboard/profile#bookings")
}

export async function rescheduleBookingAction(formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const appointmentId = String(formData.get("appointmentId") ?? "")
  const date = String(formData.get("date") ?? "")
  const time = String(formData.get("time") ?? "")

  if (!appointmentId || !date || !time) {
    redirect("/dashboard/profile?error=reschedule#bookings")
  }

  if (isSupabaseConfigured() && session.phone) {
    const result = await rescheduleCrmWebBooking({
      appointmentId,
      phone: session.phone,
      appointmentDate: date,
      startTime: time,
    })

    if (!result.success) {
      const code =
        result.code === "slot_taken"
          ? "reschedule_slot"
          : result.code === "contact_salon"
            ? "contact_salon"
            : result.code === "pending"
              ? "reschedule_pending"
              : result.code === "too_soon"
                ? "reschedule_too_soon"
                : "reschedule"
      redirect(`/dashboard/bookings/${appointmentId}/reschedule?error=${code}`)
    }

    redirect("/dashboard/profile?reschedule_requested=1#bookings")
  }

  redirect("/dashboard/profile?error=reschedule#bookings")
}
