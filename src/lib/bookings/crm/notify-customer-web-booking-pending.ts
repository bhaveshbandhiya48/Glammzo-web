import "server-only"

import { buildAppointmentWhatsAppConfirmationMessage } from "@/lib/bookings/crm/customer-messages"
import { createAdminClient } from "@/lib/supabase/admin"

type NotifyCustomerInput = {
  salonId: string
  appointmentId: string
  customerId: string
  customerName: string
  customerPhone: string
  serviceNames: string
  appointmentDate: string
  startTime: string
  salonName: string
  pendingConfirmation?: boolean
  nearResponseMinutes?: number
  expiresAt?: string | null
}

export async function notifyCustomerWebBookingPending(input: NotifyCustomerInput) {
  const supabase = createAdminClient()
  const phone = input.customerPhone.trim()

  if (!phone) {
    return
  }

  const pendingConfirmation = input.pendingConfirmation !== false
  let messageContent = buildAppointmentWhatsAppConfirmationMessage({
    customerName: input.customerName,
    customerPhone: phone,
    salonName: input.salonName,
    serviceName: input.serviceNames,
    appointmentDate: input.appointmentDate,
    startTime: input.startTime,
    endTime: input.startTime,
    pendingConfirmation,
  })

  if (
    pendingConfirmation &&
    input.nearResponseMinutes &&
    input.expiresAt
  ) {
    const windowMs =
      new Date(input.expiresAt).getTime() - Date.now()
    // Near window (~15m): mention response expectation in the stub log body.
    if (windowMs > 0 && windowMs <= (input.nearResponseMinutes + 5) * 60_000) {
      messageContent = `${messageContent}\n\nThe salon usually responds within about ${input.nearResponseMinutes} minutes.`
    }
  }

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
    console.error("[web-bookings] customer pending notify failed:", error.message)
  }
}
