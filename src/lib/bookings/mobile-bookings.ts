import "server-only"

import { formatCustomerCancellationReason } from "@/lib/bookings/booking-status"
import { cancelCrmWebBooking } from "@/lib/bookings/crm/cancel-booking"
import { createCrmWebBooking } from "@/lib/bookings/crm/create-booking"
import { formatSlotLabel } from "@/lib/bookings/crm/availability"
import {
  fetchCrmCustomerBookingById,
  fetchCrmCustomerBookings,
} from "@/lib/bookings/crm/fetch-customer-bookings"
import { rescheduleCrmWebBooking } from "@/lib/bookings/crm/reschedule-booking"
import {
  parseServiceIds,
  resolveServices,
  sumServiceDuration,
} from "@/lib/bookings/utils"
import { guardCreateBooking } from "@/lib/bookings/guard-create-booking"
import { getSalonById } from "@/lib/salons"
import { computeBookingSubtotal } from "@/lib/salons/offer-utils"
import { isSupabaseConfigured } from "@/lib/supabase/admin"
import { isValidEmail } from "@/lib/validations/email"
import type { Booking } from "@/types/booking"

export type MobileCreateBookingInput = {
  salonId: string
  serviceIds: string[]
  date: string
  time: string
  notes?: string
  customerName: string
  customerEmail: string
  sessionPhone: string
  preferredStaffId?: string
  packageId?: string
  promoCode?: string
  marketingOptIn?: boolean
  useWallet?: boolean
  useFreeService?: boolean
}

export type MobileCreateBookingResult =
  | { ok: true; booking: Booking }
  | { ok: false; error: string; code?: string }

export async function listMobileCustomerBookings(phone: string): Promise<Booking[]> {
  if (!isSupabaseConfigured()) return []
  return fetchCrmCustomerBookings(phone)
}

export async function getMobileCustomerBooking(
  phone: string,
  id: string,
): Promise<Booking | undefined> {
  if (!isSupabaseConfigured()) return undefined
  return fetchCrmCustomerBookingById(phone, id)
}

export async function createMobileBooking(
  input: MobileCreateBookingInput,
): Promise<MobileCreateBookingResult> {
  const gated = await guardCreateBooking(input.sessionPhone)
  if (!gated.ok) {
    return {
      ok: false,
      error: gated.message,
      code: gated.code,
    }
  }

  const salon = await getSalonById(input.salonId)
  const serviceIds = parseServiceIds(input.serviceIds.join(","))
  const services = salon ? resolveServices(salon.services, serviceIds) : []
  const packageId = input.packageId?.trim() || ""
  const selectedPackage = packageId
    ? salon?.packages.find((pkg) => pkg.id === packageId) ?? null
    : null

  if (!salon || services.length === 0 || !input.date || !input.time) {
    return { ok: false, error: "Missing salon, services, date, or time.", code: "missing" }
  }

  const customerName = input.customerName.trim()
  const customerEmail = input.customerEmail.trim()
  const customerPhone = gated.customerPhone

  if (!customerName || !isValidEmail(customerEmail)) {
    return {
      ok: false,
      error: "Name and a valid email are required.",
      code: "contact",
    }
  }

  if (!isSupabaseConfigured() || !salon.crmSalonId) {
    return {
      ok: false,
      error: "Online booking is not available for this salon right now.",
      code: "booking",
    }
  }

  const totalDuration = sumServiceDuration(services)
  const displayTime =
    input.time.includes("AM") || input.time.includes("PM")
      ? input.time
      : formatSlotLabel(input.time)

  const result = await createCrmWebBooking({
    crmSalonId: salon.crmSalonId,
    serviceIds,
    appointmentDate: input.date,
    startTime: input.time,
    customerName,
    customerPhone,
    customerEmail,
    notes: input.notes?.trim() || undefined,
    preferredStaffId: input.preferredStaffId,
    packageBooking: Boolean(packageId),
    packageId: packageId || undefined,
    promoCode: input.promoCode?.trim() || undefined,
    marketingOptIn: input.marketingOptIn ?? true,
    useWallet: Boolean(input.useWallet),
    useFreeService: Boolean(input.useFreeService),
  })

  if (!result.success) {
    const code =
      result.code === "slot_taken"
        ? "slot"
        : input.promoCode && result.code === "invalid"
          ? "promo"
          : result.code || "booking"
    return {
      ok: false,
      error: result.error || "Could not create booking.",
      code,
    }
  }

  // Subtotal for display fallback (CRM returns pay-at-salon amount)
  computeBookingSubtotal({
    services: salon.services,
    selectedServiceIds: serviceIds,
    selectedPackage,
  })

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
    date: input.date,
    time: displayTime,
    price: result.payAtSalonRupees,
    durationMin: totalDuration,
    notes: input.notes?.trim() || undefined,
    status: result.appointmentStatus === "confirmed" ? "confirmed" : "pending",
    createdAt: new Date().toISOString(),
    confirmationDeadline: result.confirmationDeadline ?? undefined,
    bookingMode: result.bookingMode,
  }

  return { ok: true, booking }
}

export async function cancelMobileBooking(input: {
  phone: string
  bookingId: string
  reasonId?: string
  details?: string
}): Promise<{ ok: true } | { ok: false; error: string; code?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Booking cancel is unavailable.", code: "cancel" }
  }

  const cancellationReason = formatCustomerCancellationReason({
    reasonId: input.reasonId?.trim() || "other",
    details: input.details?.trim() || "",
  })

  if (!input.bookingId || !cancellationReason) {
    return { ok: false, error: "Missing booking or cancellation reason.", code: "cancel" }
  }

  const result = await cancelCrmWebBooking(
    input.bookingId,
    input.phone,
    cancellationReason,
  )

  if (!result.success) {
    const code = result.code === "too_soon" ? "cancel_too_soon" : "cancel"
    return {
      ok: false,
      error: result.error || "Could not cancel booking.",
      code,
    }
  }

  return { ok: true }
}

export async function rescheduleMobileBooking(input: {
  phone: string
  appointmentId: string
  date: string
  time: string
}): Promise<{ ok: true } | { ok: false; error: string; code?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Reschedule is unavailable.", code: "reschedule" }
  }

  if (!input.appointmentId || !input.date || !input.time) {
    return { ok: false, error: "Missing appointment, date, or time.", code: "reschedule" }
  }

  const result = await rescheduleCrmWebBooking({
    appointmentId: input.appointmentId,
    phone: input.phone,
    appointmentDate: input.date,
    startTime: input.time,
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
    return {
      ok: false,
      error: result.error || "Could not reschedule booking.",
      code,
    }
  }

  return { ok: true }
}
