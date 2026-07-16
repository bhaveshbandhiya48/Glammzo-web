import "server-only"

import { pickStaffForSlot, uniqueServiceIds } from "@/lib/bookings/crm/availability"
import { validateAppointmentBusinessHours } from "@/lib/bookings/crm/business-hours"
import { fetchSalonBookingContext } from "@/lib/bookings/crm/salon-context"
import type { CreateCrmBookingInput, CreateCrmBookingResult } from "@/lib/bookings/crm/types"
import {
  addMinutesToTime,
  getSalonDateKey,
  getSalonTimeKey,
  normalizeTime,
} from "@/lib/bookings/crm/time"
import {
  normalizeCustomerPhone,
  normalizeCustomerPhoneDigits,
} from "@/lib/phone/normalize"
import { getConsumerProfile } from "@/lib/auth/consumer-profile"
import { createAdminClient } from "@/lib/supabase/admin"
import { notifySalonNewWebBooking } from "@/lib/bookings/crm/notify-salon-web-booking"
import { notifyCustomerWebBookingPending } from "@/lib/bookings/crm/notify-customer-web-booking-pending"
import {
  incrementSalonOfferRedemption,
  resolveBookingOfferDiscount,
} from "@/lib/bookings/crm/validate-salon-offer"
import {
  BOOKING_ENGINE_CONFIG,
  computeBookingExpiresAt,
  isAppointmentBlockedByClosures,
  isDateBeyondMaxAdvance,
  isSalonOpenAt,
} from "@/lib/bookings/crm/booking-confirmation-engine"

