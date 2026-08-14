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
  "new delhi": { lat: 28.6139, lng: 77.209 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  rajkot: { lat: 22.3039, lng: 70.8022 },
  surat: { lat: 21.1702, lng: 72.8311 },
  vadodara: { lat: 22.3072, lng: 73.1812 },
  bhavnagar: { lat: 21.7645, lng: 72.1519 },
  gandhinagar: { lat: 23.2156, lng: 72.6369 },
  anand: { lat: 22.5645, lng: 72.9289 },
  pune: { lat: 18.5204, lng: 73.8567 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  indore: { lat: 22.7196, lng: 75.8577 },
  lucknow: { lat: 26.8467, lng: 80.9462 },
  chandigarh: { lat: 30.7333, lng: 76.7794 },
  goa: { lat: 15.2993, lng: 74.124 },
  mysuru: { lat: 12.2958, lng: 76.6394 },
  mangaluru: { lat: 12.9141, lng: 74.856 },
  indiranagar: { lat: 12.9784, lng: 77.6408 },
  koramangala: { lat: 12.9352, lng: 77.6245 },
  "hsr layout": { lat: 12.9116, lng: 77.6476 },
  "mg road": { lat: 12.975, lng: 77.6063 },
  marathahalli: { lat: 12.9591, lng: 77.6974 },
  whitefield: { lat: 12.9698, lng: 77.75 },
  jayanagar: { lat: 12.9308, lng: 77.5838 },
  "jp nagar": { lat: 12.9077, lng: 77.5857 },
  "btm layout": { lat: 12.9166, lng: 77.6101 },
  bellandur: { lat: 12.9304, lng: 77.6784 },
}

/** Full cities shown in location popular/nearby lists (not neighbourhood pins). */
const POPULAR_CITY_LABELS: Record<string, string> = {
  bengaluru: "Bengaluru",
  jamnagar: "Jamnagar",
  mumbai: "Mumbai",
  delhi: "Delhi",
  ahmedabad: "Ahmedabad",
  rajkot: "Rajkot",
  surat: "Surat",
  vadodara: "Vadodara",
  bhavnagar: "Bhavnagar",
  gandhinagar: "Gandhinagar",
  anand: "Anand",
  pune: "Pune",
  hyderabad: "Hyderabad",
  chennai: "Chennai",
  kolkata: "Kolkata",
  jaipur: "Jaipur",
  indore: "Indore",
  lucknow: "Lucknow",
  chandigarh: "Chandigarh",
  mysuru: "Mysuru",
  mangaluru: "Mangaluru",
}

export type NearbyPopularCity = {
  name: string
  distanceKm: number
}

/**
 * Cities nearest to a selected city / GPS point for the location picker.
 * Neighbourhood centroids (e.g. Indiranagar) are excluded.
 */
export function getNearestPopularCities(input: {
  city?: string | null
  latitude?: number | null
  longitude?: number | null
  excludeCity?: string | null
  limit?: number
}): NearbyPopularCity[] {
  const limit = input.limit ?? 5
  const origin =
    typeof input.latitude === "number" &&
    typeof input.longitude === "number" &&
    Number.isFinite(input.latitude) &&
    Number.isFinite(input.longitude)
      ? { lat: input.latitude, lng: input.longitude }
      : lookupCityCentroid(input.city)

  if (!origin) {
    return Object.values(POPULAR_CITY_LABELS)
      .slice(0, limit)
      .map((name) => ({ name, distanceKm: 0 }))
  }

  const excludeKey = normalizePlaceKey(input.excludeCity || input.city || "")
  const excludeAliases = new Set(
    [excludeKey, excludeKey === "bangalore" ? "bengaluru" : "", excludeKey === "bengaluru" ? "bangalore" : ""]
      .filter(Boolean),
  )

  return Object.entries(POPULAR_CITY_LABELS)
    .filter(([key]) => !excludeAliases.has(key))
    .map(([key, name]) => {
      const centroid = CITY_CENTROIDS[key]
      if (!centroid) return null
      return {
        name,
        distanceKm: haversineKm(origin.lat, origin.lng, centroid.lat, centroid.lng),
      }
    })
    .filter((item): item is NearbyPopularCity => item != null)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit)
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
  salon: Pick<Salon, "id" | "area" | "address" | "city" | "latitude" | "longitude">,
): { lat: number; lng: number } | null {
  const latitude = parseSalonCoordinate(salon.latitude)
  const longitude = parseSalonCoordinate(salon.longitude)
  const cityCentroid = lookupCityCentroid(salon.city, salon.area, salon.address)

  if (latitude != null && longitude != null) {
    if (!isBengaluruPlace(salon.city || salon.area) && cityCentroid) {
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
