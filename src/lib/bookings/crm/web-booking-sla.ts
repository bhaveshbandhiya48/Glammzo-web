import {
  BOOKING_ENGINE_CONFIG,
  computeManualExpiresAt,
  resolveConfirmationMode,
  type BookingConfirmationMode,
  remainingConfirmationSeconds,
} from "@/lib/bookings/crm/booking-confirmation-engine"

export const DEFAULT_WEB_BOOKING_RESPONSE_SLA_MINUTES =
  BOOKING_ENGINE_CONFIG.nearResponseMinutes

export type WebBookingSettings = {
  confirmationMode: BookingConfirmationMode
  confirmationRequired: boolean
  responseSlaMinutes: number
}

export {
  BOOKING_ENGINE_CONFIG,
  computeManualExpiresAt,
  remainingConfirmationSeconds,
  resolveConfirmationMode,
}

export function parseWebBookingSettings(
  mode: string | null | undefined,
): WebBookingSettings {
  const confirmationMode = resolveConfirmationMode(mode)
  return {
    confirmationMode,
    confirmationRequired: confirmationMode === "MANUAL_CONFIRM",
    responseSlaMinutes: BOOKING_ENGINE_CONFIG.nearResponseMinutes,
  }
}

export function formatSlaLabel(minutes: number) {
  if (minutes < 60) {
    return `${minutes} minutes`
  }

  const hours = Math.round(minutes / 60)
  return hours === 1 ? "1 hour" : `${hours} hours`
}
