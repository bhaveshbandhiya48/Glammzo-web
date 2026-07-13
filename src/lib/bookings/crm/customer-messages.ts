function formatAppointmentWindow(
  appointmentDate: string,
  startTime: string,
  endTime: string,
) {
  const date = new Date(`${appointmentDate}T12:00:00`)
  const dateLabel = date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
  const start = startTime.slice(0, 5)
  const end = endTime.slice(0, 5)
  return `${dateLabel}, ${start} – ${end}`
}

export function getCustomerFirstName(fullName: string) {
  const trimmed = fullName.trim()
  return trimmed.split(/\s+/)[0] || "there"
}

export type CustomerBookingMessageInput = {
  customerName: string
  customerPhone?: string | null
  salonName: string
  serviceName?: string | null
  appointmentDate: string
  startTime: string
  endTime: string
  pendingConfirmation?: boolean
}

export function buildAppointmentWhatsAppConfirmationMessage(
  input: CustomerBookingMessageInput,
) {
  const firstName = getCustomerFirstName(input.customerName)
  const schedule = formatAppointmentWindow(
    input.appointmentDate,
    input.startTime,
    input.endTime,
  )

  const lines = [
    `Hi ${firstName},`,
    "",
    input.pendingConfirmation
      ? `Your booking request at ${input.salonName} has been received.`
      : `Your appointment has been scheduled at ${input.salonName}.`,
    "",
  ]

  if (input.serviceName) {
    lines.push(`Service: ${input.serviceName}`)
  }

  lines.push(`Date & time: ${schedule}`)

  if (input.pendingConfirmation) {
    lines.push(
      "",
      "Status: Waiting for salon confirmation.",
      "We will notify you once the salon accepts or declines your request.",
    )
  }

  lines.push("", "Thank you,", input.salonName)

  return lines.join("\n")
}
