import { haversineKm } from "@/lib/geo"
import type { GlamzzoLocationId } from "@/lib/location"

/** Bengaluru metro — used only to decide if we normalize the city label. */
const BENGALURU_CENTER = { lat: 12.9716, lng: 77.5946 }
const BENGALURU_SERVICE_RADIUS_KM = 40

export type ResolvedGpsLocation = {
  latitude: number
  longitude: number
  /** Human-readable place from live reverse geocode */
  displayLabel: string
  city?: string
  state?: string
  country?: string
  /** Neighbourhood / suburb from reverse geocode (not from our area list) */
  resolvedArea?: string
  inServiceArea: boolean
  locationId: GlamzzoLocationId
}

type NominatimAddress = {
  suburb?: string
  neighbourhood?: string
  quarter?: string
  residential?: string
  city_district?: string
  county?: string
  city?: string
  town?: string
  village?: string
  state_district?: string
  state?: string
  country?: string
}

type NominatimReverseResponse = {
  address?: NominatimAddress
  display_name?: string
}

export function isInBengaluruServiceArea(latitude: number, longitude: number): boolean {
  return (
    haversineKm(latitude, longitude, BENGALURU_CENTER.lat, BENGALURU_CENTER.lng) <=
    BENGALURU_SERVICE_RADIUS_KM
  )
}

function pickLocality(address: NominatimAddress): string | undefined {
  return address.city ?? address.town ?? address.village ?? address.state_district
}

function pickNeighbourhood(address: NominatimAddress): string | undefined {
  return (
    address.suburb ??
    address.neighbourhood ??
    address.quarter ??
    address.residential ??
    address.city_district
  )
}

function titleCaseArea(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => {
      if (/^[A-Z]{2,}$/.test(part)) return part
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    })
    .join(" ")
}

function isBengaluruLocality(value: string | undefined): boolean {
  if (!value) return false
  const normalized = value.trim().toLowerCase()
  return (
    normalized === "bengaluru" ||
    normalized === "bangalore" ||
    normalized.includes("bengaluru") ||
    normalized.includes("bangalore")
  )
}

export function buildDisplayLabelFromAddress(address: NominatimAddress): string {
  const locality = pickLocality(address)
  const state = address.state
  const country = address.country

  if (locality && state) return `${locality}, ${state}`
  if (locality && country) return `${locality}, ${country}`
  if (state && country) return `${state}, ${country}`
  if (locality) return locality
  if (state) return state
  return country ?? "Your location"
}

function looksLikeStreetOrPoi(value: string): boolean {
  const lower = value.toLowerCase()
  return (
    /^\d/.test(value) ||
    /^\d{6}$/.test(value) ||
    /\b(road|rd|street|st|cross|lane|marg|highway|flyover|bus stop|metro)\b/i.test(
      lower,
    )
  )
}

/** Prefer a neighbourhood token from Nominatim's comma-separated display_name. */
function neighbourhoodFromDisplayName(
  displayName: string | undefined,
  city?: string,
): string | undefined {
  if (!displayName) return undefined
  const parts = displayName
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
  if (parts.length < 2) return undefined

  const cityIdx = parts.findIndex(
    (part) =>
      isBengaluruLocality(part) ||
      (city != null && part.toLowerCase() === city.toLowerCase()),
  )

  const candidates =
    cityIdx > 0 ? parts.slice(0, cityIdx).reverse() : [...parts].reverse()

  for (const part of candidates) {
    const lower = part.toLowerCase()
    if (isBengaluruLocality(part)) continue
    if (city && lower === city.toLowerCase()) continue
    if (lower === "india" || lower === "karnataka") continue
    if (looksLikeStreetOrPoi(part)) continue
    if (part.length < 3 || part.length > 48) continue
    return titleCaseArea(part)
  }
  return undefined
}

export async function reverseGeocodeClient(
  latitude: number,
  longitude: number
): Promise<{
  displayLabel: string
  city?: string
  state?: string
  country?: string
  neighbourhood?: string
}> {
  const res = await fetch(
    `/api/location/reverse?lat=${encodeURIComponent(latitude)}&lng=${encodeURIComponent(longitude)}`
  )

  if (!res.ok) {
    throw new Error("Could not look up your address from coordinates.")
  }

  const data = (await res.json()) as NominatimReverseResponse & { error?: string }
  if (data.error || !data.address) {
    throw new Error(data.error ?? "No address found for your location.")
  }

  const city = pickLocality(data.address)
  const state = data.address.state
  const country = data.address.country
  const neighbourhoodRaw = pickNeighbourhood(data.address)
  const neighbourhood =
    (neighbourhoodRaw ? titleCaseArea(neighbourhoodRaw) : undefined) ||
    neighbourhoodFromDisplayName(data.display_name, city)
  const displayLabel =
    buildDisplayLabelFromAddress(data.address) ||
    data.display_name?.split(",").slice(0, 2).join(",").trim() ||
    "Your location"

  return { displayLabel, city, state, country, neighbourhood }
}

/**
 * Resolve Near me from live GPS + reverse geocode only.
 * Does not snap to our curated salon-area list.
 */
export async function resolveLocationFromGps(
  latitude: number,
  longitude: number
): Promise<ResolvedGpsLocation> {
  const geo = await reverseGeocodeClient(latitude, longitude)
  const inServiceArea =
    isInBengaluruServiceArea(latitude, longitude) || isBengaluruLocality(geo.city)

  if (inServiceArea) {
    const area = geo.neighbourhood
    return {
      latitude,
      longitude,
      displayLabel: area ? `Bengaluru · ${area}` : geo.displayLabel || "Bengaluru",
      city: "Bengaluru",
      state: geo.state ?? "Karnataka",
      country: geo.country ?? "India",
      resolvedArea: area,
      inServiceArea: true,
      locationId: "blr_other",
    }
  }

  return {
    latitude,
    longitude,
    displayLabel: geo.displayLabel,
    city: geo.city,
    state: geo.state,
    country: geo.country,
    resolvedArea: geo.neighbourhood,
    inServiceArea: false,
    locationId: "blr_other",
  }
}
