const DEFAULT_TIMEZONE = "Asia/Kolkata"

export function getSalonDateKey(date: Date, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date)
  } catch {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: DEFAULT_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date)
  }
}

export function getSalonTimeKey(date: Date, timezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    const parts = formatter.formatToParts(date)
    const hour = parts.find((part) => part.type === "hour")?.value ?? "00"
    const minute = parts.find((part) => part.type === "minute")?.value ?? "00"

    return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`
  } catch {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: DEFAULT_TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    const parts = formatter.formatToParts(date)
    const hour = parts.find((part) => part.type === "hour")?.value ?? "00"
    const minute = parts.find((part) => part.type === "minute")?.value ?? "00"

    return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`
  }
}

export function normalizeTime(value: string) {
  if (value.length === 5) {
    return `${value}:00`
  }

  return value.slice(0, 8)
}

export function timeToMinutes(value: string) {
  const normalized = normalizeTime(value)
  const [hours, mins] = normalized.split(":").map(Number)
  return hours * 60 + mins
}

export function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`
}

export function addMinutesToTime(startTime: string, minutes: number) {
  const total = timeToMinutes(startTime) + minutes
  return minutesToTime(total)
}

export function rangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
) {
  const aStart = timeToMinutes(startA)
  const aEnd = timeToMinutes(endA)
  const bStart = timeToMinutes(startB)
  const bEnd = timeToMinutes(endB)

  return aStart < bEnd && aEnd > bStart
}

export function formatTimeLabel(value: string) {
  const normalized = normalizeTime(value)
  const [hours, mins] = normalized.split(":").map(Number)
  const period = hours >= 12 ? "PM" : "AM"
  const hour12 = hours % 12 || 12
  return `${hour12}:${String(mins).padStart(2, "0")} ${period}`
}

const WEEKDAY_BY_INDEX = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const

export function getWeekdayFromDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return WEEKDAY_BY_INDEX[date.getUTCDay()] ?? "monday"
}

const DEFAULT_INTERVAL_MINUTES = 15

export function roundUpToInterval(time: string, intervalMinutes = DEFAULT_INTERVAL_MINUTES) {
  const total = timeToMinutes(time)
  const rounded = Math.ceil(total / intervalMinutes) * intervalMinutes
  return `${String(Math.floor(rounded / 60)).padStart(2, "0")}:${String(rounded % 60).padStart(2, "0")}`
}

export function generateTimeSlotOptions(params: {
  open: string
  close: string
  intervalMinutes?: number
  slotDurationMinutes?: number
  minStartTime?: string
}) {
  const interval = params.intervalMinutes ?? DEFAULT_INTERVAL_MINUTES
  const duration = params.slotDurationMinutes ?? 0
  const openMinutes = timeToMinutes(params.open)
  const closeMinutes = timeToMinutes(params.close)
  const minStart = params.minStartTime
    ? timeToMinutes(params.minStartTime)
    : openMinutes
  const startMinutes = Math.max(openMinutes, minStart)
  const latestStart = closeMinutes - duration
  const slots: string[] = []

  for (let minute = startMinutes; minute <= latestStart; minute += interval) {
    if (minute >= openMinutes && minute + duration <= closeMinutes) {
      const hours = Math.floor(minute / 60)
      const mins = minute % 60
      slots.push(`${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`)
    }
  }

  return slots
}
