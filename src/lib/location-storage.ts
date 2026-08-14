import { requestUserLocation } from "@/lib/geo"
import type { ResolvedGpsLocation } from "@/lib/reverse-geocode"
import { resolveLocationFromGps } from "@/lib/reverse-geocode"
import {
  DEFAULT_FALLBACK_HERO_AREA,
  DEFAULT_FALLBACK_LOCATION_ID,
  GLAMZZO_LOCATION_KEY,
  getLocationById,
  type GlamzzoLocation,
  type StoredLocation,
} from "@/lib/location"
import { resolveBrowseCityFromStored, syncBrowseCityCookie } from "@/lib/location-city-cookie"
import { resolvePlaceCentroid } from "@/lib/salon-coordinates"

export const LOCATION_UPDATED_EVENT = "glamzzo-location-updated"

export type ParsedStoredLocation = {
  location: GlamzzoLocation
  stored: StoredLocation
}

function normalizeStored(parsed: Partial<StoredLocation>): StoredLocation | null {
  if (!parsed?.id) return null
  const stored: StoredLocation = {
    id: parsed.id,
    defaultFallback: parsed.defaultFallback,
    nearMe: parsed.nearMe,
    latitude: parsed.latitude,
    longitude: parsed.longitude,
    resolvedArea: parsed.resolvedArea,
    displayLabel: parsed.displayLabel,
    city: parsed.city,
    state: parsed.state,
    country: parsed.country,
    inServiceArea: parsed.inServiceArea,
  }
  // Legacy saves used "Near me" as override, prefer resolved area for display
  if (
    parsed.areaLabelOverride &&
    parsed.areaLabelOverride !== "Near me"
  ) {
    stored.areaLabelOverride = parsed.areaLabelOverride
  }
  if (stored.nearMe && stored.resolvedArea) {
    stored.areaLabelOverride = undefined
  } else if (parsed.areaLabelOverride === "Near me") {
    // Legacy: had label only, drop so UI uses real area from id
    stored.areaLabelOverride = undefined
    stored.nearMe = false
  }
  return stored
}

export function readStoredLocation(): ParsedStoredLocation | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(GLAMZZO_LOCATION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredLocation>
    const stored = normalizeStored(parsed)
    if (!stored) return null
    return { location: getLocationById(stored.id), stored }
  } catch {
    return null
  }
}

export function buildDefaultFallbackLocation(): StoredLocation {
  const centroid = resolvePlaceCentroid("Indiranagar", "Bengaluru")
  return {
    id: DEFAULT_FALLBACK_LOCATION_ID,
    areaLabelOverride: DEFAULT_FALLBACK_HERO_AREA,
    defaultFallback: true,
    ...(centroid
      ? { latitude: centroid.lat, longitude: centroid.lng }
      : {}),
  }
}

type GeolocationPermission = PermissionState | "unsupported"

async function queryGeolocationPermission(): Promise<GeolocationPermission> {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) {
    return "unsupported"
  }
  try {
    const status = await navigator.permissions.query({
      name: "geolocation" as PermissionName,
    })
    return status.state
  } catch {
    return "unsupported"
  }
}

async function applyGpsPosition(latitude: number, longitude: number): Promise<ParsedStoredLocation> {
  const resolved = await resolveLocationFromGps(latitude, longitude)
  const stored = buildStoredFromNearMe(resolved)
  writeStoredLocation(stored)
  return { location: getLocationById(resolved.locationId), stored }
}

/** Ask for location on first visit; falls back to Indiranagar, Bangalore when denied. */
export async function resolveInitialLocation(): Promise<ParsedStoredLocation> {
  await bootstrapBrowseLocation()
  return readStoredLocation() ?? {
    location: getLocationById(DEFAULT_FALLBACK_LOCATION_ID),
    stored: buildDefaultFallbackLocation(),
  }
}

/**
 * On landing: ask the browser for geolocation (native permission prompt) when
 * the visitor has not explicitly picked a city/area. Uses live GPS + reverse
 * geocode for Near me — does not open the location panel.
 */
