import { DEFAULT_MAP_CENTER } from "@/lib/maps/config"
import { haversineKm } from "@/lib/maps/haversine"
import type { Salon } from "@/types/salon"

/** CRM pins farther than this from the salon city are treated as stale / placeholder. */
const MAX_SALON_CITY_COORD_DRIFT_KM = 40

/** Approximate city centroids for distance when CRM map pins are missing. */
const CITY_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  jamnagar: { lat: 22.4707, lng: 70.0577 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  delhi: { lat: 28.6139, lng: 77.209 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  rajkot: { lat: 22.3039, lng: 70.8022 },
  surat: { lat: 21.1702, lng: 72.8311 },
  pune: { lat: 18.5204, lng: 73.8567 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  indiranagar: { lat: 12.9784, lng: 77.6408 },
  koramangala: { lat: 12.9352, lng: 77.6245 },
  "hsr layout": { lat: 12.9116, lng: 77.6476 },
  "mg road": { lat: 12.975, lng: 77.6063 },
}

const DEMO_SALON_COORDINATES: Record<string, { lat: number; lng: number }> = {
  s1: CITY_CENTROIDS.indiranagar,
  s2: CITY_CENTROIDS.koramangala,
  s3: CITY_CENTROIDS["hsr layout"],
  s4: CITY_CENTROIDS["mg road"],
}

function normalizePlaceKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ")
}

export function parseSalonCoordinate(value: unknown): number | undefined {
  if (value == null) return undefined

  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN

  if (!Number.isFinite(parsed) || parsed === 0) {
    return undefined
  }

  return parsed
}

export function salonHasExactCoordinates(
  salon: Pick<Salon, "latitude" | "longitude">,
): boolean {
  const latitude = parseSalonCoordinate(salon.latitude)
  const longitude = parseSalonCoordinate(salon.longitude)
  return latitude != null && longitude != null
}

function collectPlaceCandidates(...values: Array<string | null | undefined>): string[] {
  const keys: string[] = []

  for (const value of values) {
    if (!value?.trim()) {
      continue
    }

    const normalized = normalizePlaceKey(value)
    if (!keys.includes(normalized)) {
      keys.push(normalized)
    }

    const firstPart = normalized.split(",")[0]?.trim()
    if (firstPart && !keys.includes(firstPart)) {
      keys.push(firstPart)
    }

    for (const cityKey of Object.keys(CITY_CENTROIDS)) {
      if (normalized.includes(cityKey) && !keys.includes(cityKey)) {
        keys.push(cityKey)
      }
    }
  }

  return keys
}

function lookupCityCentroid(...values: Array<string | null | undefined>) {
  for (const key of collectPlaceCandidates(...values)) {
    const centroid = CITY_CENTROIDS[key]
    if (centroid) {
      return centroid
    }
  }

  return null
}

/** Resolve a city/area label to approximate coordinates for distance sorting. */
export function resolvePlaceCentroid(...values: Array<string | null | undefined>) {
  return lookupCityCentroid(...values)
}

function isBengaluruPlace(area: string) {
  const key = normalizePlaceKey(area)
  return (
    key === "bengaluru" ||
    key === "bangalore" ||
    key === "indiranagar" ||
    key === "koramangala" ||
    key === "hsr layout" ||
    key === "mg road" ||
    key.includes("bengaluru") ||
    key.includes("bangalore")
  )
}

function isDefaultBengaluruPin(lat: number, lng: number) {
  return (
    Math.abs(lat - DEFAULT_MAP_CENTER.latitude) < 0.05 &&
    Math.abs(lng - DEFAULT_MAP_CENTER.longitude) < 0.05
  )
}

function isInBengaluruMetro(lat: number, lng: number) {
  return lat >= 12.75 && lat <= 13.15 && lng >= 77.35 && lng <= 77.85
}

function isPlaceholderBengaluruPin(lat: number, lng: number) {
  return isDefaultBengaluruPin(lat, lng) || isInBengaluruMetro(lat, lng)
}

/** Best-effort coordinates for distance + map display. */
export function resolveSalonCoordinates(
  salon: Pick<Salon, "id" | "area" | "address" | "latitude" | "longitude">,
): { lat: number; lng: number } | null {
  const latitude = parseSalonCoordinate(salon.latitude)
  const longitude = parseSalonCoordinate(salon.longitude)
  const cityCentroid = lookupCityCentroid(salon.area, salon.address)

  if (latitude != null && longitude != null) {
    if (!isBengaluruPlace(salon.area) && cityCentroid) {
      const driftKm = haversineKm(latitude, longitude, cityCentroid.lat, cityCentroid.lng)
      if (
        isPlaceholderBengaluruPin(latitude, longitude) ||
        driftKm > MAX_SALON_CITY_COORD_DRIFT_KM
      ) {
        return cityCentroid
      }
    }

    return { lat: latitude, lng: longitude }
  }

  if (cityCentroid) {
    return cityCentroid
  }

  return DEMO_SALON_COORDINATES[salon.id] ?? null
}
