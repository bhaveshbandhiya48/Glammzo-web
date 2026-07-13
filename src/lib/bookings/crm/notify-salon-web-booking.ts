import "server-only"

import { formatSlotLabel } from "@/lib/bookings/crm/availability"
import { createAdminClient } from "@/lib/supabase/admin"

const WEB_BOOKING_ENTITY_TYPE = "web_booking"

const WEB_BOOKING_DEDUPE_PREFIX = "web_booking:"

function buildOwnerWhatsAppMessage(input: {
  salonName: string
  customerName: string
  serviceNames: string
  appointmentDate: string
  startTime: string
}) {
  return [
    `💈 New Glammzo booking for ${input.salonName}`,
    "",
    `${input.customerName} booked ${input.serviceNames}.`,
    `When: ${input.appointmentDate} at ${input.startTime}`,
    "",
    "You have a new appointment. Please open Glammzo CRM to accept or decline.",
  ].join("\n")
}

type NotifySalonInput = {
  salonId: string
  appointmentId: string
  customerId: string
  customerName: string
  serviceNames: string
  appointmentDate: string
  startTime: string
}

export async function notifySalonNewWebBooking(input: NotifySalonInput) {
  const supabase = createAdminClient()

  const { data: salon } = await supabase
    .from("salons")
    .select("name, phone")
    .eq("id", input.salonId)
    .is("deleted_at", null)
    .maybeSingle()

  const salonName = (salon as { name?: string } | null)?.name?.trim() || "Your salon"
  const salonPhone = (salon as { phone?: string | null } | null)?.phone?.trim() || ""

  const timeLabel = formatSlotLabel(input.startTime)

  const { error: notificationError } = await supabase
    .from("notifications")
    .insert({
      salon_id: input.salonId,
      type: "system_notification",
      priority: "high",
      title: "New web booking",
      message: `${input.customerName} booked ${input.serviceNames} on ${input.appointmentDate} at ${timeLabel}. Accept or decline this appointment.`,
      entity_id: input.appointmentId,
      entity_type: WEB_BOOKING_ENTITY_TYPE,
      dedupe_key: `${WEB_BOOKING_DEDUPE_PREFIX}${input.appointmentId}`,
      is_read: false,
    })
    .select("id")
    .single()

  if (notificationError && notificationError.code !== "23505") {
    console.error("[web-bookings] notification insert failed:", notificationError.message)
  }

  const ownerPhones = await resolveOwnerPhones(supabase, input.salonId, salonPhone)
  const messageContent = buildOwnerWhatsAppMessage({
    salonName,
    customerName: input.customerName,
    serviceNames: input.serviceNames,
    appointmentDate: input.appointmentDate,
    startTime: timeLabel,
  })

  for (const phone of ownerPhones) {
    const { error } = await supabase.from("message_logs").insert({
      salon_id: input.salonId,
      customer_id: input.customerId,
      phone,
      template_id: null,
      message_content: messageContent,
      status: "pending",
      sent_at: null,
    })

    if (error) {
      console.error("[web-bookings] owner WhatsApp stub failed:", error.message)
    }
  }
}

type AdminClient = ReturnType<typeof createAdminClient>

async function resolveOwnerPhones(
  supabase: AdminClient,
  salonId: string,
  salonPhone: string,
): Promise<string[]> {
  const { data: memberships } = await supabase
    .from("user_salons")
    .select("users ( phone )")
    .eq("salon_id", salonId)
    .eq("role", "owner")
    .eq("is_active", true)
    .is("deleted_at", null)

  const phones = new Set<string>()

  for (const row of memberships ?? []) {
    const users = (row as { users: { phone?: string | null } | { phone?: string | null }[] | null })
      .users
    const user = Array.isArray(users) ? users[0] : users
    const phone = user?.phone?.trim()

    if (phone) {
      phones.add(phone)
    }
  }

  if (phones.size === 0 && salonPhone) {
    phones.add(salonPhone)
  }

  return [...phones]
}
