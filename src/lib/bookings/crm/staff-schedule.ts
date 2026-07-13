import type { DaySchedule, Weekday } from "@/lib/bookings/crm/types"
import { timeToMinutes } from "@/lib/bookings/crm/time"

export type StaffWeeklySchedule = Partial<Record<Weekday, DaySchedule>>

export function buildStaffSchedulesFromRows(
  rows: Array<{
    staff_id: string
    weekday: string
    enabled: boolean
    start_time: string
    end_time: string
  }>,
): Record<string, StaffWeeklySchedule> {
  const schedules: Record<string, StaffWeeklySchedule> = {}

  for (const row of rows) {
    const weekday = row.weekday as Weekday
    const staffSchedule = schedules[row.staff_id] ?? {}
    staffSchedule[weekday] = {
      enabled: row.enabled,
      open: row.start_time.slice(0, 5),
      close: row.end_time.slice(0, 5),
    }
    schedules[row.staff_id] = staffSchedule
  }

  return schedules
}

export function resolveStaffDaySchedule(
  staffSchedules: Record<string, StaffWeeklySchedule>,
  salonBusinessHours: { weeklySchedule: Record<Weekday, DaySchedule> },
  staffId: string,
  weekday: Weekday,
): DaySchedule | null {
  const custom = staffSchedules[staffId]?.[weekday]
  if (custom) {
    return custom
  }

  return salonBusinessHours.weeklySchedule[weekday] ?? null
}

export function isStaffWorkingDuringSlot(
  schedule: DaySchedule | null,
  startTime: string,
  endTime: string,
) {
  if (!schedule?.enabled) {
    return false
  }

  const slotStart = timeToMinutes(startTime)
  const slotEnd = timeToMinutes(endTime)
  const open = timeToMinutes(schedule.open)
  const close = timeToMinutes(schedule.close)

  return slotStart >= open && slotEnd <= close
}