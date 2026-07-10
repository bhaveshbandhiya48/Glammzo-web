import type { BookedAppointment, SalonBookingContext, Weekday } from "@/lib/bookings/crm/types"
import {
  isStaffWorkingDuringSlot,
  resolveStaffDaySchedule,
} from "@/lib/bookings/crm/staff-schedule"
import { shiftIsoDate } from "@/lib/date-utils"
import {
  formatTimeLabel,
  generateTimeSlotOptions,
  getSalonDateKey,
  getSalonTimeKey,
  getWeekdayFromDateKey,
  rangesOverlap,
  roundUpToInterval,
} from "@/lib/bookings/crm/time"

const BLOCKING_STATUSES = new Set(["scheduled", "confirmed", "in_progress"])

export function isStaffEligibleForServices(
  context: SalonBookingContext,
  staffId: string,
  serviceIds: string[],
) {
  if (!context.staffIds.includes(staffId)) return false

  const assigned = new Set(context.staffServiceMap[staffId] ?? [])
  if (assigned.size === 0) return true

  return serviceIds.every((serviceId) => assigned.has(serviceId))
}

export function isStaffAvailableForSlot(
  context: SalonBookingContext,
  booked: BookedAppointment[],
  input: {
    staffId: string
    appointmentDate: string
    startTime: string
    endTime: string
  },
) {
  const weekday = getWeekdayFromDateKey(input.appointmentDate) as Weekday
  const schedule = resolveStaffDaySchedule(
    context.staffSchedules,
    context.businessHours,
    input.staffId,
    weekday,
  )

  if (!isStaffWorkingDuringSlot(schedule, input.startTime, input.endTime)) {
    return false
  }

  return !booked.some((appointment) => {
    if (appointment.staffId !== input.staffId) return false
    if (appointment.date !== input.appointmentDate) return false

    return rangesOverlap(
      input.startTime,
      input.endTime,
      appointment.startTime,
      appointment.endTime,
    )
  })
}

export function pickStaffForSlot(
  context: SalonBookingContext,
  serviceIds: string[],
  appointmentDate: string,
  startTime: string,
  endTime: string,
  preferredStaffId?: string | null,
) {
  if (preferredStaffId) {
    if (!isStaffEligibleForServices(context, preferredStaffId, serviceIds)) {
      return null
    }

    return isStaffAvailableForSlot(context, context.booked, {
      staffId: preferredStaffId,
      appointmentDate,
      startTime,
      endTime,
    })
      ? preferredStaffId
      : null
  }

  const candidates = rankStaffForServices(context, serviceIds)

  for (const staffId of candidates) {
    if (
      isStaffAvailableForSlot(context, context.booked, {
        staffId,
        appointmentDate,
        startTime,
        endTime,
      })
    ) {
      return staffId
    }
  }

  return null
}

function rankStaffForServices(context: SalonBookingContext, serviceIds: string[]) {
  const { staffIds, staffServiceMap } = context

  const coversAll = staffIds.filter((staffId) => {
    const assigned = new Set(staffServiceMap[staffId] ?? [])
    return serviceIds.every((serviceId) => assigned.has(serviceId))
  })

  const coversAny = staffIds.filter((staffId) => {
    const assigned = new Set(staffServiceMap[staffId] ?? [])
    return serviceIds.some((serviceId) => assigned.has(serviceId))
  })

  const unassigned = staffIds.filter((staffId) => !(staffServiceMap[staffId]?.length ?? 0))

  const ordered = [...coversAll, ...coversAny, ...unassigned]
  const unique = [...new Set(ordered)]

  return unique.sort((left, right) => {
    const leftLoad = context.booked.filter((booking) => booking.staffId === left).length
    const rightLoad = context.booked.filter((booking) => booking.staffId === right).length
    return leftLoad - rightLoad
  })
}

export function getAvailableSlotsForDate(
  context: SalonBookingContext,
  appointmentDate: string,
  durationMinutes: number,
  serviceIds: string[],
  preferredStaffId?: string | null,
) {
  const weekday = getWeekdayFromDateKey(appointmentDate) as keyof typeof context.businessHours.weeklySchedule
  const schedule = context.businessHours.weeklySchedule[weekday]

  if (!schedule?.enabled) {
    return {
      slots: [] as string[],
      closed: true,
      closedMessage: "The salon is closed on this day.",
    }
  }

  if (preferredStaffId && !isStaffEligibleForServices(context, preferredStaffId, serviceIds)) {
    return {
      slots: [] as string[],
      closed: true,
      closedMessage: "This team member cannot perform all selected services.",
    }
  }

  const today = getSalonDateKey(new Date(), context.timezone)
  const nowTime = getSalonTimeKey(new Date(), context.timezone)
  const minStartTime =
    appointmentDate === today
      ? roundUpToInterval(nowTime > schedule.open ? nowTime : schedule.open)
      : undefined

  const rawSlots = generateTimeSlotOptions({
    open: schedule.open,
    close: schedule.close,
    slotDurationMinutes: durationMinutes,
    minStartTime,
  })

  if (context.staffIds.length === 0) {
    return {
      slots: [],
      closed: true,
      closedMessage: "This salon is not accepting online bookings yet.",
    }
  }

  const available = rawSlots.filter((slot) => {
    const startTime = `${slot}:00`
    const endMinutes = durationMinutes
    const endTime = addMinutesToEnd(slot, endMinutes)

    return Boolean(
      pickStaffForSlot(
        context,
        serviceIds,
        appointmentDate,
        startTime,
        endTime,
        preferredStaffId,
      ),
    )
  })

  if (available.length === 0) {
    return {
      slots: [],
      closed: true,
      closedMessage: minStartTime
        ? "No available time slots remain for this day."
        : preferredStaffId
          ? "No open slots for this team member on this day."
          : "No time slots fit within business hours for this visit.",
    }
  }

  return { slots: available, closed: false }
}

export function findFirstAvailableDate(
  context: SalonBookingContext,
  serviceIds: string[],
  durationMinutes: number,
  preferredStaffId?: string | null,
  maxDays = 60,
) {
  const today = getSalonDateKey(new Date(), context.timezone)

  for (let offset = 0; offset < maxDays; offset++) {
    const appointmentDate = shiftIsoDate(today, offset)
    const result = getAvailableSlotsForDate(
      context,
      appointmentDate,
      durationMinutes,
      serviceIds,
      preferredStaffId,
    )

    if (!result.closed && result.slots.length > 0) {
      return appointmentDate
    }
  }

  return null
}

function addMinutesToEnd(slot: string, durationMinutes: number) {
  const [hours, mins] = slot.split(":").map(Number)
  const total = hours * 60 + mins + durationMinutes
  const endHours = Math.floor(total / 60)
  const endMins = total % 60
  return `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}:00`
}

export function formatSlotLabel(slot: string) {
  return formatTimeLabel(`${slot}:00`)
}

export { BLOCKING_STATUSES }
