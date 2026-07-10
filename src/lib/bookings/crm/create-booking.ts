import "server-only"

import { pickStaffForSlot } from "@/lib/bookings/crm/availability"
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
import { createAdminClient } from "@/lib/supabase/admin"
import { notifySalonNewWebBooking } from "@/lib/bookings/crm/notify-salon-web-booking"
import { computeResponseDeadline } from "@/lib/bookings/crm/web-booking-sla"

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

  const { data: serviceRows } = await supabase
    .from("services")
    .select("id, name, duration_minutes, price, is_active")
    .eq("salon_id", input.crmSalonId)
    .in("id", input.serviceIds)
    .is("deleted_at", null)

  const services = (serviceRows ?? []) as Array<{
    id: string
    name: string
    duration_minutes: number
    price: string | number
    is_active: boolean
  }>

  if (services.length !== input.serviceIds.length) {
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

  const durationMinutes = services.reduce(
    (total, service) => total + service.duration_minutes,
    0,
  )
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
    input.serviceIds,
    input.appointmentDate,
    startTime,
    endTime,
    input.preferredStaffId,
  )

  if (!staffId) {
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

  const serviceNames = services.map((service) => service.name).join(", ")
  const noteParts = [`Web booking: ${serviceNames}`]
  if (input.notes?.trim()) {
    noteParts.push(input.notes.trim())
  }

  const responseDeadline = computeResponseDeadline(context.webBooking.responseSlaMinutes)

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
      status: "scheduled",
      notes: noteParts.join("\n"),
      internal_notes: "source:glamzzo_web",
      booking_source: "glamzzo_web",
      duration_minutes: durationMinutes,
      response_deadline: responseDeadline,
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
    const service = services.find((item) => item.id === serviceId)
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

  const { data: existing } = await supabase
    .from("customers")
    .select("id")
    .eq("salon_id", salonId)
    .eq("phone_normalized", phoneDigits)
    .is("deleted_at", null)
    .maybeSingle()

  if (existing) {
    const [firstName, ...rest] = fullName.split(" ")
    const normalizedEmail = email?.trim() || null

    await supabase
      .from("customers")
      .update({
        first_name: firstName ?? fullName,
        last_name: rest.join(" ") || null,
        full_name: fullName,
        email: normalizedEmail,
      })
      .eq("id", (existing as { id: string }).id)

    return (existing as { id: string }).id
  }

  const [firstName, ...rest] = fullName.split(" ")

  const { data: created, error } = await supabase
    .from("customers")
    .insert({
      salon_id: salonId,
      first_name: firstName ?? fullName,
      last_name: rest.join(" ") || null,
      full_name: fullName,
      phone: normalizedPhone,
      email: email?.trim() || null,
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
