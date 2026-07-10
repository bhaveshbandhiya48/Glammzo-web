/** Local calendar date as YYYY-MM-DD (no timezone shift). */
export function toIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function parseIsoDate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return null
  const y = Number(match[1])
  const m = Number(match[2]) - 1
  const day = Number(match[3])
  const d = new Date(y, m, day)
  if (d.getFullYear() !== y || d.getMonth() !== m || d.getDate() !== day) return null
  return d
}

export function formatDisplayDate(iso: string): string {
  const d = parseIsoDate(iso)
  if (!d) return ""
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = String(d.getFullYear())
  return `${day}/${month}/${year}`
}

export const DATE_INPUT_PLACEHOLDER = "dd/mm/yyyy"

export function shiftIsoDate(iso: string, days: number): string {
  const parsed = parseIsoDate(iso)
  if (!parsed) return iso
  parsed.setDate(parsed.getDate() + days)
  return toIsoDate(parsed)
}

export function isBeforeIso(a: string, b: string): boolean {
  return a < b
}

export function isSameIso(a: string, b: string): boolean {
  return a === b
}

export type CalendarCell = {
  date: Date
  iso: string
  inMonth: boolean
}

/** Six-week grid starting Sunday. */
export function buildCalendarMonth(year: number, month: number): CalendarCell[] {
  const first = new Date(year, month, 1)
  const start = new Date(year, month, 1 - first.getDay())
  const cells: CalendarCell[] = []

  for (let i = 0; i < 42; i++) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    cells.push({
      date,
      iso: toIsoDate(date),
      inMonth: date.getMonth() === month,
    })
  }

  return cells
}

export const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const

export function monthYearLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  })
}
