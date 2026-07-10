/** Default map center when geolocation is denied (Bengaluru). */
export const DEFAULT_MAP_CENTER = {
  latitude: 12.9716,
  longitude: 77.5946,
  label: "Bengaluru",
} as const

/** Default nearby search radius in kilometres. */
export const DEFAULT_NEARBY_RADIUS_KM = 10

export const MAX_NEARBY_RADIUS_KM = 25

export const NEARBY_SALON_LIMIT = 80

export function getGoogleMapsApiKey() {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? ""
}

export function isGoogleMapsConfigured() {
  return getGoogleMapsApiKey().length > 0
}
