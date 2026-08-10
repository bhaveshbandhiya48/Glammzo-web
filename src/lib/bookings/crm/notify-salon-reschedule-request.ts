import "server-only"

import { formatSlotLabel } from "@/lib/bookings/crm/availability"
import { createAdminClient } from "@/lib/supabase/admin"

const RESCHEDULE_ENTITY_TYPE = "web_reschedule"
const RESCHEDULE_DEDUPE_PREFIX = "web_reschedule:"

type NotifySalonRescheduleInput = {
  salonId: string
  appointmentId: string
  requestId: string
  customerId: string
  customerName: string
  serviceNames: string
  originalAppointmentDate: string
  originalStartTime: string
  requestedAppointmentDate: string
  requestedStartTime: string
}

/**
 * Creates the salon in-app notification for a customer reschedule request.
 * CRM ensure/process path sends Meta WhatsApp (owner + customer requested).
 */
export async function notifySalonRescheduleRequest(input: NotifySalonRescheduleInput) {
  const supabase = createAdminClient()

  const originalLabel = `${input.originalAppointmentDate} at ${formatSlotLabel(input.originalStartTime)}`
  const requestedLabel = `${input.requestedAppointmentDate} at ${formatSlotLabel(input.requestedStartTime)}`

  const { error } = await supabase
    .from("notifications")
    .insert({
      salon_id: input.salonId,
      type: "system_notification",
      priority: "high",
      title: "Reschedule requested",
      message: `${input.customerName} requested a new time for ${input.serviceNames}. Original: ${originalLabel}. Requested: ${requestedLabel}. Accept or decline.`,
      entity_id: input.requestId,
      entity_type: RESCHEDULE_ENTITY_TYPE,
      dedupe_key: `${RESCHEDULE_DEDUPE_PREFIX}${input.requestId}`,
      is_read: false,
    })
    .select("id")
    .single()

  if (error && error.code !== "23505") {
    console.error("[reschedule] notification insert failed:", error.message)
  }
}
