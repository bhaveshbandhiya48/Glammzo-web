export type GlamzzoLocationId = "blr_indiranagar" | "blr_koramangala" | "blr_hsr" | "blr_other"

export type GlamzzoLocation = {
  id: GlamzzoLocationId
  label: string
  areaLabel: string
}

export const GLAMZZO_LOCATION_KEY = "glamzzo_location"

export type StoredLocation = {
  id: GlamzzoLocationId
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

/** Label shown in the header / location picker (uses GPS reverse geocode when Near me is active). */
export function formatStoredLocationLabel(
  loc: GlamzzoLocation,
  stored?: Pick<
    StoredLocation,
    "areaLabelOverride" | "nearMe" | "resolvedArea" | "displayLabel" | "inServiceArea"
  > | null
): string {
  if (stored?.nearMe && stored.displayLabel) {
    return stored.displayLabel
  }
  if (stored?.nearMe && stored.inServiceArea && stored.resolvedArea) {
    return `Bengaluru · ${stored.resolvedArea}`
  }
  if (stored?.areaLabelOverride && stored.areaLabelOverride !== "Near me") {
    return formatLocationLabel(loc, stored.areaLabelOverride)
  }
  return formatLocationLabel(loc)
}

