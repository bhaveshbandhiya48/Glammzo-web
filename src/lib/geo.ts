import type { GlamzzoLocationId } from "@/lib/location"
import type { Salon } from "@/types/salon"

/** Approximate centroids for Bengaluru areas (demo data). */
const AREA_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Indiranagar: { lat: 12.9784, lng: 77.6408 },
  Koramangala: { lat: 12.9352, lng: 77.6245 },
  "HSR Layout": { lat: 12.9116, lng: 77.6476 },
  "MG Road": { lat: 12.975, lng: 77.6063 },
}

const SALON_COORDINATES: Record<string, { lat: number; lng: number }> = {
  s1: AREA_COORDINATES.Indiranagar,
  s2: AREA_COORDINATES.Koramangala,
  s3: AREA_COORDINATES["HSR Layout"],
  s4: AREA_COORDINATES["MG Road"],
}

const LOCATION_ID_BY_AREA: Record<string, GlamzzoLocationId> = {
  Indiranagar: "blr_indiranagar",
  Koramangala: "blr_koramangala",
  "HSR Layout": "blr_hsr",
  "MG Road": "blr_other",
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

export function getSalonCoordinates(salonId: string, area: string) {
  return (
    SALON_COORDINATES[salonId] ??
    AREA_COORDINATES[area] ?? { lat: 12.9716, lng: 77.5946 }
  )
}

export function distanceToSalonKm(salon: Salon, latitude: number, longitude: number): number {
  const coords = getSalonCoordinates(salon.id, salon.area)
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

export function resolveNearestArea(latitude: number, longitude: number): NearestAreaResult {
  let best: NearestAreaResult = {
    areaLabel: "Indiranagar",
    locationId: "blr_indiranagar",
    distanceKm: Infinity,
  }

  for (const [areaLabel, coords] of Object.entries(AREA_COORDINATES)) {
    const distanceKm = haversineKm(latitude, longitude, coords.lat, coords.lng)
    if (distanceKm < best.distanceKm) {
      best = {
        areaLabel,
        locationId: LOCATION_ID_BY_AREA[areaLabel] ?? "blr_other",
        distanceKm,
      }
    }
  }

  return best
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
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 }
    )
  })
}
