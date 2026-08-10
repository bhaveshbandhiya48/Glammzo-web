import "server-only"

import { CUSTOMER_CANCELLED_REASON } from "@/lib/bookings/booking-status"
import {
  buildCustomerCancelDedupeKey,
  calendarMonthKey,
  canCancelWithNotice,
  CUSTOMER_CANCEL_ENTITY_TYPE,
  CUSTOMER_CANCEL_MIN_NOTICE_HOURS,
  HIGH_CANCELLATION_MONTHLY_THRESHOLD,
} from "@/lib/bookings/cancel-policy"
import { formatSlotLabel } from "@/lib/bookings/crm/availability"
import { normalizeCustomerPhoneDigits } from "@/lib/phone/normalize"
import { createAdminClient } from "@/lib/supabase/admin"

export async function cancelCrmWebBooking(
  appointmentId: string,
  phone: string,
  cancellationReason?: string,
): Promise<
  | { success: true }
  | {
      success: false
      error: string
      code?: "too_soon" | "invalid" | "forbidden"
    }
> {
  const phoneDigits = normalizeCustomerPhoneDigits(phone)
  if (!phoneDigits) {
    return { success: false, error: "Invalid phone number.", code: "invalid" }
  }

  const reason = cancellationReason?.trim() || CUSTOMER_CANCELLED_REASON

  const supabase = createAdminClient()

  const { data: appointment, error: fetchError } = await supabase
    .from("appointments")
    .select(
      `
      id,
      customer_id,
      status,
      starts_at,
      appointment_date,
      start_time,
      end_time,
      salon_id,
      internal_notes,
      customers!inner(phone_normalized, full_name),
      appointment_services (
        sort_order,
        services ( name )
      ),
      services ( name )
    `,
    )
    .eq("id", appointmentId)
    .is("deleted_at", null)
    .maybeSingle()

  if (fetchError || !appointment) {
    return { success: false, error: "Booking not found.", code: "invalid" }
  }

  const row = appointment as unknown as {
    id: string
    customer_id: string
    status: string
    starts_at: string
    appointment_date: string
    start_time: string
    end_time: string
    salon_id: string
    internal_notes: string | null
    customers:
      | { phone_normalized: string; full_name?: string | null }
      | { phone_normalized: string; full_name?: string | null }[]
    appointment_services?: Array<{
      sort_order?: number | null
      services?: { name?: string | null } | { name?: string | null }[] | null
    }> | null
    services?: { name?: string | null } | { name?: string | null }[] | null
  }

  const customer = Array.isArray(row.customers) ? row.customers[0] : row.customers

  if (!customer || customer.phone_normalized !== phoneDigits) {
    return { success: false, error: "You cannot cancel this booking.", code: "forbidden" }
  }

  if (
    row.status === "cancelled" ||
    row.status === "completed" ||
    row.status === "rejected" ||
    row.status === "expired" ||
    row.status === "cancelled_by_customer"
  ) {
    return { success: false, error: "This booking can no longer be cancelled.", code: "invalid" }
  }

  const notice = canCancelWithNotice(row.starts_at)
  if (!notice.allowed) {
    return {
      success: false,
      error: `Cancellations must be made at least ${CUSTOMER_CANCEL_MIN_NOTICE_HOURS} hours before your appointment.`,
      code: "too_soon",
    }
  }

  const cancelledAt = new Date().toISOString()

  const { error: updateError } = await supabase
    .from("appointments")
    .update({
      status: "cancelled_by_customer",
      slot_reserved: false,
      cancelled_at: cancelledAt,
      cancellation_reason: reason,
    })
    .eq("id", appointmentId)

  if (updateError) {
    console.error("[bookings] CRM cancel failed:", updateError.message)
    return { success: false, error: "Could not cancel booking. Please try again.", code: "invalid" }
  }

  // Drop any pending reschedule request for this appointment.
  await supabase
    .from("appointment_reschedule_requests")
    .update({
      status: "cancelled",
      updated_at: cancelledAt,
      responded_at: cancelledAt,
    })
    .eq("appointment_id", appointmentId)
    .eq("status", "pending")

  const { restoreBookingWalletLoyalty } = await import("@/lib/wallet/customer-wallet")
  await restoreBookingWalletLoyalty(appointmentId)

  const {
    decrementSalonOfferRedemption,
    parseSalonOfferIdFromInternalNotes,
  } = await import("@/lib/bookings/crm/validate-salon-offer")
  const offerId = parseSalonOfferIdFromInternalNotes(row.internal_notes)
  if (offerId) {
    await decrementSalonOfferRedemption(offerId)
  }

  const monthKey = calendarMonthKey(new Date(cancelledAt))
  await recordCustomerCancellation({
    salonId: row.salon_id,
    customerId: row.customer_id,
    appointmentId: row.id,
    cancelledAt,
    monthKey,
    reason,
  })

  const serviceNames = resolveServiceNames(row)
  const customerName = customer.full_name?.trim() || "Customer"
  const timeLabel = formatSlotLabel(row.start_time)

  await notifySalonCustomerCancelled({
    salonId: row.salon_id,
    appointmentId: row.id,
    customerId: row.customer_id,
    customerName,
    serviceNames,
    appointmentDate: row.appointment_date,
    startTimeLabel: timeLabel,
  }).catch((error) => {
    console.error("[bookings] cancel notify failed:", error)
  })

  return { success: true }
}

