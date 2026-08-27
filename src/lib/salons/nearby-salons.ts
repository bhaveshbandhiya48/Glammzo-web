import { sortSalonsByDistance } from "@/lib/geo"
import type { Salon } from "@/types/salon"

/** Preferred nearby radius for labels / badges — not a hard list cutoff. */
export const NEARBY_SALON_RADIUS_KM = 10

export type SalonWithDistance = Salon & { distanceKm: number }

/**
 * Closest salons first. Prefers those within `maxKm`, then fills with farther
 * ones so the homepage still has listings when nothing is inside the radius.
 */
export function pickNearbySalons(
  salons: Salon[],
  origin: { latitude: number; longitude: number },
  maxKm = NEARBY_SALON_RADIUS_KM,
  limit = 12,
): SalonWithDistance[] {
  const ranked = sortSalonsByDistance(salons, origin.latitude, origin.longitude)
  if (ranked.length === 0) return []

  const within = ranked.filter((salon) => salon.distanceKm <= maxKm)
  if (within.length >= limit) {
    return within.slice(0, limit)
  }

  const withinIds = new Set(within.map((salon) => salon.id))
  const farther = ranked.filter((salon) => !withinIds.has(salon.id))
  return [...within, ...farther].slice(0, limit)
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