export async function bootstrapBrowseLocation(): Promise<void> {
  if (typeof window === "undefined") return

  const existing = readStoredLocation()
  const hasGps = hasActiveNearMe(existing?.stored)
  const permission = await queryGeolocationPermission()

  // Respect an explicit city/area choice (not the auto Bengaluru fallback).
  const manualChoice =
    Boolean(existing) &&
    !hasGps &&
    existing!.stored.defaultFallback !== true

  if (manualChoice) {
    syncBrowseCityCookie(resolveBrowseCityFromStored(existing!.stored))
    // If the browser already granted permission, still upgrade to live Near me.
    if (permission !== "granted") return
  }

  if (permission === "denied") {
    if (!existing || existing.stored.defaultFallback === true) {
      writeStoredLocation(buildDefaultFallbackLocation())
    }
    return
  }

  try {
    // Triggers the browser's native location permission prompt when state is "prompt".
    const position = await requestUserLocation()
    await applyGpsPosition(position.latitude, position.longitude)
  } catch {
    if (!existing || existing.stored.defaultFallback === true) {
      writeStoredLocation(buildDefaultFallbackLocation())
    }
  }
}

export function buildStoredFromNearMe(resolved: ResolvedGpsLocation): StoredLocation {
  return {
    id: resolved.locationId,
    nearMe: true,
    latitude: resolved.latitude,
    longitude: resolved.longitude,
    displayLabel: resolved.displayLabel,
    city: resolved.city,
    state: resolved.state,
    country: resolved.country,
    inServiceArea: resolved.inServiceArea,
    resolvedArea: resolved.resolvedArea,
  }
}

export function writeStoredLocation(stored: StoredLocation): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(GLAMZZO_LOCATION_KEY, JSON.stringify(stored))
  } catch {
    // ignore storage errors
  }
  syncBrowseCityCookie(resolveBrowseCityFromStored(stored))
  window.dispatchEvent(new CustomEvent(LOCATION_UPDATED_EVENT))
}

export function clearNearMeCoordinates(): void {
  const current = readStoredLocation()
  if (!current) return
  writeStoredLocation({
    id: current.stored.id,
    areaLabelOverride: undefined,
    nearMe: false,
  })
}

export function hasActiveNearMe(stored: StoredLocation | null | undefined): boolean {
  return Boolean(
    stored?.nearMe &&
      typeof stored.latitude === "number" &&
      typeof stored.longitude === "number"
  )
}

export function buildExploreNearMeHref(
  latitude: number,
  longitude: number,
  extra?: { q?: string; category?: string }
): string {
  const sp = new URLSearchParams()
  sp.set("near", "1")
  sp.set("lat", latitude.toFixed(5))
  sp.set("lng", longitude.toFixed(5))
  if (extra?.q) sp.set("q", extra.q)
  if (extra?.category && extra.category !== "all") sp.set("category", extra.category)
  return `/explore?${sp.toString()}`
}

const EXPLORE_FILTER_PARAMS = [
  "category",
  "q",
  "sort",
  "price",
  "rating",
  "radius",
  "open",
] as const

/** Build `/explore` URL for a stored location, keeping non-location filters. */
export function buildExploreHrefForStoredLocation(
  stored: StoredLocation,
  currentSearch?: string | URLSearchParams,
): string {
  const current =
    typeof currentSearch === "string"
      ? new URLSearchParams(currentSearch.startsWith("?") ? currentSearch.slice(1) : currentSearch)
      : currentSearch
        ? new URLSearchParams(currentSearch)
        : new URLSearchParams()

  const sp = new URLSearchParams()
  for (const key of EXPLORE_FILTER_PARAMS) {
    const value = current.get(key)
    if (value) sp.set(key, value)
  }

  if (hasActiveNearMe(stored) && stored.latitude != null && stored.longitude != null) {
    sp.set("near", "1")
    sp.set("lat", stored.latitude.toFixed(5))
    sp.set("lng", stored.longitude.toFixed(5))
  } else {
    const city = resolveBrowseCityFromStored(stored)
    if (city) sp.set("city", city)
    const area = stored.areaLabelOverride?.trim()
    if (area && area.toLowerCase() !== city.toLowerCase()) {
      sp.set("area", area)
    }
  }

  const qs = sp.toString()
  return qs ? `/explore?${qs}` : "/explore"
}