export async function createCrmWebBooking(
  input: CreateCrmBookingInput,
): Promise<CreateCrmBookingResult> {
  const context = await fetchSalonBookingContext(input.crmSalonId)

  if (!context) {
    return {
      success: false,
      error: "This salon is not available for online booking.",
      code: "not_ready",
    }
  }

  if (context.staffIds.length === 0) {
    return {
      success: false,
      error: "This salon is not accepting online bookings yet.",
      code: "not_ready",
    }
  }

  const customerName = input.customerName.trim()
  const customerPhone = input.customerPhone.trim()

  if (!customerName || customerPhone.length < 8) {
    return {
      success: false,
      error: "Please enter your name and a valid phone number.",
      code: "invalid",
    }
  }

  if (input.serviceIds.length === 0) {
    return {
      success: false,
      error: "Select at least one service.",
      code: "invalid",
    }
  }

  const supabase = createAdminClient()
  const uniqueIds = uniqueServiceIds(input.serviceIds)

  const { data: serviceRows } = await supabase
    .from("services")
    .select("id, name, duration_minutes, price, is_active")
    .eq("salon_id", input.crmSalonId)
    .in("id", uniqueIds)
    .is("deleted_at", null)

  const services = (serviceRows ?? []) as Array<{
    id: string
    name: string
    duration_minutes: number
    price: string | number
    is_active: boolean
  }>

  if (services.length !== uniqueIds.length) {
    return {
      success: false,
      error: "One or more selected services are no longer available.",
      code: "invalid",
    }
  }

  if (services.some((service) => !service.is_active)) {
    return {
      success: false,
      error: "One or more selected services are inactive.",
      code: "invalid",
    }
  }

  const serviceById = new Map(services.map((service) => [service.id, service]))
  const durationMinutes = input.serviceIds.reduce(
    (total, serviceId) => total + (serviceById.get(serviceId)?.duration_minutes ?? 0),
    0,
  )

  const selectedPackage = input.packageId
    ? (
        await supabase
          .from("salon_packages")
          .select(
            "id, package_price, salon_package_items(service_id, quantity, services(name, price, duration_minutes))",
          )
          .eq("id", input.packageId)
          .eq("salon_id", input.crmSalonId)
          .is("deleted_at", null)
          .maybeSingle()
      ).data
    : null

  const webServices = services.map((service) => ({
    id: service.id,
    name: service.name,
    durationMin: service.duration_minutes,
    price: Number.parseFloat(String(service.price)) || 0,
    category: "",
    imageUrl: "",
    includes: [] as string[],
  }))

  const mappedPackage =
    selectedPackage && input.packageBooking
      ? {
          id: (selectedPackage as { id: string }).id,
          name: "",
          description: "",
          shortDescription: "",
          detailedDescription: "",
          imageUrl: "",
          packagePrice:
            Number.parseFloat(
              String((selectedPackage as { package_price: string | number }).package_price),
            ) || 0,
          comparePrice: 0,
          amountSaved: 0,
          discountPercent: 0,
          totalDurationMin: 0,
          showComparePrice: false,
          showSavings: false,
          allowOnlineBooking: true,
          servicePreviewCount: 3,
          badge: null,
          isFeatured: false,
          sortOrder: 0,
          items: (
            (selectedPackage as {
              salon_package_items?: Array<{ service_id: string; quantity: number }>
            }).salon_package_items ?? []
          ).map((item) => ({
            serviceId: item.service_id,
            serviceName: "",
            quantity: item.quantity,
          })),
        }
      : null

  const offerResult = await resolveBookingOfferDiscount({
    salonId: input.crmSalonId,
    promoCode: input.promoCode,
    services: webServices,
    selectedServiceIds: uniqueIds,
    selectedPackage: mappedPackage,
  })

  if (!offerResult.ok) {
    return {
      success: false,
      error: offerResult.error,
      code: "invalid",
    }
  }

  const appliedOffer = offerResult.discount

  const startTime = normalizeTime(input.startTime)
  const endTime = addMinutesToTime(startTime, durationMinutes)

  const today = getSalonDateKey(new Date(), context.timezone)

  if (input.appointmentDate < today) {
    return {
      success: false,
      error: "Appointments cannot be scheduled in the past.",
      code: "invalid",
    }
  }

  if (input.appointmentDate === today) {
    const nowTime = getSalonTimeKey(new Date(), context.timezone)
    if (startTime.slice(0, 5) < nowTime.slice(0, 5)) {
      return {
        success: false,
        error: "Start time cannot be in the past.",
        code: "invalid",
      }
    }
  }

  if (isDateBeyondMaxAdvance(input.appointmentDate, context.timezone)) {
    return {
      success: false,
      error: `Appointments can only be booked up to ${BOOKING_ENGINE_CONFIG.maxAdvanceBookingDays} days in advance.`,
      code: "invalid",
    }
  }

  if (
    isAppointmentBlockedByClosures(
      input.appointmentDate,
      startTime,
      endTime,
      context.businessClosures,
    )
  ) {
    return {
      success: false,
      error: "This salon is closed for the selected date and time.",
      code: "invalid",
    }
  }

  const hoursCheck = validateAppointmentBusinessHours(
    context.businessHours,
    input.appointmentDate,
    startTime,
    endTime,
  )

  if (!hoursCheck.valid) {
    return { success: false, error: hoursCheck.error, code: "invalid" }
  }

  const staffId = pickStaffForSlot(
    context,
    uniqueIds,
    input.appointmentDate,
    startTime,
    endTime,
    input.preferredStaffId,
    { packageBooking: input.packageBooking },
  )

  if (!staffId) {
    if (input.preferredStaffId) {
      return {
        success: false,
        error:
          "That professional isn’t free at this time. Choose another time, or leave staff as “Any available”.",
        code: "slot_taken",
      }
    }

    return {
      success: false,
      error: "That time slot was just taken. Please choose another.",
      code: "slot_taken",
    }
  }

  const customerId = await resolveCustomerId(
    supabase,
    input.crmSalonId,
    customerName,
    customerPhone,
    input.customerEmail,
  )

  if (!customerId) {
    return {
      success: false,
      error: "Could not save your contact details. Please try again.",
      code: "invalid",
    }
  }

  const serviceNames = input.serviceIds
    .map((serviceId) => serviceById.get(serviceId)?.name)
    .filter((name): name is string => Boolean(name))
    .join(", ")
  const noteParts = [`Web booking: ${serviceNames}`]
  if (appliedOffer) {
    noteParts.push(
      `Promo ${appliedOffer.code} applied (estimated savings ${appliedOffer.discountAmount})`,
    )
  }
  if (input.notes?.trim()) {
    noteParts.push(input.notes.trim())
  }

  let internalNotes = "source:glamzzo_web"
  if (appliedOffer) {
    internalNotes += `|promo:${appliedOffer.code}|offer_id:${appliedOffer.offerId}|discount:${appliedOffer.discountAmount}`
  }

  const bookedAt = new Date()
  const createdDuringClosedHours = !isSalonOpenAt(
    context.businessHours,
    context.timezone,
    bookedAt,
  )
  const expiresAt = computeBookingExpiresAt(
    context.businessHours,
    context.timezone,
    bookedAt,
  )

  const { data: appointment, error: insertError } = await supabase
    .from("appointments")
    .insert({
      salon_id: input.crmSalonId,
      customer_id: customerId,
      staff_id: staffId,
      service_id: input.serviceIds[0],
      appointment_date: input.appointmentDate,
      start_time: startTime,
      end_time: endTime,
      status: "pending",
      notes: noteParts.join("\n"),
      internal_notes: internalNotes,
      booking_source: "glamzzo_web",
      duration_minutes: durationMinutes,
      expires_at: expiresAt,
      response_deadline: expiresAt,
      slot_reserved: true,
      created_during_closed_hours: createdDuringClosedHours,
    })
    .select("id")
    .single()

  if (insertError || !appointment) {
    console.error("[bookings] CRM insert failed:", insertError?.message)
    return {
      success: false,
      error: "Could not create your booking. Please try again.",
      code: "invalid",
    }
  }

  const appointmentId = (appointment as { id: string }).id

  const appointmentServices = input.serviceIds.map((serviceId, index) => {
    const service = serviceById.get(serviceId)
    return {
      appointment_id: appointmentId,
      service_id: serviceId,
      sort_order: index,
      price: Number.parseFloat(String(service?.price ?? 0)) || 0,
      duration_minutes: service?.duration_minutes ?? 0,
    }
  })

  const { error: servicesError } = await supabase
    .from("appointment_services")
    .insert(appointmentServices)

  if (servicesError) {
    console.error("[bookings] appointment_services insert failed:", servicesError.message)
  }

  if (appliedOffer) {
    await incrementSalonOfferRedemption(appliedOffer.offerId)
  }

  try {
    await notifySalonNewWebBooking({
      salonId: input.crmSalonId,
      appointmentId,
      customerId,
      customerName,
      serviceNames,
      appointmentDate: input.appointmentDate,
      startTime,
    })
    await notifyCustomerWebBookingPending({
      salonId: input.crmSalonId,
      appointmentId,
      customerId,
      customerName,
      customerPhone,
      serviceNames,
      appointmentDate: input.appointmentDate,
      startTime,
      salonName: context.salonName,
    })
  } catch (error) {
    console.error("[bookings] salon notify failed:", error)
  }

  return {
    success: true,
    appointmentId,
    staffId,
    endTime,
  }
}

