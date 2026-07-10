const WEEKDAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const

type DaySchedule = {
  enabled: boolean
  open: string
  close: string
}

type BusinessHoursSettings = {
  openingTime?: string
  closingTime?: string
  weeklySchedule?: Record<string, DaySchedule>
}

function parseSettings(settings: unknown): BusinessHoursSettings | null {
  if (!settings || typeof settings !== "object") return null
  const raw = settings as { businessHours?: BusinessHoursSettings }
  return raw.businessHours ?? null
}

function parseTimeToMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return null
  return hours * 60 + minutes
}

function formatDayLabel(day: string): string {
  return day.charAt(0).toUpperCase() + day.slice(1)
}

function formatTime12h(value: string): string {
  const minutes = parseTimeToMinutes(value)
  if (minutes == null) return value
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const period = h >= 12 ? "PM" : "AM"
  const hour12 = h % 12 || 12
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`
}

export function formatSalonHours(settings: unknown): string {
  const hours = parseSettings(settings)
  if (!hours?.weeklySchedule) return "Hours not listed"

  const enabledDays = WEEKDAYS.filter((day) => hours.weeklySchedule?.[day]?.enabled)
  if (enabledDays.length === 0) return "Closed"

  const first = hours.weeklySchedule[enabledDays[0]!]!
  const open = formatTime12h(first.open)
  const close = formatTime12h(first.close)

  if (enabledDays.length === 7) {
    return `Mon–Sun · ${open} – ${close}`
  }

  const labels = enabledDays.map(formatDayLabel)
  if (labels.length <= 3) {
    return `${labels.join(", ")} · ${open} – ${close}`
  }

  return `${labels[0]}–${labels[labels.length - 1]} · ${open} – ${close}`
}

export function isSalonOpenNow(settings: unknown, timezone = "Asia/Kolkata"): boolean {
  const hours = parseSettings(settings)
  if (!hours?.weeklySchedule) return true

  const now = new Date()
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
  const parts = formatter.formatToParts(now)
  const weekday = parts.find((p) => p.type === "weekday")?.value?.toLowerCase()
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0")
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0")
  const nowMinutes = hour * 60 + minute

  if (!weekday) return true
  const schedule = hours.weeklySchedule[weekday]
  if (!schedule?.enabled) return false

  const open = parseTimeToMinutes(schedule.open)
  const close = parseTimeToMinutes(schedule.close)
  if (open == null || close == null) return true

  if (close > open) {
    return nowMinutes >= open && nowMinutes < close
  }

  // Overnight hours (e.g. 10:00 – 02:00)
  return nowMinutes >= open || nowMinutes < close
}
