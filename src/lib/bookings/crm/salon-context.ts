import "server-only"

import { cache } from "react"

import { parseBusinessHours } from "@/lib/bookings/crm/business-hours"
import { BLOCKING_STATUSES } from "@/lib/bookings/crm/availability"
import { BOOKING_ENGINE_CONFIG } from "@/lib/bookings/crm/booking-confirmation-engine"
import type { BusinessClosure } from "@/lib/bookings/crm/booking-confirmation-engine"
import { buildStaffSchedulesFromRows } from "@/lib/bookings/crm/staff-schedule"
import type { BookableStaffMember, BookedAppointment, SalonBookingContext } from "@/lib/bookings/crm/types"
import { parseWebBookingSettings } from "@/lib/bookings/crm/web-booking-sla"
import { getSalonDateKey } from "@/lib/bookings/crm/time"
import { shiftIsoDate } from "@/lib/date-utils"
import { createAdminClient } from "@/lib/supabase/admin"

export async function loadSalonBookingContext(
  crmSalonId: string,
  options?: { excludeAppointmentId?: string },
): Promise<SalonBookingContext | null> {
    const supabase = createAdminClient()

    const { data: salonData, error: salonError } = await supabase
      .from("salons")
      .select("id, name, timezone, settings, listing_status, is_active, status")
      .eq("id", crmSalonId)
      .eq("is_active", true)
      .eq("status", "active")
      .eq("listing_status", "published")
      .is("deleted_at", null)
      .maybeSingle()

    if (salonError || !salonData) {
      return null
    }

    const timezone = (salonData as { timezone?: string }).timezone ?? "Asia/Kolkata"
    const salonName = (salonData as { name?: string }).name?.trim() || "Salon"
    const businessHours = parseBusinessHours(
      (salonData as { settings?: unknown }).settings,
    )

    const today = getSalonDateKey(new Date(), timezone)
    const horizon = shiftIsoDate(today, BOOKING_ENGINE_CONFIG.maxAdvanceBookingDays)

    const [
      { data: staffRows },
      { data: assignmentRows },
      { data: categoryAssignmentRows, error: categoryAssignmentError },
      { data: serviceRows, error: serviceRowsError },
      { data: scheduleRows },
      { data: closureRows },
    ] = await Promise.all([
      supabase
        .from("staff")
        .select("id, full_name, designation, avatar_url")
        .eq("salon_id", crmSalonId)
        .eq("is_active", true)
        .eq("is_bookable", true)
        .is("deleted_at", null),
      supabase
        .from("staff_services")
        .select("staff_id, service_id")
        .eq("salon_id", crmSalonId),
      supabase
        .from("staff_service_categories")
        .select("staff_id, category_id")
        .eq("salon_id", crmSalonId),
      supabase
        .from("services")
        .select("id, category_id")
        .eq("salon_id", crmSalonId)
        .is("deleted_at", null),
      supabase
        .from("staff_schedules")
        .select("staff_id, weekday, enabled, start_time, end_time")
        .eq("salon_id", crmSalonId),
      supabase
        .from("salon_business_closures")
        .select("id, closure_type, start_date, end_date, start_time, end_time")
        .eq("salon_id", crmSalonId)
        .lte("start_date", horizon)
        .or(`end_date.gte.${today},end_date.is.null`)
        .is("deleted_at", null),
    ])

    const categoryTableMissing =
      categoryAssignmentError?.message
        .toLowerCase()
        .includes("staff_service_categories") ?? false

    if (serviceRowsError || (categoryAssignmentError && !categoryTableMissing)) {
      return null
    }

    const staffMembers: BookableStaffMember[] = (staffRows ?? []).map((row) => {
      const staff = row as {
        id: string
        full_name: string
        designation: string | null
        avatar_url: string | null
      }

      return {
        id: staff.id,
        name: staff.full_name,
        role: staff.designation?.trim() || "Specialist",
        imageUrl: staff.avatar_url,
      }
    })

    const staffIds = staffMembers.map((member) => member.id)
    const staffServiceMap: Record<string, string[]> = {}
    const staffCategoryMap: Record<string, string[]> = {}
    const serviceCategoryMap: Record<string, string> = {}

    for (const row of assignmentRows ?? []) {
      const assignment = row as { staff_id: string; service_id: string }
      const list = staffServiceMap[assignment.staff_id] ?? []
      list.push(assignment.service_id)
      staffServiceMap[assignment.staff_id] = list
    }

    for (const row of serviceRows ?? []) {
      const service = row as { id: string; category_id: string | null }
      if (service.category_id) {
        serviceCategoryMap[service.id] = service.category_id
      }
    }

    if (!categoryAssignmentError) {
      for (const row of categoryAssignmentRows ?? []) {
        const assignment = row as { staff_id: string; category_id: string }
        const list = staffCategoryMap[assignment.staff_id] ?? []
        list.push(assignment.category_id)
        staffCategoryMap[assignment.staff_id] = list
      }
    } else {
      // Compatibility before migration 072: derive categories from service skills.
      for (const [staffId, serviceIds] of Object.entries(staffServiceMap)) {
        staffCategoryMap[staffId] = [
          ...new Set(
            serviceIds.flatMap((serviceId) => {
              const categoryId = serviceCategoryMap[serviceId]
              return categoryId ? [categoryId] : []
            }),
          ),
        ]
      }
    }

    const staffSchedules = buildStaffSchedulesFromRows(
      (scheduleRows ?? []) as Array<{
        staff_id: string
        weekday: string
        enabled: boolean
        start_time: string
        end_time: string
      }>,
    )

    const { data: appointmentRows } = await supabase
      .from("appointments")
      .select("id, staff_id, appointment_date, start_time, end_time, status, slot_reserved")
      .eq("salon_id", crmSalonId)
      .gte("appointment_date", today)
      .lte("appointment_date", horizon)
      .is("deleted_at", null)

    const booked: BookedAppointment[] = (appointmentRows ?? [])
      .filter((row) => {
        const appointment = row as { id: string; status: string; slot_reserved?: boolean }
        if (options?.excludeAppointmentId && appointment.id === options.excludeAppointmentId) {
          return false
        }
        if (!BLOCKING_STATUSES.has(appointment.status)) {
          return false
        }
        if (appointment.status === "pending" && appointment.slot_reserved === false) {
          return false
        }
        return true
      })
      .map((row) => {
        const appointment = row as {
          staff_id: string | null
          appointment_date: string
          start_time: string
          end_time: string
        }

        return {
          // Keep unassigned bookings too — they still occupy calendar time.
          staffId: appointment.staff_id ?? "",
          date: appointment.appointment_date,
          startTime: appointment.start_time,
          endTime: appointment.end_time,
        }
      })

    const businessClosures: BusinessClosure[] = (closureRows ?? []).map((row) => {
      const closure = row as {
        id: string
        closure_type: "full_day" | "partial_day"
        start_date: string
        end_date: string | null
        start_time: string | null
        end_time: string | null
      }

      return {
        id: closure.id,
        closureType: closure.closure_type,
        startDate: closure.start_date,
        endDate: closure.end_date,
        startTime: closure.start_time,
        endTime: closure.end_time,
      }
    })

    return {
      crmSalonId,
      salonName,
      timezone,
      businessHours,
      businessClosures,
      staffIds,
      staffMembers,
      staffServiceMap,
      staffCategoryMap,
      serviceCategoryMap,
      categoryAssignmentsEnabled: !categoryTableMissing,
      staffSchedules,
      webBooking: parseWebBookingSettings((salonData as { settings?: unknown }).settings),
      booked,
    }
}

export const fetchSalonBookingContext = cache(async (crmSalonId: string) =>
  loadSalonBookingContext(crmSalonId),
)

export async function fetchSalonBookingContextForReschedule(
  crmSalonId: string,
  excludeAppointmentId: string,
) {
  return loadSalonBookingContext(crmSalonId, { excludeAppointmentId })
}
