export const DEFAULT_WEB_BOOKING_RESPONSE_SLA_MINUTES = 60

export type WebBookingSettings = {
  responseSlaMinutes: number
}

export {
  BOOKING_ENGINE_CONFIG,
  computeBookingExpiresAt as computeResponseDeadline,
} from "@/lib/bookings/crm/booking-confirmation-engine"

export function parseWebBookingSettings(settings: unknown): WebBookingSettings {
  return { responseSlaMinutes: DEFAULT_WEB_BOOKING_RESPONSE_SLA_MINUTES }
}

export function formatSlaLabel(minutes: number) {
  if (minutes < 60) {
    return `${minutes} minutes`
  }

  const hours = Math.round(minutes / 60)
  return hours === 1 ? "1 hour" : `${hours} hours`
}