type AdminClient = ReturnType<typeof createAdminClient>

async function resolveCustomerId(
  supabase: AdminClient,
  salonId: string,
  fullName: string,
  phone: string,
  email?: string,
) {
  const normalizedPhone = normalizeCustomerPhone(phone)
  const phoneDigits = normalizeCustomerPhoneDigits(phone)
  const profile = await getConsumerProfile(phone)

  const customerFields = {
    full_name: fullName,
    first_name: fullName.split(" ")[0] ?? fullName,
    last_name: fullName.split(" ").slice(1).join(" ") || null,
    email: email?.trim() || profile?.email?.trim() || null,
    gender: profile?.gender ?? null,
    date_of_birth: profile?.dateOfBirth ?? null,
    address: profile?.address ?? null,
  }

  const { data: existing } = await supabase
    .from("customers")
    .select("id")
    .eq("salon_id", salonId)
    .eq("phone_normalized", phoneDigits)
    .is("deleted_at", null)
    .maybeSingle()

  if (existing) {
    await supabase
      .from("customers")
      .update(customerFields)
      .eq("id", (existing as { id: string }).id)

    return (existing as { id: string }).id
  }

  const { data: created, error } = await supabase
    .from("customers")
    .insert({
      salon_id: salonId,
      ...customerFields,
      phone: normalizedPhone,
      total_spent: 0,
      lifetime_spend: 0,
      total_visits: 0,
    })
    .select("id")
    .single()

  if (error || !created) {
    console.error("[bookings] Customer insert failed:", error?.message)
    return null
  }

  return (created as { id: string }).id
}
