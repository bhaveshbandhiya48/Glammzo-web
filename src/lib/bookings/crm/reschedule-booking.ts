import "server-only"

import { pickStaffForSlot } from "@/lib/bookings/crm/availability"
import { validateAppointmentBusinessHours } from "@/lib/bookings/crm/business-hours"
import { fetchSalonBookingContextForReschedule } from "@/lib/bookings/crm/salon-context"
import {
  addMinutesToTime,
  getSalonDateKey,
  getSalonTimeKey,
  normalizeTime,
} from "@/lib/bookings/crm/time"
import { normalizeCustomerPhoneDigits } from "@/lib/phone/normalize"
import { createAdminClient } from "@/lib/supabase/admin"

export async function rescheduleCrmWebBooking(input: {
  appointmentId: string
  phone: string
  appointmentDate: string
  startTime: string
}): Promise<
  | { success: true }
  | { success: false; error: string; code?: "slot_taken" | "invalid" | "forbidden" }
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
      booking_source,
      internal_notes,
      customers!inner(phone_normalized)
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
    booking_source: string | null
    internal_notes: string | null
    customers: { phone_normalized: string } | { phone_normalized: string }[]
  }

  const customer = Array.isArray(row.customers) ? row.customers[0] : row.customers
  if (!customer || customer.phone_normalized !== phoneDigits) {
    return { success: false, error: "You cannot reschedule this booking.", code: "forbidden" }
  }

  if (row.status === "cancelled" || row.status === "completed" || row.status === "no_show") {
    return { success: false, error: "This booking can no longer be rescheduled.", code: "invalid" }
  }

  const { data: serviceRows } = await supabase
    .from("appointment_services")
    .select("service_id")
    .eq("appointment_id", row.id)
    .order("sort_order", { ascending: true })

  const serviceIds = (serviceRows ?? []).map((item) => (item as { service_id: string }).service_id)

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

  const { error: updateError } = await supabase
    .from("appointments")
    .update({
      appointment_date: input.appointmentDate,
      start_time: startTime,
      end_time: endTime,
      staff_id: staffId,
    })
    .eq("id", row.id)

  if (updateError) {
    console.error("[bookings] CRM reschedule failed:", updateError.message)
    return { success: false, error: "Could not reschedule booking. Please try again.", code: "invalid" }
  }

  return { success: true }
}
