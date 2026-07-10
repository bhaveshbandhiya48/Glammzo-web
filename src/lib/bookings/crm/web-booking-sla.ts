export const DEFAULT_WEB_BOOKING_RESPONSE_SLA_MINUTES = 240

export type WebBookingSettings = {
  responseSlaMinutes: number
}

export function parseWebBookingSettings(settings: unknown): WebBookingSettings {
  if (!settings || typeof settings !== "object") {
    return { responseSlaMinutes: DEFAULT_WEB_BOOKING_RESPONSE_SLA_MINUTES }
  }

  const minutes = (settings as { webBooking?: { responseSlaMinutes?: number } }).webBooking
    ?.responseSlaMinutes

  if (typeof minutes === "number" && Number.isFinite(minutes) && minutes >= 15 && minutes <= 10080) {
    return { responseSlaMinutes: Math.round(minutes) }
  }

  return { responseSlaMinutes: DEFAULT_WEB_BOOKING_RESPONSE_SLA_MINUTES }
}

export function computeResponseDeadline(slaMinutes: number, from = new Date()) {
  return new Date(from.getTime() + slaMinutes * 60_000).toISOString()
}
