import type { BookedAppointment, SalonBookingContext, Weekday } from "@/lib/bookings/crm/types"
import {
  BOOKING_ENGINE_CONFIG,
  getTomorrowAcceptanceMinStartTime,
  isDateFullyClosedByClosure,
  isSlotBlockedByPartialClosure,
} from "@/lib/bookings/crm/booking-confirmation-engine"
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
  timeToMinutes,
} from "@/lib/bookings/crm/time"

const BLOCKING_STATUSES = new Set(["scheduled", "pending", "confirmed", "in_progress"])

export type TimeSlotStatus = "available" | "booked" | "past" | "unavailable"

export type TimeSlotForDate = {
  slot: string
  status: TimeSlotStatus
}

export type TimeSlotOptionsResult = {
  slots: TimeSlotForDate[]
  closed: boolean
  closedMessage?: string
}

export type BookingAvailabilityOptions = {
  /** Package bookings auto-assign staff, use all bookable staff for slot checks. */
  packageBooking?: boolean
}

export function uniqueServiceIds(serviceIds: string[]) {
  return [...new Set(serviceIds)]
}

export function isStaffEligibleForServices(
  context: SalonBookingContext,
  staffId: string,
  serviceIds: string[],
) {
  if (!context.staffIds.includes(staffId)) return false

  const required = uniqueServiceIds(serviceIds)
  const assigned = new Set(context.staffServiceMap[staffId] ?? [])
  if (assigned.size === 0) return true

  return required.every((serviceId) => assigned.has(serviceId))
}

function getEligibleStaffIds(context: SalonBookingContext, serviceIds: string[]) {
  return context.staffIds.filter((staffId) =>
    isStaffEligibleForServices(context, staffId, serviceIds),
  )
}

export function hasEligibleStaffForServices(
  context: SalonBookingContext,
  serviceIds: string[],
) {
  return getEligibleStaffIds(context, serviceIds).length > 0
}

export function slotStatusHint(status: TimeSlotStatus): string | undefined {
  switch (status) {
    case "booked":
      return "Already booked"
    case "past":
      return "Past"
    case "unavailable":
      return "Unavailable"
    default:
      return undefined
  }
}

