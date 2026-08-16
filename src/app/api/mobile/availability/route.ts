import {
  jsonError,
  jsonOk,
  MobileAuthError,
  requireBearerSession,
} from "@/lib/auth/mobile-bearer"
import {
  findFirstAvailableDate,
  formatSlotLabel,
  getAvailableSlotsForDate,
  isStaffEligibleForServices,
} from "@/lib/bookings/crm/availability"
import { BOOKING_ENGINE_CONFIG } from "@/lib/bookings/crm/booking-confirmation-engine"
import { loadSalonBookingContext } from "@/lib/bookings/crm/salon-context"
import { shiftIsoDate } from "@/lib/date-utils"
import { getSalonDateKey } from "@/lib/bookings/crm/time"
import { getSalonById } from "@/lib/salons"
import {
  parseServiceIds,
  resolveServices,
  sumServiceDuration,
} from "@/lib/bookings/utils"

export async function GET(request: Request) {
  try {
    await requireBearerSession(request)

    const url = new URL(request.url)
    const salonId = url.searchParams.get("salonId")?.trim() || ""
    const dateParam = url.searchParams.get("date")?.trim() || ""
    const staffId = url.searchParams.get("staffId")?.trim() || ""
    const packageId = url.searchParams.get("packageId")?.trim() || ""
    const serviceIds = parseServiceIds(url.searchParams.get("serviceIds") ?? "")

    if (!salonId) {
      return jsonError(400, "salonId is required.")
    }

    const salon = await getSalonById(salonId)
    if (!salon?.crmSalonId) {
      return jsonError(404, "Salon not found.")
    }

    const selectedPackage = packageId
      ? salon.packages.find((pkg) => pkg.id === packageId) ?? null
      : null
    const packageServiceIds = selectedPackage
      ? selectedPackage.items.map((item) => item.serviceId).filter(Boolean)
      : []
    const services = selectedPackage
      ? resolveServices(salon.services, packageServiceIds)
      : resolveServices(salon.services, serviceIds)

    const resolvedServiceIds = selectedPackage ? packageServiceIds : serviceIds

    if (resolvedServiceIds.length === 0 || services.length === 0) {
      return jsonError(400, "Select at least one service or package.")
    }

    const context = await loadSalonBookingContext(salon.crmSalonId)
    if (!context) {
      return jsonError(503, "Availability is not ready for this salon.")
    }

    const durationMinutes = selectedPackage
      ? selectedPackage.totalDurationMin || sumServiceDuration(services)
      : sumServiceDuration(services)

    const packageBooking = Boolean(selectedPackage)
    const preferredStaffId = packageBooking ? null : staffId || null

    const today = getSalonDateKey(new Date(), context.timezone)
    const days: { date: string; availableCount: number; closed: boolean }[] = []
    const maxDays = BOOKING_ENGINE_CONFIG.maxAdvanceBookingDays

    for (let offset = 0; offset < maxDays; offset++) {
      const date = shiftIsoDate(today, offset)
      const dayResult = getAvailableSlotsForDate(
        context,
        date,
        durationMinutes || 30,
        resolvedServiceIds,
        preferredStaffId,
        { packageBooking },
      )
      days.push({
        date,
        availableCount: dayResult.slots.length,
        closed: Boolean(dayResult.closed),
      })
    }

    let date = dateParam
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      date =
        findFirstAvailableDate(
          context,
          resolvedServiceIds,
          durationMinutes || 30,
          preferredStaffId,
          maxDays,
          { packageBooking },
        ) ?? days.find((d) => d.availableCount > 0)?.date ?? shiftIsoDate(today, 1)
    }

    const slotResult = getAvailableSlotsForDate(
      context,
      date,
      durationMinutes || 30,
      resolvedServiceIds,
      preferredStaffId,
      { packageBooking },
    )

    const staff = packageBooking
      ? []
      : context.staffMembers
          .filter((member) =>
            isStaffEligibleForServices(context, member.id, resolvedServiceIds),
          )
          .map((member) => ({
            id: member.id,
            name: member.name,
            role: member.role,
            imageUrl: member.imageUrl,
          }))

    return jsonOk({
      date,
      closed: Boolean(slotResult.closed),
      closedMessage: slotResult.closedMessage ?? null,
      days,
      slots: slotResult.slots.map((value) => ({
        value,
        label: formatSlotLabel(value),
      })),
      staff,
    })
  } catch (error) {
    if (error instanceof MobileAuthError) {
      return jsonError(error.status, error.message)
    }
    console.error("[mobile/availability]", error)
    return jsonError(500, "Could not load availability.")
  }
}
