import { haversineKm } from "@/lib/geo"
import { getLocationById, type StoredLocation } from "@/lib/location"
import { DEFAULT_MAP_CENTER } from "@/lib/maps/config"
import {
  resolvePlaceCentroid,
  resolveSalonCoordinates,
  salonHasExactCoordinates,
} from "@/lib/salon-coordinates"
import type { Salon } from "@/types/salon"

export type DistanceOrigin = {
  latitude: number
  longitude: number
  /** True when distance is measured from the default Bengaluru center (no device GPS). */
  isDefaultCity: boolean
}

export { salonHasExactCoordinates as salonHasMapCoordinates }

export function getDefaultDistanceOrigin(): DistanceOrigin {
  return {
    latitude: DEFAULT_MAP_CENTER.latitude,
    longitude: DEFAULT_MAP_CENTER.longitude,
    isDefaultCity: true,
  }
}

export function resolveDistanceOriginFromStored(
  stored: StoredLocation | null | undefined,
): DistanceOrigin {
  if (
    typeof stored?.latitude === "number" &&
    typeof stored?.longitude === "number" &&
    Number.isFinite(stored.latitude) &&
    Number.isFinite(stored.longitude)
  ) {
    return {
      latitude: stored.latitude,
      longitude: stored.longitude,
      isDefaultCity: false,
    }
  }

  const selectedArea = stored?.id ? getLocationById(stored.id) : null
  const cityCentroid = resolvePlaceCentroid(
    stored?.city,
    stored?.displayLabel,
    stored?.areaLabelOverride,
    stored?.resolvedArea,
    selectedArea?.areaLabel,
    selectedArea?.label,
  )
  if (cityCentroid) {
    return {
      latitude: cityCentroid.lat,
      longitude: cityCentroid.lng,
      isDefaultCity: Boolean(stored?.defaultFallback),
    }
  }

  return getDefaultDistanceOrigin()
}

export function resolveDistanceOrigin(options: {
  nearFromUrl?: boolean
  urlLatitude?: number
  urlLongitude?: number
  stored?: StoredLocation | null
}): DistanceOrigin {
  const { nearFromUrl, urlLatitude, urlLongitude, stored } = options

  if (
    nearFromUrl &&
    urlLatitude != null &&
    urlLongitude != null &&
    Number.isFinite(urlLatitude) &&
    Number.isFinite(urlLongitude)
  ) {
    return {
      latitude: urlLatitude,
      longitude: urlLongitude,
      isDefaultCity: false,
    }
  }

  return resolveDistanceOriginFromStored(stored)
}

export function computeSalonDistanceKm(
  salon: Pick<Salon, "id" | "area" | "address" | "latitude" | "longitude">,
  origin: DistanceOrigin,
): number | null {
  const coords = resolveSalonCoordinates(salon)
  if (!coords) {
    return null
  }

  return haversineKm(origin.latitude, origin.longitude, coords.lat, coords.lng)
}

export function applySalonDistances(salons: Salon[], origin: DistanceOrigin): Salon[] {
  return salons.map((salon) => {
    const distanceKm = computeSalonDistanceKm(salon, origin)
    if (distanceKm == null) {
      return { ...salon, distanceKm: 0 }
    }

    return { ...salon, distanceKm }
  })
}
