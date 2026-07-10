import type { BusinessHoursSettings, DaySchedule, Weekday } from "@/lib/bookings/crm/types"
import { getWeekdayFromDateKey } from "@/lib/bookings/crm/time"

const DEFAULT_WEEKLY_SCHEDULE: Record<Weekday, DaySchedule> = {
  monday: { enabled: true, open: "09:00", close: "18:00" },
  tuesday: { enabled: true, open: "09:00", close: "18:00" },
  wednesday: { enabled: true, open: "09:00", close: "18:00" },
  thursday: { enabled: true, open: "09:00", close: "18:00" },
  friday: { enabled: true, open: "09:00", close: "18:00" },
  saturday: { enabled: true, open: "09:00", close: "18:00" },
  sunday: { enabled: false, open: "09:00", close: "18:00" },
}

export const DEFAULT_BUSINESS_HOURS: BusinessHoursSettings = {
  openingTime: "09:00",
  closingTime: "18:00",
  weeklySchedule: DEFAULT_WEEKLY_SCHEDULE,
}

export function parseBusinessHours(settings: unknown): BusinessHoursSettings {
  if (!settings || typeof settings !== "object") {
    return DEFAULT_BUSINESS_HOURS
  }

  const raw = settings as { businessHours?: Partial<BusinessHoursSettings> }
  const hours = raw.businessHours

  if (!hours?.weeklySchedule) {
    return DEFAULT_BUSINESS_HOURS
  }

  return {
    openingTime: hours.openingTime ?? DEFAULT_BUSINESS_HOURS.openingTime,
    closingTime: hours.closingTime ?? DEFAULT_BUSINESS_HOURS.closingTime,
    weeklySchedule: {
      ...DEFAULT_WEEKLY_SCHEDULE,
      ...hours.weeklySchedule,
    },
  }
}

export function validateAppointmentBusinessHours(
  businessHours: BusinessHoursSettings,
  appointmentDate: string,
  startTime: string,
  endTime: string,
): { valid: true } | { valid: false; error: string } {
  const weekday = getWeekdayFromDateKey(appointmentDate) as Weekday
  const schedule = businessHours.weeklySchedule[weekday]

  if (!schedule?.enabled) {
    return {
      valid: false,
      error: `The salon is closed on ${weekday}.`,
    }
  }

  const open = schedule.open.slice(0, 5)
  const close = schedule.close.slice(0, 5)
  const start = startTime.slice(0, 5)
  const end = endTime.slice(0, 5)

  if (start < open || end > close || start >= end) {
    return {
      valid: false,
      error: `Appointment must fall within business hours (${open} to ${close}).`,
    }
  }

  return { valid: true }
}
