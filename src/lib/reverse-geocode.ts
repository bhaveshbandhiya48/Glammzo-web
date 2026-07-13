import { haversineKm, resolveNearestArea, type NearestAreaResult } from "@/lib/geo"
import type { GlamzzoLocationId } from "@/lib/location"

/** Bengaluru metro, salons on Glammzo are listed here */
const BENGALURU_CENTER = { lat: 12.9716, lng: 77.5946 }
const BENGALURU_SERVICE_RADIUS_KM = 40

export type ResolvedGpsLocation = {
  latitude: number
  longitude: number
  /** Human-readable place, e.g. "Jamnagar, Gujarat" */
  displayLabel: string
  city?: string
  state?: string
  country?: string
  inServiceArea: boolean
  /** Nearest Bengaluru neighbourhood, only when inServiceArea */
  nearestArea?: NearestAreaResult
  locationId: GlamzzoLocationId
}

type NominatimAddress = {
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

export async function reverseGeocodeClient(
  latitude: number,
  longitude: number
): Promise<{ displayLabel: string; city?: string; state?: string; country?: string }> {
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
  const displayLabel =
    buildDisplayLabelFromAddress(data.address) ||
    data.display_name?.split(",").slice(0, 2).join(",").trim() ||
    "Your location"

  return { displayLabel, city, state, country }
}

export async function resolveLocationFromGps(
  latitude: number,
  longitude: number
): Promise<ResolvedGpsLocation> {
  const geo = await reverseGeocodeClient(latitude, longitude)
  const inServiceArea = isInBengaluruServiceArea(latitude, longitude)

  let nearestArea: NearestAreaResult | undefined
  let locationId: GlamzzoLocationId = "blr_other"

  if (inServiceArea) {
    nearestArea = resolveNearestArea(latitude, longitude)
    locationId = nearestArea.locationId
    return {
      latitude,
      longitude,
      displayLabel: `Bengaluru · ${nearestArea.areaLabel}`,
      city: geo.city ?? "Bengaluru",
      state: geo.state ?? "Karnataka",
      country: geo.country ?? "India",
      inServiceArea: true,
      nearestArea,
      locationId,
    }
  }

  return {
    latitude,
    longitude,
    displayLabel: geo.displayLabel,
    city: geo.city,
    state: geo.state,
    country: geo.country,
    inServiceArea: false,
    locationId,
  }
}
