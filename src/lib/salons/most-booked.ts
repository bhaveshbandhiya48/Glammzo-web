import { computeSalonDistanceKm, type DistanceOrigin } from "@/lib/explore-distance"
import type { Salon } from "@/types/salon"

/** Local radius for “Most booked” comparison. */
export const MOST_BOOKED_RADIUS_KM = 10

/** Need at least this many completed Glammzo bookings in-window before showing the badge. */
export const MOST_BOOKED_MIN_COUNT = 3

/**
 * Salon IDs with the highest completed booking count among peers within
 * {@link MOST_BOOKED_RADIUS_KM} of the browse origin. Ties all win.
 */
export function resolveMostBookedSalonIds(
  salons: Salon[],
  origin: DistanceOrigin,
  options?: {
    radiusKm?: number
    minCount?: number
  },
): Set<string> {
  const radiusKm = options?.radiusKm ?? MOST_BOOKED_RADIUS_KM
  const minCount = options?.minCount ?? MOST_BOOKED_MIN_COUNT
  const winners = new Set<string>()

  let maxCount = 0
  const nearby: Array<{ id: string; count: number }> = []

  for (const salon of salons) {
    const distanceKm = computeSalonDistanceKm(salon, origin)
    if (distanceKm == null || !Number.isFinite(distanceKm) || distanceKm > radiusKm) {
      continue
    }

    const count = salon.completedBookingCount ?? 0
    if (count <= 0) continue

    nearby.push({ id: salon.id, count })
    if (count > maxCount) maxCount = count
  }

  if (maxCount < minCount) return winners

  for (const entry of nearby) {
    if (entry.count === maxCount) {
      winners.add(entry.id)
    }
  }

  return winners
}

export function salonIsMostBooked(
  salonId: string,
  mostBookedIds: Set<string>,
) {
  return mostBookedIds.has(salonId)
}
