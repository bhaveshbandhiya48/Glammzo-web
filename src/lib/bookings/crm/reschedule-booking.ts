import "server-only"

import { pickStaffForSlot } from "@/lib/bookings/crm/availability"
import { validateAppointmentBusinessHours } from "@/lib/bookings/crm/business-hours"
import { fetchSalonBookingContextForReschedule } from "@/lib/bookings/crm/salon-context"
import { notifySalonRescheduleRequest } from "@/lib/bookings/crm/notify-salon-reschedule-request"
import {
  addMinutesToTime,
  getSalonDateKey,
  getSalonTimeKey,
  normalizeTime,
} from "@/lib/bookings/crm/time"
import {
  canRescheduleWithNotice,
  CUSTOMER_RESCHEDULE_MIN_NOTICE_HOURS,
} from "@/lib/bookings/cancel-policy"
import { normalizeCustomerPhoneDigits } from "@/lib/phone/normalize"
import { createAdminClient } from "@/lib/supabase/admin"

/** After this many declined requests, customer must contact the salon. */
export const MAX_DECLINED_RESCHEDULE_ATTEMPTS = 3

export async function countDeclinedRescheduleAttempts(
  appointmentId: string,
): Promise<number> {
  const supabase = createAdminClient()
  const { count, error } = await supabase
    .from("appointment_reschedule_requests")
    .select("id", { count: "exact", head: true })
    .eq("appointment_id", appointmentId)
    .eq("status", "declined")

  if (error) {
    console.error("[bookings] declined reschedule count failed:", error.message)
    return 0
  }

  return count ?? 0
}

export async function hasPendingRescheduleRequest(
  appointmentId: string,
): Promise<boolean> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("appointment_reschedule_requests")
    .select("id")
    .eq("appointment_id", appointmentId)
    .eq("status", "pending")
    .maybeSingle()

  if (error) {
    console.error("[bookings] pending reschedule lookup failed:", error.message)
    return false
  }

  return Boolean(data)
}

/**
 * Creates a pending reschedule request. Does not change the live appointment
 * slot until the salon accepts in CRM.
 */
export async function rescheduleCrmWebBooking(input: {
  appointmentId: string
  phone: string
  appointmentDate: string
  startTime: string
}): Promise<
  | { success: true }
  | {
      success: false
      error: string
      code?:
        | "slot_taken"
        | "invalid"
        | "forbidden"
        | "pending"
        | "contact_salon"
        | "too_soon"
    }
