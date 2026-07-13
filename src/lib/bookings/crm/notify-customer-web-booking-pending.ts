import "server-only"

import { formatSlotLabel } from "@/lib/bookings/crm/availability"
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
}

export async function notifyCustomerWebBookingPending(input: NotifyCustomerInput) {
  const supabase = createAdminClient()
  const phone = input.customerPhone.trim()

  if (!phone) {
    return
  }

  const timeLabel = formatSlotLabel(input.startTime)
  const messageContent = buildAppointmentWhatsAppConfirmationMessage({
    customerName: input.customerName,
    customerPhone: phone,
    salonName: input.salonName,
    serviceName: input.serviceNames,
    appointmentDate: input.appointmentDate,
    startTime: input.startTime,
    endTime: input.startTime,
    pendingConfirmation: true,
  })

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
