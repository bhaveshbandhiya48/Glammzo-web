import "server-only"

import { CUSTOMER_CANCELLED_REASON } from "@/lib/bookings/booking-status"
import { normalizeCustomerPhoneDigits } from "@/lib/phone/normalize"
import { createAdminClient } from "@/lib/supabase/admin"

export async function cancelCrmWebBooking(
  appointmentId: string,
  phone: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const phoneDigits = normalizeCustomerPhoneDigits(phone)
  if (!phoneDigits) {
    return { success: false, error: "Invalid phone number." }
  }

  const supabase = createAdminClient()

  const { data: appointment, error: fetchError } = await supabase
    .from("appointments")
    .select("id, customer_id, status, starts_at, salon_id, customers!inner(phone_normalized)")
    .eq("id", appointmentId)
    .is("deleted_at", null)
    .maybeSingle()

  if (fetchError || !appointment) {
    return { success: false, error: "Booking not found." }
  }

  const row = appointment as unknown as {
    id: string
    status: string
    starts_at: string
    salon_id: string
    customers: { phone_normalized: string } | { phone_normalized: string }[]
  }

  const customer = Array.isArray(row.customers) ? row.customers[0] : row.customers

  if (!customer || customer.phone_normalized !== phoneDigits) {
    return { success: false, error: "You cannot cancel this booking." }
  }

  if (row.status === "cancelled" || row.status === "completed") {
    return { success: false, error: "This booking can no longer be cancelled." }
  }

  const { error: updateError } = await supabase
    .from("appointments")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancellation_reason: CUSTOMER_CANCELLED_REASON,
    })
    .eq("id", appointmentId)

  if (updateError) {
    console.error("[bookings] CRM cancel failed:", updateError.message)
    return { success: false, error: "Could not cancel booking. Please try again." }
  }

  return { success: true }
}
