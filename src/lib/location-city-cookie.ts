import { shouldUseSecureCookies } from "@/lib/auth/cookie-options"
import {
  DEFAULT_CITY_NAME,
  formatBrowseSalonsCityLabel,
  getLocationById,
  type StoredLocation,
} from "@/lib/location"

export const GLAMZZO_CITY_COOKIE = "glamzzo_city"
const CITY_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function resolveBrowseCityFromStored(stored: StoredLocation): string {
  return formatBrowseSalonsCityLabel(getLocationById(stored.id), stored) || DEFAULT_CITY_NAME
}

export function syncBrowseCityCookie(city: string) {
  if (typeof document === "undefined") return
  const value = encodeURIComponent(city.trim() || DEFAULT_CITY_NAME)
  const secure = shouldUseSecureCookies() ? "; Secure" : ""
  document.cookie = `${GLAMZZO_CITY_COOKIE}=${value}; Path=/; Max-Age=${CITY_COOKIE_MAX_AGE}; SameSite=Lax${secure}`
}
