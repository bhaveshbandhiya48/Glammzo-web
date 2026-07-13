import { sortSalonsByDistance } from "@/lib/geo"
import type { Salon } from "@/types/salon"

export const NEARBY_SALON_RADIUS_KM = 10

export type SalonWithDistance = Salon & { distanceKm: number }

export function pickNearbySalons(
  salons: Salon[],
  origin: { latitude: number; longitude: number },
  maxKm = NEARBY_SALON_RADIUS_KM,
  limit = 12,
): SalonWithDistance[] {
  return sortSalonsByDistance(salons, origin.latitude, origin.longitude)
    .filter((salon) => salon.distanceKm <= maxKm)
    .slice(0, limit)
}

function repeatForMarquee<T>(items: T[], minimum = 4): T[] {
  if (items.length === 0) {
    return []
  }

  let expanded = [...items]
  while (expanded.length < minimum) {
    expanded = [...expanded, ...items]
  }

  return expanded
}

/** Duplicate track content for seamless CSS marquee looping. */
export function buildSalonMarqueeTrack<T>(items: T[]): T[] {
  const expanded = repeatForMarquee(items)
  return [...expanded, ...expanded]
}
