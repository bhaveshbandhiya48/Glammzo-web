import type { BusinessHoursSettings, Weekday } from "@/lib/bookings/crm/types"
import {
  getSalonDateKey,
  getSalonTimeKey,
  getWeekdayFromDateKey,
  timeToMinutes,
} from "@/lib/bookings/crm/time"
import { shiftIsoDate } from "@/lib/date-utils"

/** Marketplace booking confirmation timing (shared CRM + Glammzo-web). */
export const BOOKING_ENGINE_CONFIG = {
  maxAdvanceBookingDays: 7,
  farLeadHours: 4,
  nearResponseMinutes: 15,
  minManualLeadMinutes: 30,
  farDeadlineBeforeAppointmentHours: 2,
  ownerPendingReminderBeforeDeadlineMinutes: 60,
  /** @deprecated Prefer per-salon booking_confirmation_mode + dynamic windows */
  confirmationRequired: true,
  /** @deprecated Prefer nearResponseMinutes / far deadline helpers */
  acceptanceWindowMinutes: 15,
} as const

export type BookingConfirmationMode = "AUTO_CONFIRM" | "MANUAL_CONFIRM"

export function resolveConfirmationMode(
  value: string | null | undefined,
): BookingConfirmationMode {
  return value === "MANUAL_CONFIRM" ? "MANUAL_CONFIRM" : "AUTO_CONFIRM"
}

export function isAutoConfirmMode(mode: BookingConfirmationMode) {
  return mode === "AUTO_CONFIRM"
}

/** Lead time from now until appointment start (salon-local date + HH:MM). */
export function getAppointmentLeadMinutes(
  appointmentDate: string,
  startTime: string,
  timezone: string,
  now: Date = new Date(),
): number {
  const startUtc = salonLocalDateTimeToUtc(
    appointmentDate,
    startTime.slice(0, 5),
    timezone,
  )
  return (startUtc.getTime() - now.getTime()) / 60_000
}

export function isManualNearSlotBlocked(leadMinutes: number): boolean {
  return leadMinutes < BOOKING_ENGINE_CONFIG.minManualLeadMinutes
}

/**
 * Manual confirmation deadline:
 * - lead > 4h → appointmentStart − 2h
 * - otherwise → now + 15m
 * Caller must block lead < 30m before create.
 */
export function computeManualExpiresAt(input: {
  appointmentDate: string
  startTime: string
  timezone: string
  now?: Date
}): string {
  const now = input.now ?? new Date()
  const appointmentStart = salonLocalDateTimeToUtc(
    input.appointmentDate,
    input.startTime.slice(0, 5),
    input.timezone,
  )
  const leadMinutes =
    (appointmentStart.getTime() - now.getTime()) / 60_000
  const farLeadMinutes = BOOKING_ENGINE_CONFIG.farLeadHours * 60

  if (leadMinutes > farLeadMinutes) {
    const deadline = new Date(
      appointmentStart.getTime() -
        BOOKING_ENGINE_CONFIG.farDeadlineBeforeAppointmentHours * 60 * 60_000,
    )
    if (deadline.getTime() <= now.getTime()) {
      return new Date(
        now.getTime() + BOOKING_ENGINE_CONFIG.nearResponseMinutes * 60_000,
      ).toISOString()
    }
    return deadline.toISOString()
  }

  return new Date(
    now.getTime() + BOOKING_ENGINE_CONFIG.nearResponseMinutes * 60_000,
  ).toISOString()
}

export function remainingConfirmationSeconds(
  expiresAt: string | null | undefined,
  now = new Date(),
): number | null {
  if (!expiresAt) {
    return null
  }
  return Math.max(
    0,
    Math.floor((new Date(expiresAt).getTime() - now.getTime()) / 1000),
  )
}

export const WEB_BOOKING_REJECT_REASONS = [
  "Staff unavailable",
  "Salon closed",
  "Fully booked",
  "Personal reason",
  "Other",
] as const

export type WebBookingRejectReason = (typeof WEB_BOOKING_REJECT_REASONS)[number]

export type BusinessClosure = {
  id: string
  closureType: "full_day" | "partial_day"
  startDate: string
  endDate: string | null
  startTime: string | null
  endTime: string | null
}

function normalizeHHMM(value: string) {
  return value.slice(0, 5)
}

function compareDateKeys(left: string, right: string) {
  return left.localeCompare(right)
}

function isDateInClosureRange(dateKey: string, closure: BusinessClosure) {
  const endDate = closure.endDate ?? closure.startDate
  return compareDateKeys(dateKey, closure.startDate) >= 0 && compareDateKeys(dateKey, endDate) <= 0
}

export function isSalonOpenAt(
  businessHours: BusinessHoursSettings,
  timezone: string,
  at: Date = new Date(),
): boolean {
  const dateKey = getSalonDateKey(at, timezone)
  const timeKey = getSalonTimeKey(at, timezone)
  const weekday = getWeekdayFromDateKey(dateKey) as Weekday
  const schedule = businessHours.weeklySchedule[weekday]

  if (!schedule?.enabled) {
    return false
  }

  const time = normalizeHHMM(timeKey)
  const open = normalizeHHMM(schedule.open)
  const close = normalizeHHMM(schedule.close)

  return time >= open && time < close
}

