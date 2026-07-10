export type GlamzzoLocationId = "blr_indiranagar" | "blr_koramangala" | "blr_hsr" | "blr_other"

export type GlamzzoLocation = {
  id: GlamzzoLocationId
  label: string
  areaLabel: string
}

export const GLAMZZO_LOCATION_KEY = "glamzzo_location"

export const DEFAULT_FALLBACK_LOCATION_ID: GlamzzoLocationId = "blr_indiranagar"
export const DEFAULT_FALLBACK_HERO_AREA = "Indiranagar, Bangalore"
export const DEFAULT_FALLBACK_HEADER_LABEL = "Bangalore"
export const DEFAULT_CITY_NAME = "Bengaluru"

export type StoredLocation = {
  id: GlamzzoLocationId
  /** Set when the user denies location on first visit — shows city-only header + default hero area */
  defaultFallback?: boolean
  /** Used for “Near me” or custom neighbourhoods */
  areaLabelOverride?: string
  /** Set when the user chooses Near me with geolocation */
  nearMe?: boolean
  latitude?: number
  longitude?: number
  /** Nearest Bengaluru area — when user is in Bengaluru service zone */
  resolvedArea?: string
  /** Full place name from GPS reverse geocode, e.g. "Jamnagar, Gujarat" */
  displayLabel?: string
  city?: string
  state?: string
  country?: string
  /** True when coordinates fall within Bengaluru metro (salons available nearby) */
  inServiceArea?: boolean
}

export const GLAMZZO_LOCATIONS: GlamzzoLocation[] = [
  {
    id: "blr_indiranagar",
    label: "Bengaluru",
    areaLabel: "Indiranagar",
  },
  {
    id: "blr_koramangala",
    label: "Bengaluru",
    areaLabel: "Koramangala",
  },
  {
    id: "blr_hsr",
    label: "Bengaluru",
    areaLabel: "HSR Layout",
  },
  {
    id: "blr_other",
    label: "Bengaluru",
    areaLabel: "Other neighbourhood",
  },
]

export function getLocationById(id: GlamzzoLocationId | string | null | undefined): GlamzzoLocation {
  const fallback = GLAMZZO_LOCATIONS[0]!
  if (!id) return fallback
  const found = GLAMZZO_LOCATIONS.find((loc) => loc.id === id)
  return found ?? fallback
}

export function formatLocationLabel(loc: GlamzzoLocation, override?: string) {
  return `${loc.label} · ${override ?? loc.areaLabel}`
}

/** Area label for the hero search bar. */
export function formatHeroAreaLabel(
  loc: GlamzzoLocation,
  stored?: Pick<
    StoredLocation,
    | "areaLabelOverride"
    | "nearMe"
    | "resolvedArea"
    | "displayLabel"
    | "inServiceArea"
    | "defaultFallback"
  > | null
): string {
  if (stored?.nearMe) {
    if (stored.inServiceArea && stored.resolvedArea) return stored.resolvedArea
    if (stored.displayLabel) return stored.displayLabel
  }
  if (stored?.defaultFallback) return DEFAULT_FALLBACK_HERO_AREA
  if (stored?.areaLabelOverride) return stored.areaLabelOverride
  return loc.areaLabel
}

/** Label shown in the header / location picker (uses GPS reverse geocode when Near me is active). */
export function formatStoredLocationLabel(
  loc: GlamzzoLocation,
  stored?: Pick<
    StoredLocation,
    | "areaLabelOverride"
    | "nearMe"
    | "resolvedArea"
    | "displayLabel"
    | "city"
    | "inServiceArea"
    | "defaultFallback"
  > | null
): string {
  if (stored?.defaultFallback) {
    return DEFAULT_FALLBACK_HEADER_LABEL
  }
  if (stored?.nearMe && stored.displayLabel) {
    return stored.displayLabel
  }
  if (stored?.nearMe && stored.inServiceArea && stored.resolvedArea) {
    const city = stored.city ?? loc.label
    return `${city} · ${stored.resolvedArea}`
  }
  if (stored?.areaLabelOverride && stored.areaLabelOverride !== "Near me") {
    return formatLocationLabel(loc, stored.areaLabelOverride)
  }
  return formatLocationLabel(loc)
}

/** City name for “Browse salons in …” links (hero card, CTAs). */
export function formatBrowseSalonsCityLabel(
  loc: GlamzzoLocation,
  stored?: Pick<
    StoredLocation,
    | "nearMe"
    | "city"
    | "displayLabel"
    | "inServiceArea"
    | "defaultFallback"
  > | null
): string {
  if (stored?.defaultFallback) {
    return DEFAULT_CITY_NAME
  }
  if (stored?.nearMe) {
    if (stored.inServiceArea) return stored.city ?? loc.label
    if (stored.city) return stored.city
    if (stored.displayLabel) {
      const [locality] = stored.displayLabel.split(",")
      return locality?.trim() || stored.displayLabel
    }
  }
  return loc.label
}

/** Hero badge copy — “Now live in {city}”. */
export function formatLiveInCityBadge(city: string) {
  return `Now live in ${city}`
}

/** Location search placeholder — “Area in {city}”. */
export function formatAreaInCityPlaceholder(city: string) {
  return `Area in ${city}`
}