> {
  const phoneDigits = normalizeCustomerPhoneDigits(input.phone)
  if (!phoneDigits) {
    return { success: false, error: "Invalid phone number.", code: "invalid" }
  }

  const supabase = createAdminClient()

  const { data: appointment, error: fetchError } = await supabase
    .from("appointments")
    .select(
      `
      id,
      salon_id,
      customer_id,
      staff_id,
      status,
      duration_minutes,
      appointment_date,
      start_time,
      end_time,
      starts_at,
      booking_source,
      internal_notes,
      customers!inner(phone_normalized, full_name)
    `,
    )
    .eq("id", input.appointmentId)
    .is("deleted_at", null)
    .maybeSingle()

  if (fetchError || !appointment) {
    return { success: false, error: "Booking not found.", code: "invalid" }
  }

  const row = appointment as unknown as {
    id: string
    salon_id: string
    customer_id: string
    staff_id: string | null
    status: string
    duration_minutes: number
    appointment_date: string
    start_time: string
    end_time: string
    starts_at: string | null
    booking_source: string | null
    internal_notes: string | null
    customers:
      | { phone_normalized: string; full_name?: string | null }
      | { phone_normalized: string; full_name?: string | null }[]
  }

  const customer = Array.isArray(row.customers) ? row.customers[0] : row.customers
  if (!customer || customer.phone_normalized !== phoneDigits) {
    return { success: false, error: "You cannot reschedule this booking.", code: "forbidden" }
  }

  if (
    row.status === "cancelled" ||
    row.status === "completed" ||
    row.status === "no_show" ||
    row.status === "rejected" ||
    row.status === "expired"
  ) {
    return { success: false, error: "This booking can no longer be rescheduled.", code: "invalid" }
  }

  const notice = canRescheduleWithNotice(row.starts_at)
  if (!notice.allowed) {
    return {
      success: false,
      error: `Reschedules must be made at least ${CUSTOMER_RESCHEDULE_MIN_NOTICE_HOURS} hours before your appointment.`,
      code: "too_soon",
    }
  }

  const declinedCount = await countDeclinedRescheduleAttempts(row.id)
  if (declinedCount >= MAX_DECLINED_RESCHEDULE_ATTEMPTS) {
    return {
      success: false,
      error:
        "The salon has declined your previous reschedule requests. Please contact the salon to find a suitable time.",
      code: "contact_salon",
    }
  }

  if (await hasPendingRescheduleRequest(row.id)) {
    return {
      success: false,
      error:
        "You already have a reschedule request waiting for the salon. Please wait for their response.",
      code: "pending",
    }
  }

  const { data: serviceRows } = await supabase
    .from("appointment_services")
    .select("service_id, services(name)")
    .eq("appointment_id", row.id)
    .order("sort_order", { ascending: true })

  const serviceIds = (serviceRows ?? []).map((item) => (item as { service_id: string }).service_id)
  const serviceNames = (serviceRows ?? [])
    .map((item) => {
      const services = (item as { services?: { name?: string } | { name?: string }[] | null })
        .services
      const service = Array.isArray(services) ? services[0] : services
      return service?.name?.trim()
    })
    .filter((name): name is string => Boolean(name))

  if (serviceIds.length === 0) {
    return { success: false, error: "Could not load services for this booking.", code: "invalid" }
  }

  const context = await fetchSalonBookingContextForReschedule(row.salon_id, row.id)
  if (!context) {
    return { success: false, error: "This salon is not available for rescheduling.", code: "invalid" }
  }

  const durationMinutes = row.duration_minutes
  const startTime = normalizeTime(input.startTime)
  const endTime = addMinutesToTime(startTime, durationMinutes)

  const today = getSalonDateKey(new Date(), context.timezone)
  if (input.appointmentDate < today) {
    return { success: false, error: "Appointments cannot be scheduled in the past.", code: "invalid" }
  }

  if (input.appointmentDate === today) {
    const nowTime = getSalonTimeKey(new Date(), context.timezone)
    if (startTime.slice(0, 5) < nowTime.slice(0, 5)) {
      return { success: false, error: "Start time cannot be in the past.", code: "invalid" }
    }
  }

  if (
    input.appointmentDate === row.appointment_date &&
    startTime.slice(0, 5) === normalizeTime(row.start_time).slice(0, 5)
  ) {
    return {
      success: false,
      error: "Please choose a different time from your current appointment.",
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
    serviceIds,
    input.appointmentDate,
    startTime,
    endTime,
    row.staff_id,
  )

  if (!staffId) {
    return {
      success: false,
      error: "That time slot was just taken. Please choose another.",
      code: "slot_taken",
    }
  }

  const { data: inserted, error: insertError } = await supabase
    .from("appointment_reschedule_requests")
    .insert({
      appointment_id: row.id,
      salon_id: row.salon_id,
      status: "pending",
      original_appointment_date: row.appointment_date,
      original_start_time: normalizeTime(row.start_time),
      original_end_time: normalizeTime(row.end_time),
      original_staff_id: row.staff_id,
      requested_appointment_date: input.appointmentDate,
      requested_start_time: startTime,
      requested_end_time: endTime,
      requested_staff_id: staffId,
    })
    .select("id")
    .single()

  if (insertError || !inserted) {
    console.error("[bookings] CRM reschedule request failed:", insertError?.message)
    if (insertError?.code === "23505") {
      return {
        success: false,
        error:
          "You already have a reschedule request waiting for the salon. Please wait for their response.",
        code: "pending",
      }
    }
    return { success: false, error: "Could not submit reschedule request. Please try again.", code: "invalid" }
  }

  const requestId = (inserted as { id: string }).id

  await notifySalonRescheduleRequest({
    salonId: row.salon_id,
    appointmentId: row.id,
    requestId,
    customerId: row.customer_id,
    customerName: customer.full_name?.trim() || "Customer",
    serviceNames: serviceNames.join(", ") || "Appointment",
    originalAppointmentDate: row.appointment_date,
    originalStartTime: normalizeTime(row.start_time),
    requestedAppointmentDate: input.appointmentDate,
    requestedStartTime: startTime,
  }).catch((error) => {
    console.error("[bookings] reschedule notify failed:", error)
  })

  return { success: true }
}
