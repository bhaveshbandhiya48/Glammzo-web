import type { GlamzzoLocationId } from "@/lib/location"
import { DEFAULT_MAP_CENTER } from "@/lib/maps/config"
import { resolvePlaceCentroid, resolveSalonCoordinates } from "@/lib/salon-coordinates"
import type { Salon } from "@/types/salon"

/** Approximate centroids for Bengaluru areas (Near me neighbourhood matching). */
const AREA_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Indiranagar: { lat: 12.9784, lng: 77.6408 },
  Koramangala: { lat: 12.9352, lng: 77.6245 },
  "HSR Layout": { lat: 12.9116, lng: 77.6476 },
  "MG Road": { lat: 12.975, lng: 77.6063 },
  Marathahalli: { lat: 12.9591, lng: 77.6974 },
  Whitefield: { lat: 12.9698, lng: 77.75 },
  Jayanagar: { lat: 12.9308, lng: 77.5838 },
  "JP Nagar": { lat: 12.9077, lng: 77.5857 },
  "BTM Layout": { lat: 12.9166, lng: 77.6101 },
  Malleshwaram: { lat: 13.0035, lng: 77.5645 },
  Yelahanka: { lat: 13.1007, lng: 77.5963 },
  "Electronic City": { lat: 12.8399, lng: 77.677 },
  "Hebbal": { lat: 13.0358, lng: 77.597 },
  "Banashankari": { lat: 12.9255, lng: 77.5468 },
  "Rajajinagar": { lat: 12.9911, lng: 77.5536 },
  "Bellandur": { lat: 12.9304, lng: 77.6784 },
  "Sarjapur Road": { lat: 12.9121, lng: 77.6832 },
  "Kalyan Nagar": { lat: 13.0223, lng: 77.6407 },
}

/** Don't snap GPS to a neighbourhood farther than this (avoids Indiranagar for Marathahalli). */
const MAX_NEAREST_AREA_KM = 3.5

const LOCATION_ID_BY_AREA: Record<string, GlamzzoLocationId> = {
  Indiranagar: "blr_indiranagar",
  Koramangala: "blr_koramangala",
  "HSR Layout": "blr_hsr",
  "MG Road": "blr_other",
  Marathahalli: "blr_other",
  Whitefield: "blr_other",
  Jayanagar: "blr_other",
  "JP Nagar": "blr_other",
  "BTM Layout": "blr_other",
  Malleshwaram: "blr_other",
  Yelahanka: "blr_other",
  "Electronic City": "blr_other",
  Hebbal: "blr_other",
  Banashankari: "blr_other",
  Rajajinagar: "blr_other",
  Bellandur: "blr_other",
  "Sarjapur Road": "blr_other",
  "Kalyan Nagar": "blr_other",
}

export type GeoPosition = {
  latitude: number
  longitude: number
  accuracy?: number
}

export type NearestAreaResult = {
  areaLabel: string
  locationId: GlamzzoLocationId
  distanceKm: number
}

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function getSalonCoordinates(
  salon: Pick<Salon, "id" | "area" | "address" | "latitude" | "longitude">,
) {
  const resolved = resolveSalonCoordinates(salon)
  if (resolved) {
    return resolved
  }

  const cityCentroid = resolvePlaceCentroid(salon.area, salon.address)
  if (cityCentroid) {
    return cityCentroid
  }

  return {
    lat: DEFAULT_MAP_CENTER.latitude,
    lng: DEFAULT_MAP_CENTER.longitude,
  }
}

export function distanceToSalonKm(
  salon: Pick<Salon, "id" | "area" | "address" | "latitude" | "longitude">,
  latitude: number,
  longitude: number,
): number {
  const coords = getSalonCoordinates(salon)
  return haversineKm(latitude, longitude, coords.lat, coords.lng)
}

export function sortSalonsByDistance(
  list: Salon[],
  latitude: number,
  longitude: number
): Array<Salon & { distanceKm: number }> {
  return [...list]
    .map((salon) => ({
      ...salon,
      distanceKm: distanceToSalonKm(salon, latitude, longitude),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
}

export function resolveNearestArea(latitude: number, longitude: number): NearestAreaResult | null {
  const [best] = getNearestKnownAreas(latitude, longitude, 1)
  if (!best || best.distanceKm > MAX_NEAREST_AREA_KM) {
    return null
  }
  return best
}

/** Top N known neighbourhoods sorted by distance from GPS (not a hardcoded popular list). */
export function getNearestKnownAreas(
  latitude: number,
  longitude: number,
  limit = 3,
): NearestAreaResult[] {
  return Object.entries(AREA_COORDINATES)
    .map(([areaLabel, coords]) => ({
      areaLabel,
      locationId: LOCATION_ID_BY_AREA[areaLabel] ?? ("blr_other" as GlamzzoLocationId),
      distanceKm: haversineKm(latitude, longitude, coords.lat, coords.lng),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, Math.max(0, limit))
}

export type GeolocationErrorCode = "unsupported" | "denied" | "unavailable" | "timeout" | "unknown"

export class GeolocationRequestError extends Error {
  code: GeolocationErrorCode

  constructor(code: GeolocationErrorCode, message: string) {
    super(message)
    this.name = "GeolocationRequestError"
    this.code = code
  }
}

export function requestUserLocation(): Promise<GeoPosition> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new GeolocationRequestError("unsupported", "Location is only available in the browser.")
    )
  }
  if (!window.isSecureContext) {
    return Promise.reject(
      new GeolocationRequestError(
        "unsupported",
        "Location needs a secure connection (HTTPS) or localhost. Open the site via https:// or http://localhost."
      )
    )
  }
  if (!("geolocation" in navigator)) {
    return Promise.reject(
      new GeolocationRequestError(
        "unsupported",
        "Location is not supported in this browser."
      )
    )
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
      },
      (err) => {
        const code: GeolocationErrorCode =
          err.code === 1
            ? "denied"
            : err.code === 2
              ? "unavailable"
              : err.code === 3
                ? "timeout"
                : "unknown"
        const message =
          code === "denied"
            ? "Location permission was denied. Enable it in your browser settings to use Near me."
            : code === "timeout"
              ? "Could not detect your location in time. Try again."
              : code === "unavailable"
                ? "Your location could not be determined. Try again or pick an area manually."
                : "Could not detect your location."
        reject(new GeolocationRequestError(code, message))
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 120_000 }
    )
  })
}