export function salonLocalDateTimeToUtc(
  dateKey: string,
  timeHHMM: string,
  timezone: string,
): Date {
  const [year, month, day] = dateKey.split("-").map(Number)
  const [hour, minute] = normalizeHHMM(timeHHMM).split(":").map(Number)
  let candidate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0))

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const localDate = getSalonDateKey(candidate, timezone)
    const localTime = getSalonTimeKey(candidate, timezone)
    const targetMinutes = hour * 60 + minute
    const actualMinutes = timeToMinutes(localTime)

    const [localY, localM, localD] = localDate.split("-").map(Number)
    const localDayIndex = Date.UTC(localY, localM - 1, localD)
    const targetDayIndex = Date.UTC(year, month - 1, day)
    const dayDiff = Math.round((targetDayIndex - localDayIndex) / 86_400_000)
    const offsetMinutes = dayDiff * 24 * 60 + (targetMinutes - actualMinutes)

    if (offsetMinutes === 0) {
      return candidate
    }

    candidate = new Date(candidate.getTime() + offsetMinutes * 60_000)
  }

  return candidate
}

export function getNextSalonOpenTime(
  businessHours: BusinessHoursSettings,
  timezone: string,
  from: Date = new Date(),
): Date {
  const fromDateKey = getSalonDateKey(from, timezone)

  for (let offset = 0; offset < 8; offset += 1) {
    const dateKey = shiftIsoDate(fromDateKey, offset)
    const weekday = getWeekdayFromDateKey(dateKey) as Weekday
    const schedule = businessHours.weeklySchedule[weekday]

    if (!schedule?.enabled) {
      continue
    }

    const openInstant = salonLocalDateTimeToUtc(dateKey, schedule.open, timezone)

    if (offset === 0) {
      const nowTime = normalizeHHMM(getSalonTimeKey(from, timezone))
      const openTime = normalizeHHMM(schedule.open)

      if (nowTime < openTime) {
        return openInstant
      }

      if (nowTime >= openTime && nowTime < normalizeHHMM(schedule.close)) {
        return from
      }

      continue
    }

    if (openInstant > from) {
      return openInstant
    }
  }

  return new Date(from.getTime() + BOOKING_ENGINE_CONFIG.acceptanceWindowMinutes * 60_000)
}

export function computeBookingExpiresAt(
  businessHours: BusinessHoursSettings,
  timezone: string,
  bookedAt: Date = new Date(),
): string {
  const acceptanceMs = BOOKING_ENGINE_CONFIG.acceptanceWindowMinutes * 60_000

  if (isSalonOpenAt(businessHours, timezone, bookedAt)) {
    return new Date(bookedAt.getTime() + acceptanceMs).toISOString()
  }

  const nextOpen = getNextSalonOpenTime(businessHours, timezone, bookedAt)
  const openInstant = nextOpen.getTime() === bookedAt.getTime()
    ? bookedAt
    : nextOpen

  return new Date(openInstant.getTime() + acceptanceMs).toISOString()
}

export function isBookingExpired(expiresAt: string | null | undefined, now = new Date()) {
  if (!expiresAt) {
    return false
  }

  return new Date(expiresAt).getTime() <= now.getTime()
}

export function getMaxBookableDateKey(timezone: string, from: Date = new Date()) {
  const today = getSalonDateKey(from, timezone)
  return shiftIsoDate(today, BOOKING_ENGINE_CONFIG.maxAdvanceBookingDays)
}

export function isDateBeyondMaxAdvance(
  appointmentDate: string,
  timezone: string,
  from: Date = new Date(),
) {
  return compareDateKeys(appointmentDate, getMaxBookableDateKey(timezone, from)) > 0
}

/**
 * When salon is closed and customer books for tomorrow (Manual mode), hide slots
 * during the near-response window after opening.
 */
export function getTomorrowAcceptanceMinStartTime(
  businessHours: BusinessHoursSettings,
  timezone: string,
  appointmentDate: string,
  now: Date = new Date(),
  options?: { bufferMinutes?: number },
): string | undefined {
  const bufferMinutes =
    options?.bufferMinutes ?? BOOKING_ENGINE_CONFIG.nearResponseMinutes

  if (bufferMinutes <= 0) {
    return undefined
  }

  const today = getSalonDateKey(now, timezone)
  const tomorrow = shiftIsoDate(today, 1)

  if (appointmentDate !== tomorrow) {
    return undefined
  }

  if (isSalonOpenAt(businessHours, timezone, now)) {
    return undefined
  }

  const weekday = getWeekdayFromDateKey(tomorrow) as Weekday
  const schedule = businessHours.weeklySchedule[weekday]

  if (!schedule?.enabled) {
    return undefined
  }

  const openMinutes = timeToMinutes(schedule.open)
  const earliestMinutes = openMinutes + bufferMinutes
  const hours = Math.floor(earliestMinutes / 60)
  const mins = earliestMinutes % 60

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:00`
}

export function isDateFullyClosedByClosure(dateKey: string, closures: BusinessClosure[]) {
  return closures.some(
    (closure) =>
      closure.closureType === "full_day" && isDateInClosureRange(dateKey, closure),
  )
}

export function isSlotBlockedByPartialClosure(
  dateKey: string,
  startTime: string,
  endTime: string,
  closures: BusinessClosure[],
) {
  const startMinutes = timeToMinutes(startTime)
  const endMinutes = timeToMinutes(endTime)

  return closures.some((closure) => {
    if (closure.closureType !== "partial_day") {
      return false
    }

    if (!isDateInClosureRange(dateKey, closure)) {
      return false
    }

    if (!closure.startTime || !closure.endTime) {
      return false
    }

    const closureStart = timeToMinutes(closure.startTime)
    const closureEnd = timeToMinutes(closure.endTime)

    return startMinutes < closureEnd && endMinutes > closureStart
  })
}

export function isAppointmentBlockedByClosures(
  appointmentDate: string,
  startTime: string,
  endTime: string,
  closures: BusinessClosure[],
) {
  if (isDateFullyClosedByClosure(appointmentDate, closures)) {
    return true
  }

  return isSlotBlockedByPartialClosure(appointmentDate, startTime, endTime, closures)
}