function resolveServiceNames(row: {
  appointment_services?: Array<{
    sort_order?: number | null
    services?: { name?: string | null } | { name?: string | null }[] | null
  }> | null
  services?: { name?: string | null } | { name?: string | null }[] | null
}) {
  const fromLines = [...(row.appointment_services ?? [])]
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((line) => {
      const joined = Array.isArray(line.services) ? line.services[0] : line.services
      return joined?.name?.trim()
    })
    .filter((name): name is string => Boolean(name))

  if (fromLines.length > 0) {
    return fromLines.join(", ")
  }

  const legacy = Array.isArray(row.services) ? row.services[0] : row.services
  return legacy?.name?.trim() || "Appointment"
}

async function recordCustomerCancellation(input: {
  salonId: string
  customerId: string
  appointmentId: string
  cancelledAt: string
  monthKey: string
  reason: string
}) {
  const supabase = createAdminClient()

  const { error: insertError } = await supabase
    .from("customer_appointment_cancellations")
    .insert({
      salon_id: input.salonId,
      customer_id: input.customerId,
      appointment_id: input.appointmentId,
      cancelled_at: input.cancelledAt,
      month_key: input.monthKey,
      cancellation_reason: input.reason,
    })

  if (insertError && insertError.code !== "23505") {
    console.error("[bookings] cancel audit insert failed:", insertError.message)
  }

  const { count, error: countError } = await supabase
    .from("customer_appointment_cancellations")
    .select("id", { count: "exact", head: true })
    .eq("salon_id", input.salonId)
    .eq("customer_id", input.customerId)
    .eq("month_key", input.monthKey)

  if (countError) {
    console.error("[bookings] cancel month count failed:", countError.message)
    return
  }

  const cancelCount = count ?? 0
  if (cancelCount <= HIGH_CANCELLATION_MONTHLY_THRESHOLD) {
    return
  }

  const { error: flagError } = await supabase.from("customer_high_cancellation_flags").upsert(
    {
      salon_id: input.salonId,
      customer_id: input.customerId,
      month_key: input.monthKey,
      cancel_count: cancelCount,
      flagged_at: input.cancelledAt,
      updated_at: input.cancelledAt,
      notes: `Auto-flagged after ${cancelCount} customer cancels in ${input.monthKey}. Future: booking fee / deposit.`,
    },
    { onConflict: "salon_id,customer_id,month_key" },
  )

  if (flagError) {
    console.error("[bookings] high-cancellation flag upsert failed:", flagError.message)
  }
}

async function notifySalonCustomerCancelled(input: {
  salonId: string
  appointmentId: string
  customerId: string
  customerName: string
  serviceNames: string
  appointmentDate: string
  startTimeLabel: string
}) {
  const supabase = createAdminClient()

  const { error } = await supabase.from("notifications").insert({
    salon_id: input.salonId,
    type: "system_notification",
    priority: "medium",
    title: "Booking cancelled by customer",
    message: `${input.customerName} cancelled ${input.serviceNames} on ${input.appointmentDate} at ${input.startTimeLabel}.`,
    entity_id: input.appointmentId,
    entity_type: CUSTOMER_CANCEL_ENTITY_TYPE,
    dedupe_key: buildCustomerCancelDedupeKey(input.appointmentId),
    is_read: false,
  })

  if (error && error.code !== "23505") {
    console.error("[bookings] cancel notification insert failed:", error.message)
  }
}
