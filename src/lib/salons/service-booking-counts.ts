import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

/** salonId → serviceId → completed booking count */
export type ServiceBookingCountsBySalon = Map<string, Map<string, number>>

export async function fetchCompletedServiceBookingCounts(
  salonIds: string[],
): Promise<ServiceBookingCountsBySalon> {
  const result: ServiceBookingCountsBySalon = new Map()
  if (salonIds.length === 0) return result

  try {
    const supabase = createAdminClient()
    const { data: appointments, error } = await supabase
      .from("appointments")
      .select("id, salon_id, service_id")
      .in("salon_id", salonIds)
      .eq("status", "completed")
      .is("deleted_at", null)

    if (error) {
      console.error("[salons] Failed to fetch booking counts:", error.message)
      return result
    }

    const appointmentIds: string[] = []
    const appointmentSalon = new Map<string, string>()

    for (const row of appointments ?? []) {
      appointmentIds.push(row.id)
      appointmentSalon.set(row.id, row.salon_id)

      if (row.service_id) {
        const salonMap = result.get(row.salon_id) ?? new Map<string, number>()
        salonMap.set(row.service_id, (salonMap.get(row.service_id) ?? 0) + 1)
        result.set(row.salon_id, salonMap)
      }
    }

    if (appointmentIds.length === 0) return result

    const { data: lines, error: linesError } = await supabase
      .from("appointment_services")
      .select("appointment_id, service_id")
      .in("appointment_id", appointmentIds)

    if (linesError) {
      console.error("[salons] Failed to fetch appointment_services counts:", linesError.message)
      return result
    }

    for (const line of lines ?? []) {
      const salonId = appointmentSalon.get(line.appointment_id)
      if (!salonId) continue
      const salonMap = result.get(salonId) ?? new Map<string, number>()
      salonMap.set(line.service_id, (salonMap.get(line.service_id) ?? 0) + 1)
      result.set(salonId, salonMap)
    }
  } catch (err) {
    console.error("[salons] Booking count fetch error:", err)
  }

  return result
}