function isStaffWorkingSlot(
  context: SalonBookingContext,
  staffId: string,
  appointmentDate: string,
  startTime: string,
  endTime: string,
) {
  const weekday = getWeekdayFromDateKey(appointmentDate) as Weekday
  const schedule = resolveStaffDaySchedule(
    context.staffSchedules,
    context.businessHours,
    staffId,
    weekday,
  )

  return isStaffWorkingDuringSlot(schedule, startTime, endTime)
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
  options?: BookingAvailabilityOptions,
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

  const candidates = options?.packageBooking
    ? rankStaffByLoad(context, context.staffIds)
    : rankStaffForServices(context, serviceIds)

  for (const staffId of candidates) {
    if (
      !options?.packageBooking &&
      !isStaffEligibleForServices(context, staffId, serviceIds)
    ) {
      continue
    }

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

function rankStaffByLoad(context: SalonBookingContext, staffIds: string[]) {
  return [...staffIds].sort((left, right) => {
    const leftLoad = context.booked.filter((booking) => booking.staffId === left).length
    const rightLoad = context.booked.filter((booking) => booking.staffId === right).length
    return leftLoad - rightLoad
  })
}

function resolveStaffPoolForSlots(
  context: SalonBookingContext,
  serviceIds: string[],
  preferredStaffId?: string | null,
  options?: BookingAvailabilityOptions,
) {
  if (preferredStaffId) {
    return isStaffEligibleForServices(context, preferredStaffId, serviceIds)
      ? [preferredStaffId]
      : []
  }

  if (options?.packageBooking) {
    return context.staffIds
  }

  const eligible = getEligibleStaffIds(context, serviceIds)
  return eligible.length > 0 ? eligible : context.staffIds
}

function resolveSlotStatus(
  context: SalonBookingContext,
  staffPool: string[],
  appointmentDate: string,
  startTime: string,
  endTime: string,
): TimeSlotStatus {
  if (staffPool.length === 0) {
    return "unavailable"
  }

  const availableStaff = staffPool.filter((staffId) =>
    isStaffAvailableForSlot(context, context.booked, {
      staffId,
      appointmentDate,
      startTime,
      endTime,
    }),
  )

  if (availableStaff.length > 0) {
    return "available"
  }

  const workingStaff = staffPool.filter((staffId) =>
    isStaffWorkingSlot(context, staffId, appointmentDate, startTime, endTime),
  )

  if (workingStaff.length > 0) {
    return "booked"
  }

  return "unavailable"
}

function rankStaffForServices(context: SalonBookingContext, serviceIds: string[]) {
  const { staffIds, staffServiceMap } = context
  const required = uniqueServiceIds(serviceIds)

  const coversAll = staffIds.filter((staffId) => {
    const assigned = new Set(staffServiceMap[staffId] ?? [])
    return required.every((serviceId) => assigned.has(serviceId))
  })

  const coversAny = staffIds.filter((staffId) => {
    const assigned = new Set(staffServiceMap[staffId] ?? [])
    return required.some((serviceId) => assigned.has(serviceId))
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

export function getTimeSlotOptionsForDate(
  context: SalonBookingContext,
  appointmentDate: string,
  durationMinutes: number,
  serviceIds: string[],
  preferredStaffId?: string | null,
  options?: BookingAvailabilityOptions,
): TimeSlotOptionsResult {
  const weekday = getWeekdayFromDateKey(appointmentDate) as keyof typeof context.businessHours.weeklySchedule
  const schedule = context.businessHours.weeklySchedule[weekday]

  if (!schedule?.enabled) {
    return {
      slots: [],
      closed: true,
      closedMessage: "The salon is closed on this day.",
    }
  }

  if (isDateFullyClosedByClosure(appointmentDate, context.businessClosures)) {
    return {
      slots: [],
      closed: true,
      closedMessage: "The salon is closed on this date.",
    }
  }

  if (preferredStaffId && !isStaffEligibleForServices(context, preferredStaffId, serviceIds)) {
    return {
      slots: [],
      closed: true,
      closedMessage: "This team member cannot perform all selected services.",
    }
  }

  if (context.staffIds.length === 0) {
    return {
      slots: [],
      closed: true,
      closedMessage: "This salon is not accepting online bookings yet.",
    }
  }

  const today = getSalonDateKey(new Date(), context.timezone)
  const nowTime = getSalonTimeKey(new Date(), context.timezone)
  const now = new Date()

  let minStartTime =
    appointmentDate === today
      ? roundUpToInterval(nowTime > schedule.open ? nowTime : schedule.open)
      : undefined

  const tomorrowMinStart = getTomorrowAcceptanceMinStartTime(
    context.businessHours,
    context.timezone,
    appointmentDate,
    now,
  )

  if (tomorrowMinStart) {
    minStartTime = minStartTime
      ? roundUpToInterval(
          timeToMinutes(minStartTime) > timeToMinutes(tomorrowMinStart)
            ? minStartTime
            : tomorrowMinStart,
        )
      : roundUpToInterval(tomorrowMinStart)
  }

  const rawSlots = generateTimeSlotOptions({
    open: schedule.open,
    close: schedule.close,
    slotDurationMinutes: durationMinutes,
    minStartTime,
  })

  if (rawSlots.length === 0) {
    return {
      slots: [],
      closed: true,
      closedMessage:
        appointmentDate === today
          ? "Not enough time remains today for this visit. Try another date."
          : "No time slots fit within business hours for this visit.",
    }
  }

  const staffPool = resolveStaffPoolForSlots(
    context,
    serviceIds,
    preferredStaffId,
    options,
  )

  const slots = rawSlots.map((slot) => {
    if (minStartTime && timeToMinutes(`${slot}:00`) < timeToMinutes(minStartTime)) {
      return { slot, status: "past" as const }
    }

    const startTime = `${slot}:00`
    const endTime = addMinutesToEnd(slot, durationMinutes)

    if (
      isSlotBlockedByPartialClosure(
        appointmentDate,
        startTime,
        endTime,
        context.businessClosures,
      )
    ) {
      return { slot, status: "unavailable" as const }
    }

    return {
      slot,
      status: resolveSlotStatus(context, staffPool, appointmentDate, startTime, endTime),
    }
  })

  return { slots, closed: false }
}

export function getAvailableSlotsForDate(
  context: SalonBookingContext,
  appointmentDate: string,
  durationMinutes: number,
  serviceIds: string[],
  preferredStaffId?: string | null,
  options?: BookingAvailabilityOptions,
) {
  const result = getTimeSlotOptionsForDate(
    context,
    appointmentDate,
    durationMinutes,
    serviceIds,
    preferredStaffId,
    options,
  )

  if (result.closed) {
    return {
      slots: [] as string[],
      closed: true,
      closedMessage: result.closedMessage,
    }
  }

  const available = result.slots
    .filter((entry) => entry.status === "available")
    .map((entry) => entry.slot)

  if (available.length === 0) {
    return {
      slots: [] as string[],
      closed: true,
      closedMessage: "All time slots are booked for this day.",
    }
  }

  return { slots: available, closed: false }
}

export function findFirstAvailableDate(
  context: SalonBookingContext,
  serviceIds: string[],
  durationMinutes: number,
  preferredStaffId?: string | null,
  maxDays = BOOKING_ENGINE_CONFIG.maxAdvanceBookingDays,
  options?: BookingAvailabilityOptions,
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
      options,
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
