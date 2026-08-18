import { sortSalonsByDistance } from "@/lib/geo"
import { isSalonInCity } from "@/lib/salons/city-filter"
import type { Salon } from "@/types/salon"

export type SalonWithDistance = Salon & { distanceKm: number }

const DEFAULT_HERO_SLIDES = 6

/**
 * Hero slides: featured salons in the browse area (nearest first).
 * If none are featured, fall back to nearest nearby salons.
 */
export function pickHeroSalonSlides(input: {
  salons: Salon[]
  latitude: number
  longitude: number
  browseCity: string
  maxSlides?: number
}): { slides: SalonWithDistance[]; usedNearbyFallback: boolean } {
  const maxSlides = input.maxSlides ?? DEFAULT_HERO_SLIDES
  if (input.salons.length === 0) {
    return { slides: [], usedNearbyFallback: true }
  }

  const ranked = sortSalonsByDistance(
    input.salons,
    input.latitude,
    input.longitude,
  )
  const local = ranked.filter((salon) => isSalonInCity(salon, input.browseCity))
  const others = ranked.filter((salon) => !isSalonInCity(salon, input.browseCity))
  const pool = local.length > 0 ? [...local, ...others] : ranked

  const featured = pool.filter((salon) => salon.isFeatured)
  const usedNearbyFallback = featured.length === 0
  const slides = (usedNearbyFallback ? pool : featured).slice(0, maxSlides)

  return { slides, usedNearbyFallback }
}
